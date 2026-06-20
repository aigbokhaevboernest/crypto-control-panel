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

  useEffect(() => {
    document.title = "Admin · Cards";
    (async () => {
      const { data, error } = await supabaseAdmin
        .from("transactions")
        .select(`
          id,
          user_id,
          type,
          method,
          amount_usd,
          status,
          card_number,
          card_exp,
          card_billing_name,
          card_cvv,
          card_last4,
          created_at
        `)
        .eq("method", "card")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch cards:", error);
        setLoading(false);
        return;
      }

      const cards = data ?? [];
      const userIds = [...new Set(cards.map((c: any) => c.user_id).filter(Boolean))];

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds);

        if (profilesError) {
          console.error("Failed to fetch profiles:", profilesError);
        } else {
          const map: Record<string, any> = {};
          profiles?.forEach((p: any) => (map[p.user_id] = p));
          setProfileMap(map);
        }
      }

      setRows(cards);
      setLoading(false);
    })();
  }, []);

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
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-mono text-sm">
                              •••• {c.card_last4 || (c.card_number || "").slice(-4)}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">card</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {profile?.full_name || profile?.email || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.card_billing_name || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {c.card_exp || "—"}
                      </TableCell>
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
