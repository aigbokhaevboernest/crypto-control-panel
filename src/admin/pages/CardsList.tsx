import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "../components/StatusBadge";
import { CreditCard } from "lucide-react";

export default function CardsList() {
  const [rows, setRows] = useState<any[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Admin · Cards";

    if (!supabaseAdmin) {
      setPageError(
        "Admin client not configured — VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY is missing."
      );
      setLoading(false);
      return;
    }

    (async () => {
      const { data: cards, error: cardsError } = await supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("method", "Credit Card")
        .order("created_at", { ascending: false });

      if (cardsError) {
        setPageError(`Cards query failed: ${cardsError.message}`);
        setLoading(false);
        return;
      }

      setRows(cards ?? []);
      setLoading(false);

      const userIds = [...new Set((cards ?? []).map((c: any) => c.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds);

        if (profilesError) {
          console.error("Profile fetch failed (cards still shown):", profilesError.message);
        } else {
          const map: Record<string, any> = {};
          profiles?.forEach((p: any) => (map[p.user_id] = p));
          setProfileMap(map);
        }
      }
    })();
  }, []);

  if (pageError) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold text-red-500">Error loading cards</h2>
        <pre className="mt-2 text-xs whitespace-pre-wrap text-muted-foreground bg-muted p-3 rounded">
          {pageError}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Cards</h1>
        <p className="text-sm text-muted-foreground">{rows.length} cards on file</p>
      </div>
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Holder</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No cards
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((c) => {
                  const profile = profileMap[c.user_id] || {};
                  const last4 = (c.card_number || "").slice(-4);
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <p className="font-mono text-sm">•••• {last4 || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {profile?.full_name || profile?.email || "—"}
                      </TableCell>
                      <TableCell className="text-sm">{c.card_billing_name || "—"}</TableCell>
                      <TableCell className="font-mono text-sm">{c.card_exp || "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
