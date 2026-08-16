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
import { generatePreCallBrief, generatePostCallSummary, generateDiscoveryCallMessage } from "@/lib/ai";
import { toast } from "sonner";
import { Plus, CalendarCheck, Sparkles, Copy, FileText } from "lucide-react";

export default function DiscoveryPage() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);

  const load = async () => {
    const [dc, ld, prof] = await Promise.all([
      supabase.from("discovery_calls").select("*, leads(name, company, country, sector, interest)").order("meeting_date", { ascending: true }),
      supabase.from("leads").select("*"),
      supabase.from("users_profile").select("*").eq("user_id", user!.id).maybeSingle(),
    ]);
    setCalls(dc.data ?? []);
    setLeads(ld.data ?? []);
    setProfile(prof.data);
  };
  useEffect(() => { if (user) load(); }, [user]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Discovery Calls"
        description="Schedule, prepare, and capture outcomes for every meeting"
        actions={<ScheduleDialog leads={leads} profile={profile} onCreated={load} />}
      />

      <Card className="p-4 mb-6 bg-gold/5 border-gold/30">
        <div className="text-sm">
          <span className="font-semibold">Send Free Discovery Call Link:</span>{" "}
          Copy & paste this message into any outreach.
        </div>
        <pre className="mt-2 text-sm bg-card p-3 rounded-md border whitespace-pre-wrap font-sans">
          {generateDiscoveryCallMessage(profile?.calendly_link || profile?.topmate_link)}
        </pre>
        <Button size="sm" variant="outline" className="mt-2" onClick={() => {
          navigator.clipboard.writeText(generateDiscoveryCallMessage(profile?.calendly_link || profile?.topmate_link));
          toast.success("Copied");
        }}><Copy className="size-4 mr-1.5" />Copy message</Button>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase">
              <tr><th className="p-3">Lead</th><th>Company</th><th>Date & time</th><th>Platform</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {calls.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">
                  <CalendarCheck className="size-10 mx-auto mb-2 opacity-40" />
                  No discovery calls scheduled yet.
                </td></tr>
              ) : calls.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setSelected(c)}>
                  <td className="p-3 font-medium">{c.leads?.name}</td>
                  <td>{c.leads?.company}</td>
                  <td>{c.meeting_date ? new Date(c.meeting_date).toLocaleString() : "—"}</td>
                  <td>{c.platform}</td>
                  <td><StatusBadge status={c.meeting_status} /></td>
                  <td className="p-3"><FileText className="size-4 text-muted-foreground" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <CallDetailDialog call={selected} onClose={() => setSelected(null)} onUpdated={load} />
    </div>
  );
}

function ScheduleDialog({ leads, profile, onCreated }: { leads: any[]; profile: any; onCreated: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [platform, setPlatform] = useState("Google Meet");
  const [date, setDate] = useState("");
  const [link, setLink] = useState(profile?.calendly_link || "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !leadId) return toast.error("Select a lead");
    const lead = leads.find((l) => l.id === leadId);
    const { error } = await supabase.from("discovery_calls").insert({
      user_id: user.id, lead_id: leadId, platform,
      booking_link: link, meeting_date: date ? new Date(date).toISOString() : null,
      meeting_status: "Scheduled",
      pre_call_brief: lead ? (generatePreCallBrief(lead) as any) : null,
    });
    await supabase.from("leads").update({ status: "Discovery Scheduled" }).eq("id", leadId);
    if (error) toast.error(error.message);
    else { toast.success("Discovery call scheduled"); setOpen(false); onCreated(); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-navy text-navy-foreground hover:bg-navy/90"><Plus className="size-4 mr-2" />Schedule call</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Schedule discovery call</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Lead</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pick a lead" /></SelectTrigger>
              <SelectContent>{leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name} — {l.company}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>{["Google Meet", "Zoom", "Calendly", "Topmate", "Phone"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Date & time</Label><Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" /></div>
          <div><Label>Booking link</Label><Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://calendly.com/…" className="mt-1.5" /></div>
          <Button type="submit" className="w-full bg-navy text-navy-foreground hover:bg-navy/90">Schedule</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CallDetailDialog({ call, onClose, onUpdated }: { call: any; onClose: () => void; onUpdated: () => void }) {
  const [summary, setSummary] = useState("");
  useEffect(() => { setSummary(call?.post_call_summary || ""); }, [call]);
  if (!call) return null;
  const brief = call.pre_call_brief || (call.leads ? generatePreCallBrief(call.leads) : null);

  const saveSummary = async () => {
    await supabase.from("discovery_calls").update({ post_call_summary: summary, meeting_status: "Done" }).eq("id", call.id);
    toast.success("Saved"); onUpdated(); onClose();
  };

  const generateAI = () => {
    setSummary(generatePostCallSummary(call.leads || {}, "Interested"));
    toast.success("AI summary drafted");
  };

  return (
    <Dialog open={!!call} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Pre-call brief & summary</DialogTitle></DialogHeader>
        {brief && (
          <Card className="p-4 space-y-3 bg-muted/30">
            <div><div className="text-xs uppercase text-muted-foreground font-semibold">Lead summary</div><p className="text-sm mt-1">{brief.lead_summary}</p></div>
            <div><div className="text-xs uppercase text-muted-foreground font-semibold">Opportunity</div><p className="text-sm mt-1">{brief.opportunity}</p></div>
            <div><div className="text-xs uppercase text-muted-foreground font-semibold">Suggested pitch</div><p className="text-sm mt-1">{brief.suggested_pitch}</p></div>
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">Questions to ask</div>
              <ul className="text-sm mt-1 space-y-1">{brief.questions_to_ask.map((q: string) => <li key={q}>• {q}</li>)}</ul>
            </div>
            <div>
              <div className="text-xs uppercase text-muted-foreground font-semibold">Possible objections</div>
              <ul className="text-sm mt-1 space-y-1">{brief.possible_objections.map((o: string) => <li key={o}>• {o}</li>)}</ul>
            </div>
            <div><div className="text-xs uppercase text-muted-foreground font-semibold">Recommended offer</div><p className="text-sm mt-1">{brief.recommended_offer}</p></div>
          </Card>
        )}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <Label>Post-call summary</Label>
            <Button size="sm" variant="outline" onClick={generateAI}><Sparkles className="size-4 mr-1.5" />AI generate</Button>
          </div>
          <Textarea rows={8} value={summary} onChange={(e) => setSummary(e.target.value)} />
          <Button onClick={saveSummary} className="w-full mt-3 bg-navy text-navy-foreground hover:bg-navy/90">Save summary & mark done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
