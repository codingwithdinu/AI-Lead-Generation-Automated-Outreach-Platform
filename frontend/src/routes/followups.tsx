import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { generateFollowupSequence } from "@/lib/ai";
import { SECTORS, COUNTRIES } from "@/lib/constants";
import { toast } from "sonner";
import { Plus, CheckCircle2 } from "lucide-react";

export default function FollowupsPage() {
  const { user } = useAuth();
  const [followups, setFollowups] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const load = async () => {
    const [fu, ld] = await Promise.all([
      supabase.from("followups").select("*, leads(name, company)").order("due_date", { ascending: true }),
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
    ]);
    setFollowups(fu.data ?? []);
    setLeads(ld.data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const markComplete = async (id: string) => {
    await supabase.from("followups").update({ status: "Completed" }).eq("id", id);
    toast.success("Marked complete"); load();
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Follow-up Automation"
        description="Build multi-channel follow-up campaigns"
        actions={<NewCampaignDialog leads={leads} onCreated={load} />}
      />

      <Card className="p-6 mb-6 bg-muted/30">
        <h3 className="font-display font-semibold mb-3">Default follow-up timeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
          {generateFollowupSequence("Mixed").map((s) => (
            <div key={s.day} className="p-3 rounded-md bg-card border text-center">
              <div className="text-xs uppercase text-gold font-bold">Day {s.day}</div>
              <div className="font-medium mt-1">{s.channel}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.type}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-semibold mb-4">Active follow-up tasks</h3>
        {followups.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No follow-ups scheduled. Create a campaign above.</p>
        ) : (
          <ul className="space-y-2">
            {followups.map((f) => (
              <li key={f.id} className="flex items-start justify-between gap-4 p-4 rounded-md border">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gold">Step {f.step_number}</span>
                    <span className="font-medium">{f.leads?.name} — {f.leads?.company}</span>
                    <StatusBadge status={f.channel} />
                    <StatusBadge status={f.status} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{f.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">Due: {f.due_date ? new Date(f.due_date).toLocaleDateString() : "—"}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {f.status !== "Completed" && (
                    <Button size="sm" variant="outline" onClick={() => markComplete(f.id)}>
                      <CheckCircle2 className="size-4 mr-1.5" />Complete
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function NewCampaignDialog({ leads, onCreated }: { leads: any[]; onCreated: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sector, setSector] = useState("Food & Beverage");
  const [country, setCountry] = useState("United States");
  const [product, setProduct] = useState("");
  const [channel, setChannel] = useState("Mixed");
  const [leadId, setLeadId] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !leadId) return toast.error("Pick a lead");
    const seq = generateFollowupSequence(channel);
    const rows = seq.map((s) => ({
      user_id: user.id, lead_id: leadId, campaign_name: name || "Campaign",
      followup_type: s.type, channel: s.channel, message: s.message,
      due_date: new Date(Date.now() + s.day * 86400000).toISOString(),
      step_number: s.step, status: "Pending",
    }));
    const { error } = await supabase.from("followups").insert(rows);
    if (error) toast.error(error.message);
    else { toast.success("Campaign created"); setOpen(false); onCreated(); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-navy text-navy-foreground hover:bg-navy/90"><Plus className="size-4 mr-2" />New campaign</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New follow-up campaign</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Campaign name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Q1 Food Importers" /></div>
          <div>
            <Label>Target lead</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pick a lead" /></SelectTrigger>
              <SelectContent>{leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name} — {l.company}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Sector</Label>
              <Select value={sector} onValueChange={setSector}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label>Country</Label>
              <Select value={country} onValueChange={setCountry}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <div><Label>Product / service</Label><Input value={product} onChange={(e) => setProduct(e.target.value)} className="mt-1.5" /></div>
          <div><Label>Preferred channel</Label>
            <Select value={channel} onValueChange={setChannel}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{["Mixed", "Email", "WhatsApp", "Call"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full bg-navy text-navy-foreground hover:bg-navy/90">Create campaign</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
