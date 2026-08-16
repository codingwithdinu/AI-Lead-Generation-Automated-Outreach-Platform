import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { COUNTRIES, SECTORS, LEAD_STATUSES, LEAD_SCORES, LEAD_SOURCES } from "@/lib/constants";
import { toast } from "sonner";
import { Plus, Search, Trash2, Sparkles } from "lucide-react";
import { generatePreCallBrief } from "@/lib/ai";

export default function LeadsPage() {
  const [searchParams] = useSearchParams();
  const targetCountry = searchParams.get("country") || "United States";
  const targetSector = searchParams.get("sector") || "Technology / IT";
  const { user } = useAuth();

  const generateAILeads = async () => {
    const fakeLeads = [];

    for (let i = 1; i <= 20; i++) {
      fakeLeads.push({
        name: `Buyer ${i}`,
        company: `${targetSector} Company ${i}`,
        country: targetCountry,
        sector: targetSector,
        source: "AI Generated",
        status: "New",
        lead_score: "Warm",
        email: `buyer${i}@example.com`,
        user_id: user!.id,
      });
    }

    const { error } = await supabase
      .from("leads")
      .insert(fakeLeads);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("20 AI leads created");
      load();
    }
  };

  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fScore, setFScore] = useState("all");
  const [fCountry, setFCountry] = useState("all");
  const [fSector, setFSector] = useState("all");
  const [fSource, setFSource] = useState("all");
  const [selected, setSelected] = useState<any>(null);

  const load = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const filtered = leads.filter((l) => {
    const s = search.toLowerCase();
    return (
      (!s || l.name?.toLowerCase().includes(s) || l.company?.toLowerCase().includes(s) || l.email?.toLowerCase().includes(s)) &&
      (fStatus === "all" || l.status === fStatus) &&
      (fScore === "all" || l.lead_score === fScore) &&
      (fCountry === "all" || l.country === fCountry) &&
      (fSector === "all" || l.sector === fSector) &&
      (fSource === "all" || l.source === fSource)
    );
  });

  const remove = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await supabase.from("leads").delete().eq("id", id);
    toast.success("Lead deleted"); load();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("leads").update({ status }).eq("id", id);
    load();
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Leads CRM"
        description="Track and qualify your export-import leads"
        actions={
          <div className="flex gap-2">
            <Button onClick={generateAILeads} variant="outline" className="border-gold text-navy hover:bg-gold/10">
              <Sparkles className="size-4 mr-2" /> Generate 20 AI Leads
            </Button>
            <AddLeadDialog onCreated={load} />
          </div>
        }
      />

      <Card className="p-4 mb-4">
        <div className="grid md:grid-cols-6 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, company, email…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <FilterSelect value={fStatus} setValue={setFStatus} label="Status" options={LEAD_STATUSES} />
          <FilterSelect value={fScore} setValue={setFScore} label="Score" options={LEAD_SCORES} />
          <FilterSelect value={fCountry} setValue={setFCountry} label="Country" options={COUNTRIES} />
          <FilterSelect value={fSource} setValue={setFSource} label="Source" options={LEAD_SOURCES} />
        </div>
        <div className="mt-3">
          <FilterSelect value={fSector} setValue={setFSector} label="Sector" options={SECTORS} />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase">
              <tr>
                <th className="p-3">Name</th><th>Company</th><th>Country</th>
                <th>Sector</th><th>Source</th><th>Status</th><th>Score</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No leads match your filters.</td></tr>
              ) : filtered.map((l) => (
                <tr key={l.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <button className="font-medium text-left hover:text-navy" onClick={() => setSelected(l)}>{l.name}</button>
                    <div className="text-xs text-muted-foreground">{l.email}</div>
                  </td>
                  <td>{l.company}</td>
                  <td>{l.country}</td>
                  <td>{l.sector}</td>
                  <td><StatusBadge status={l.source} /></td>
                  <td>
                    <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v)}>
                      <SelectTrigger className="h-7 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{LEAD_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td><StatusBadge status={l.lead_score} /></td>
                  <td className="p-3">
                    <Button size="icon" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="size-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <LeadDetailDialog lead={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function FilterSelect({ value, setValue, label, options }: { value: string; setValue: (v: string) => void; label: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function AddLeadDialog({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    name: "", company: "", email: "", phone: "", whatsapp: "",
    country: "United States", sector: "Food & Beverage", interest: "",
    source: "Manual", product_interest: "", status: "New", lead_score: "Warm", notes: "",
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("leads").insert({ ...f, user_id: user.id });
    if (error) toast.error(error.message);
    else { toast.success("Lead added"); setOpen(false); onCreated(); }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-navy text-navy-foreground hover:bg-navy/90"><Plus className="size-4 mr-2" />Add Lead</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add new lead</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" required value={f.name} onChange={(v) => set("name", v)} />
            <Field label="Company" value={f.company} onChange={(v) => set("company", v)} />
            <Field label="Email" type="email" value={f.email} onChange={(v) => set("email", v)} />
            <Field label="Phone" value={f.phone} onChange={(v) => set("phone", v)} />
            <Field label="WhatsApp" value={f.whatsapp} onChange={(v) => set("whatsapp", v)} />
            <Field label="Product interest" value={f.product_interest} onChange={(v) => set("product_interest", v)} />
            <SelectField label="Country" value={f.country} setValue={(v) => set("country", v)} options={COUNTRIES} />
            <SelectField label="Sector" value={f.sector} setValue={(v) => set("sector", v)} options={SECTORS} />
            <SelectField label="Source" value={f.source} setValue={(v) => set("source", v)} options={LEAD_SOURCES} />
            <SelectField label="Status" value={f.status} setValue={(v) => set("status", v)} options={LEAD_STATUSES} />
            <SelectField label="Score" value={f.lead_score} setValue={(v) => set("lead_score", v)} options={LEAD_SCORES} />
            <Field label="Interest" value={f.interest} onChange={(v) => set("interest", v)} />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea rows={3} value={f.notes} onChange={(e) => set("notes", e.target.value)} className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full bg-navy text-navy-foreground hover:bg-navy/90">Create lead</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div><Label>{label}</Label><Input className="mt-1.5" type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} /></div>
  );
}
function SelectField({ label, value, setValue, options }: { label: string; value: string; setValue: (v: string) => void; options: string[] }) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((o: string) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function LeadDetailDialog({ lead, onClose }: { lead: any; onClose: () => void }) {
  if (!lead) return null;
  const brief = generatePreCallBrief(lead);
  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{lead.name} — {lead.company}</DialogTitle></DialogHeader>
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Info label="Email" value={lead.email} />
            <Info label="Phone" value={lead.phone} />
            <Info label="WhatsApp" value={lead.whatsapp} />
            <Info label="Country" value={lead.country} />
            <Info label="Sector" value={lead.sector} />
            <Info label="Source" value={lead.source} />
            <Info label="Status" value={lead.status} />
            <Info label="Score" value={lead.lead_score} />
          </div>
          {lead.notes && (
            <div>
              <Label>Notes</Label>
              <div className="mt-1 p-3 rounded-md bg-muted/40 whitespace-pre-wrap">{lead.notes}</div>
            </div>
          )}
          <Card className="p-4 bg-gold/5 border-gold/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-4 text-gold" />
              <span className="font-display font-semibold">AI recommended next action</span>
            </div>
            <p>{brief.next_step}</p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function Info({ label, value }: { label: string; value?: string }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-medium">{value || "—"}</div></div>;
}
