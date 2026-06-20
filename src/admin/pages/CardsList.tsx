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
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

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
      // DEBUG: fetch everything, no filter, so we can see what's really there
      const { data: allRows, error: allError } = await supabaseAdmin
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (allError) {
        setPageError(`Query failed: ${allError.message}`);
        setLoading(false);
        return;
      }

      const total = allRows?.length ?? 0;
      const methods = [...new Set((allRows ?? []).map((r: any) => r.method))];
      const types = [...new Set((allRows ?? []).map((r: any) => r.type))];
      const sampleKeys = allRows?.[0] ? Object.keys(allRows[0]) : [];

      setDebugInfo(
        `Total rows in transactions (last 10): ${total}\n` +
        `Distinct "method" values: ${JSON.stringify(methods)}\n` +
        `Distinct "type" values: ${JSON.stringify(types)}\n` +
        `Columns present: ${sampleKeys.join(", ")}`
      );

      const cards = (allRows ?? []).filter((r: any) => r.method === "card");
      setRows(cards);
      setLoading(false);

      const userIds = [...new Set(cards.map((c: any) => c.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds);

        if (!profilesError) {
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

      {debugInfo && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs whitespace-pre-wrap font-mono">
          {debugInfo}
        </div>
      )}

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
                  const holder = c.card_billing_name ?? c.cardholder_name ?? c.card_holder ?? "—";
                  const last4 = c.card_last4 || (c.card_number || "").slice(-4);
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
                      <TableCell className="text-sm">{holder}</TableCell>
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
