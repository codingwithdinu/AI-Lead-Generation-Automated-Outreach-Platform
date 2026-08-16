import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { COUNTRIES, SECTORS, BUSINESS_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import { Save } from "lucide-react";

const empty = {
  full_name: "", company_name: "", business_type: "Exporter", country: "India", sector: "Food & Beverage",
  calendly_link: "", topmate_link: "", google_calendar_link: "", zoom_link: "",
  email_signature: "", products_services: "", target_countries: "",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!user) return;
    supabase.from("users_profile").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setForm({ ...empty, ...Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null)) } as any);
    });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("users_profile").upsert({
      user_id: user.id, ...form, updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Settings saved"); }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <PageHeader title="Settings" description="Company profile, integrations & AI preferences" />

      <form onSubmit={save} className="space-y-6">
        <Card className="p-6">
          <h3 className="font-display font-semibold mb-4">Company profile</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Fld label="Full name" v={form.full_name} on={(v) => set("full_name", v)} />
            <Fld label="Company name" v={form.company_name} on={(v) => set("company_name", v)} />
            <Sel label="Business type" v={form.business_type} on={(v) => set("business_type", v)} opts={BUSINESS_TYPES} />
            <Sel label="Country" v={form.country} on={(v) => set("country", v)} opts={COUNTRIES} />
            <Sel label="Sector" v={form.sector} on={(v) => set("sector", v)} opts={SECTORS} />
          </div>
          <div className="mt-4">
            <Label>Products / services</Label>
            <Textarea rows={3} value={form.products_services} onChange={(e) => set("products_services", e.target.value)} className="mt-1.5" />
          </div>
          <div className="mt-4">
            <Label>Target countries (comma-separated)</Label>
            <Input value={form.target_countries} onChange={(e) => set("target_countries", e.target.value)} className="mt-1.5" />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold mb-4">Scheduling integrations</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Fld label="Calendly link" v={form.calendly_link} on={(v) => set("calendly_link", v)} placeholder="https://calendly.com/yourname" />
            <Fld label="Topmate link" v={form.topmate_link} on={(v) => set("topmate_link", v)} placeholder="https://topmate.io/yourname" />
            <Fld label="Google Calendar link" v={form.google_calendar_link} on={(v) => set("google_calendar_link", v)} />
            <Fld label="Zoom / Meet preference" v={form.zoom_link} on={(v) => set("zoom_link", v)} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold mb-4">Email & AI</h3>
          <div>
            <Label>Email signature</Label>
            <Textarea rows={4} value={form.email_signature} onChange={(e) => set("email_signature", e.target.value)} className="mt-1.5" placeholder="Your Name | Title | Company | +country phone" />
          </div>
        </Card>

        <Card className="p-6 bg-muted/30">
          <h3 className="font-display font-semibold mb-4">Provider placeholders</h3>
          <p className="text-sm text-muted-foreground mb-4">
            These integrations are placeholders for the MVP. Add real API keys later to enable live sending & calls.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {["Email provider", "Call provider", "WhatsApp Business", "AI prompt settings"].map((p) => (
              <div key={p} className="p-3 rounded-md border bg-card text-center">
                <div className="font-medium">{p}</div>
                <div className="text-xs text-muted-foreground mt-1">Coming soon</div>
              </div>
            ))}
          </div>
        </Card>

        <Button type="submit" disabled={loading} className="bg-navy text-navy-foreground hover:bg-navy/90">
          <Save className="size-4 mr-2" />{loading ? "Saving…" : "Save settings"}
        </Button>
      </form>
    </div>
  );
}

function Fld({ label, v, on, placeholder }: { label: string; v: string; on: (s: string) => void; placeholder?: string }) {
  return <div><Label>{label}</Label><Input value={v} onChange={(e) => on(e.target.value)} className="mt-1.5" placeholder={placeholder} /></div>;
}
function Sel({ label, v, on, opts }: { label: string; v: string; on: (s: string) => void; opts: string[] }) {
  return (
    <div><Label>{label}</Label>
      <Select value={v} onValueChange={on}>
        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
        <SelectContent>{opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
