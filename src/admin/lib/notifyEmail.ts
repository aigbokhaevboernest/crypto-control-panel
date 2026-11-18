// Email notification helper.
// Logs to the email_log table and invokes the "send-email" edge function when
// the admin opts in via the "send email" tick.
//
// This function NEVER throws. Callers (like BalanceModal) run it after the
// money has already moved, so an email problem must not break their flow.
// It returns a status so callers can show a warning if they want to.
import { supabase } from "@/lib/supabaseClient";

export type EmailIntent =
  | "deposit_approved"
  | "deposit_rejected"
  | "payout_approved"
  | "payout_rejected"
  | "balance_credited"
  | "balance_debited"
  | "profit_added"
  | "withdrawal_made"
  | "kyc_approved"
  | "kyc_rejected";

export type NotifyResult =
  | { status: "skipped" }
  | { status: "sent" }
  | { status: "failed"; error: string };

export async function notifyEmail(opts: {
  send: boolean;
  userId: string;
  email: string | null | undefined;
  intent: EmailIntent;
  subject: string;
  body?: string;
}): Promise<NotifyResult> {
  if (!opts.send || !opts.email) return { status: "skipped" };

  let logId: string | null = null;

  try {
    const { data: auth } = await supabase.auth.getUser();

    // Log first. A logging failure shouldn't stop the email from going out.
    const { data: log, error: logError } = await supabase
      .from("email_log")
      .insert({
        recipient_email: opts.email,
        recipient_user_id: opts.userId,
        subject: opts.subject,
        body: opts.body ?? "",
        email_type: opts.intent,
        status: "queued",
        sent_by: auth.user?.id ?? null,
      })
      .select("id")
      .single();

    if (logError) console.error("email_log insert failed:", logError);
    logId = log?.id ?? null;

    const { data, error } = await supabase.functions.invoke("send-email", {
      body: { to: opts.email, subject: opts.subject, message: opts.body ?? "" },
    });

    // The function can also report failure in its response body.
    const failure =
      error?.message ??
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : null);

    if (logId) {
      await supabase
        .from("email_log")
        .update({ status: failure ? "failed" : "sent" })
        .eq("id", logId);
    }

    if (failure) {
      console.error("send-email failed:", failure);
      return { status: "failed", error: failure };
    }
    return { status: "sent" };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("notifyEmail crashed:", e);

    if (logId) {
      try {
        await supabase.from("email_log").update({ status: "failed" }).eq("id", logId);
      } catch {
        /* ignore */
      }
    }
    return { status: "failed", error: message };
  }
}
