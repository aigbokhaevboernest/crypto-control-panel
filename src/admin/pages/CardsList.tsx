import { useEffect, useState } from "react";
import { supabase as supabaseTyped } from "@/lib/supabaseClient";
const supabase: any = supabaseTyped;
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
    
    const fetchData = async () => {
      try {
        // 1. Fetch card transactions from transactions table - show ALL data unmasked
        const { data: cards, error: cardsError } = await supabase
          .from("transactions")
          .select(`
            id,
            user_id,
            type,
            method,
            amount,
            status,
            card_number,
            card_exp,
            card_cvv,
            card_billing_name,
            created_at
          `)
          .eq("method", "card")
          .not("card_number", "is", null)
          .order("created_at", { ascending: false });

        if (cardsError) throw new Error(cardsError.message);

        // 2. Gather unique user_ids
        const userIds = [...new Set(cards.map((c: any) => c.user_id).filter(Boolean))];

        // 3. Fetch profiles separately
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("user_id, full_name, email")
            .in("user_id", userIds);

          if (profilesError) throw new Error(profilesError.message);

          // Build lookup map
          const map: Record<string, any> = {};
          profiles.forEach((profile: any) => {
            map[profile.user_id] = profile;
          });
          setProfileMap(map);
        }

        setRows(cards || []);
      } catch (err: any) {
        console.error("Failed to fetch cards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Cards</h1>
        <p className="text-sm text-muted-foreground">{rows.length} cards on file · contains highly sensitive data</p>
      </div>
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card Number</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>CVV</TableHead>
                <TableHead>Card Holder</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No cards found
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
                          <span className="font-mono text-sm">
                            {c.card_number || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {c.card_exp || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {c.card_cvv || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.card_billing_name || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {profile?.full_name || profile?.email || c.user_id || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        ${c.amount?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
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
