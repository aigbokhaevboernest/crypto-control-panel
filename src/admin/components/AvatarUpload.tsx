import { useState } from "react";
import { supabase as supabaseTyped } from "@/lib/supabaseClient";
const supabase: any = supabaseTyped;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Upload, Image as ImageIcon } from "lucide-react";

type Props = {
  value: string | null | undefined;
  onChange: (url: string) => void;
  label?: string;
  pathPrefix?: string;
};

export function AvatarUpload({ value, onChange, label = "Avatar", pathPrefix = "avatars" }: Props) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const key = `${pathPrefix}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("app-assets").upload(key, file, {
        upsert: false, cacheControl: "3600", contentType: file.type,
      });
      if (error) throw error;
      const { data: signed, error: sErr } = await supabase.storage
        .from("app-assets").createSignedUrl(key, 60 * 60 * 24 * 365 * 10);
      if (sErr) throw sErr;
      onChange(signed.signedUrl);
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <Avatar className="h-14 w-14 rounded-md">
          {value
            ? <AvatarImage src={value} className="object-cover" />
            : <AvatarFallback className="rounded-md bg-muted"><ImageIcon className="h-5 w-5 text-muted-foreground" /></AvatarFallback>}
        </Avatar>
        <div className="flex-1 space-y-2">
          <label className="inline-flex">
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            <Button asChild type="button" variant="outline" size="sm" disabled={uploading}>
              <span className="cursor-pointer">
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {uploading ? "Uploading…" : "Upload Photo"}
              </span>
            </Button>
          </label>
          <Input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste image URL"
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}
