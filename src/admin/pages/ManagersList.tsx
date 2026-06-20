import { useEffect, useState } from "react";
import { supabase as supabaseTyped } from "@/lib/supabaseClient";
const supabase: any = supabaseTyped;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, Pencil, Briefcase, TrendingUp, Check, X } from "lucide-react";
import { AvatarUpload } from "../components/AvatarUpload";

export default function ManagersList() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [requests, setRequests] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    const [{ data: traders, error: tErr }, { data: subs }] = await Promise.all([
      supabase.from("expert_traders").select("*").order("sort_order", { ascending: true }),
      supabase.from("copy_subscriptions").select("*").eq("status", "pending").order("created_at", { ascending: false }),
    ]);
    if (tErr) toast.error(tErr.message);

    // Enrich subscription requests
    const userIds = Array.from(new Set((subs ?? []).map((s: any) => s.user_id).filter(Boolean)));
    const traderIds = Array.from(new Set((subs ?? []).map((s: any) => s.trader_id).filter(Boolean)));
    let pmap: Record<string, any> = {};
    let tmap: Record<string, any> = {};
    if (userIds.length) {
      const { data: ps } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds);
      (ps ?? []).forEach((p: any) => { pmap[p.user_id] = p; });
    }
    if (traderIds.length) {
      const { data: ts } = await supabase.from("expert_traders").select("id, name, handle").in("id", traderIds);
      (ts ?? []).forEach((t: any) => { tmap[t.id] = t; });
    }
    // trader_id may belong to a hardcoded (non-DB) expert — fall back to the static list for display.
    const hardcodedMap: Record<string, any> = {};
    HARDCODED_EXPERTS.forEach((h: any) => { hardcodedMap[h.id] = h; });

    setRequests((subs ?? []).map((s: any) => ({
      ...s,
      profile: pmap[s.user_id],
      trader: tmap[s.trader_id] ?? hardcodedMap[s.trader_id] ?? null,
      isHardcodedTrader: !tmap[s.trader_id] && !!hardcodedMap[s.trader_id],
    })));
    setRows(traders ?? []);
    setLoading(false);
  };

  useEffect(() => { document.title = "Admin · Expert Traders"; load(); }, []);

  const assign = async (req: any) => {
    const { error } = await supabase.from("copy_subscriptions").update({ status: "active" }).eq("id", req.id);
    if (error) return toast.error(error.message);

    // Only link up expert_traders-dependent records when the trader is a real DB row.
    // Hardcoded experts have no row in expert_traders, so user_experts.expert_id (uuid FK)
    // and profiles.assigned_trader_id would fail or point at nothing real.
    if (!req.isHardcodedTrader) {
      await supabase.from("user_experts").insert({
        user_id: req.user_id, expert_id: req.trader_id, is_copying: true, deposit_confirmed: false,
      });
      await supabase.from("profiles").update({ assigned_trader_id: req.trader_id, assigned_expert_id: req.trader_id }).eq("user_id", req.user_id);
    } else {
      toast.info("Assigned a non-DB expert — add them to Expert Traders to fully link the account.");
    }

    toast.success("Subscription assigned");
    load();
  };

  const decline = async (req: any) => {
    const { error } = await supabase.from("copy_subscriptions").update({ status: "declined" }).eq("id", req.id);
    if (error) return toast.error(error.message);
    toast.success("Request declined");
    load();
  };

  const remove = async (m: any) => {
    if (!confirm(`Remove ${m.name}?`)) return;
    const { error } = await supabase.from("expert_traders").delete().eq("id", m.id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  const save = async () => {
    if (!editing) return;
    const { error } = await supabase.from("expert_traders").update({
      name: editing.name,
      handle: editing.handle,
      avatar_url: editing.avatar_url,
      specialty: editing.specialty,
      win_rate: Number(editing.win_rate || 0),
      total_profit_usd: Number(editing.total_profit_usd || 0),
      followers: Number(editing.followers || 0),
      min_copy_amount: Number(editing.min_copy_amount || 0),
      is_active: editing.is_active,
      sort_order: Number(editing.sort_order || 0),
    } as any).eq("id", editing.id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Expert Traders</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">{rows.length} total · {requests.length} pending request{requests.length === 1 ? "" : "s"}</p>
      </div>

      {requests.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Copy-Expert Requests</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.profile?.full_name || r.profile?.email || "Unknown"}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    → {r.trader?.name || "—"} {r.trader?.handle ? `(@${r.trader.handle})` : ""}
                    {r.isHardcodedTrader && <span className="ml-1 text-[10px] text-amber-500">(not in DB)</span>}
                  </p>
                  {r.plan_name && (
                    <p className="text-[10px] text-muted-foreground">
                      {r.plan_name}{r.plan_amount ? ` · $${Number(r.plan_amount).toLocaleString()}` : ""}
                      {r.recurring_monthly === "true" ? " · recurring" : ""}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => assign(r)}><Check className="mr-1 h-3.5 w-3.5" />Assign</Button>
                  <Button size="sm" variant="destructive" onClick={() => decline(r)}><X className="mr-1 h-3.5 w-3.5" />Decline</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No traders yet</p>
        ) : rows.map((m) => (
          <Card key={m.id}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 shrink-0 rounded-full overflow-hidden">
                  {m.avatar_url
                    ? <AvatarImage src={m.avatar_url} className="object-cover" />
                    : <AvatarFallback className="bg-fuchsia-500/10 text-fuchsia-500">
                        <Briefcase className="h-5 w-5" />
                      </AvatarFallback>}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{m.handle}</p>
                  {m.specialty && <p className="truncate text-[11px] text-muted-foreground">{m.specialty}</p>}
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                    <Stat label="Win Rate" value={`${m.win_rate || 0}%`} accent="text-emerald-500" />
                    <Stat label="Followers" value={`${Number(m.followers || 0).toLocaleString()}`} accent="text-amber-500" />
                    <Stat label="Profit" value={`$${Number(m.total_profit_usd || 0).toLocaleString()}`} accent="text-sky-500" />
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing({ ...m })}>
                      <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(m)}>
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> Edit Trader</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Handle</Label><Input value={editing.handle ?? ""} onChange={(e) => setEditing({ ...editing, handle: e.target.value })} /></div>
              </div>
              <AvatarUpload value={editing.avatar_url} onChange={(url) => setEditing({ ...editing, avatar_url: url })} label="Avatar" pathPrefix="traders" />
              <div><Label>Specialty</Label><Input value={editing.specialty ?? ""} onChange={(e) => setEditing({ ...editing, specialty: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Win Rate %</Label><Input type="number" value={editing.win_rate ?? 0} onChange={(e) => setEditing({ ...editing, win_rate: e.target.value })} /></div>
                <div><Label>Total Profit USD</Label><Input type="number" value={editing.total_profit_usd ?? 0} onChange={(e) => setEditing({ ...editing, total_profit_usd: e.target.value })} /></div>
                <div><Label>Followers</Label><Input type="number" value={editing.followers ?? 0} onChange={(e) => setEditing({ ...editing, followers: e.target.value })} /></div>
                <div><Label>Min Copy Amount</Label><Input type="number" value={editing.min_copy_amount ?? 0} onChange={(e) => setEditing({ ...editing, min_copy_amount: e.target.value })} /></div>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <Label>Active</Label>
                <Switch checked={!!editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              </div>
              <div><Label>Sort Order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-md border border-border p-1.5">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-xs font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
