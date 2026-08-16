import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { generateAICallScript, generatePreCallBrief } from "@/lib/ai";
import { CALL_OUTCOMES, LEAD_SCORES } from "@/lib/constants";
import { toast } from "sonner";
import { Phone, Sparkles, ShieldCheck } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export default function CallsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [purpose, setPurpose] = useState("Introduction");
  const [script, setScript] = useState("");
  const [responseNotes, setResponseNotes] = useState("");
  const [outcome, setOutcome] = useState("Interested");
  const [newScore, setNewScore] = useState("Hot");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("leads").select("*").order("created_at", { ascending: false }).then(({ data }) => setLeads(data ?? []));
  }, [user]);

  const lead = leads.find((l) => l.id === selectedId);
  const brief = lead ? generatePreCallBrief(lead) : null;

  const generate = async () => {
    if (!lead) return toast.error("Select a lead first");
    if (!consent) return toast.error("Confirm consent before generating a call script");
    try {
      const aiScript = await generateAICallScript(lead, purpose);
      setScript(aiScript);
      toast.success("AI call script ready");
    } catch (error) {
      toast.error("Failed to generate script");
    }
  };

  const startDemoCall = async () => {
    if (!lead?.phone) {
      toast.error("Lead phone number missing");
      return;
    }
    if (!script) {
      toast.error("Generate a script first");
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: lead.phone.startsWith("+") ? lead.phone : `+91${lead.phone}`,
          script: script,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("AI call started");
      } else {
        toast.error(result.error || "Call failed");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to start call");
    }
  };

  const saveResult = async () => {
    if (!lead || !user) return;
    const { error } = await supabase.from("outreach_messages").insert({
      user_id: user.id,
      lead_id: lead.id,
      channel: "call",
      subject: `Call: ${purpose}`,
      message: `${script}\n\n--- Notes ---\n${responseNotes}\n\nOutcome: ${outcome}`,
      status: "Sent",
    });
    await supabase.from("leads").update({ lead_score: newScore }).eq("id", lead.id);
    if (error) toast.error(error.message);
    else toast.success("Call result saved & lead score updated");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader title="AI Calling Agent" description="Consent-based AI call workflow with qualification & outcome tracking" />
      <Card className="p-4 mb-6 border-l-4 border-l-gold bg-gold/5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="size-5 text-navy shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-display font-semibold">Consent required</div>
            <p className="text-muted-foreground mt-1">AI calls must only be made to leads who have given consent or are part of an approved business contact list. Integrations (Twilio, Exotel, Plivo, WhatsApp Business API) are placeholders for now.</p>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>I confirm this lead has consented to be contacted by phone.</span>
            </label>
          </div>
        </div>
      </Card>
      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div><Label>Select lead</Label><Select value={selectedId} onValueChange={setSelectedId}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose…" /></SelectTrigger><SelectContent>{leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name} — {l.company}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Call purpose</Label><Select value={purpose} onValueChange={setPurpose}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{["Introduction", "Follow-up", "Discovery call invitation", "Proposal discussion"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
          <Button onClick={generate} className="w-full bg-navy text-white"><Sparkles className="size-4 mr-2" />Generate Script</Button>
          <Button onClick={startDemoCall} variant="outline" className="w-full"><Phone className="size-4 mr-2" />Start Demo Call</Button>
          {brief && (<Card className="p-4 bg-muted/40"><div className="text-xs uppercase text-muted-foreground font-semibold mb-2">Qualification questions</div><ul className="text-sm space-y-1">{brief.questions_to_ask.map((q) => <li key={q} className="flex gap-2">•<span>{q}</span></li>)}</ul></Card>)}
        </Card>
        <Card className="p-6 lg:col-span-3 space-y-4">
          {!script ? (<div className="text-center py-12 text-muted-foreground"><Phone className="size-10 mx-auto mb-3 opacity-40" />Select a lead, confirm consent, and generate a script.</div>) : (<>
            <div><Label>AI call script</Label><Textarea rows={14} value={script} onChange={(e) => setScript(e.target.value)} className="mt-1.5 font-sans text-sm" /></div>
            <div><Label>Lead response notes</Label><Textarea rows={4} value={responseNotes} onChange={(e) => setResponseNotes(e.target.value)} className="mt-1.5" /></div>
            <div className="grid md:grid-cols-2 gap-3"><div><Label>Call outcome</Label><Select value={outcome} onValueChange={setOutcome}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{CALL_OUTCOMES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div><div><Label>Updated lead score</Label><Select value={newScore} onValueChange={setNewScore}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{LEAD_SCORES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div></div>
            <Button onClick={saveResult} className="w-full bg-navy text-navy-foreground hover:bg-navy/90">Save call result</Button>
          </>)}
        </Card>
      </div>
      <Card className="p-6 mt-6"><h3 className="font-display font-semibold mb-3">Future integrations</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">{["Twilio", "Exotel", "Plivo", "WhatsApp Business API"].map((p) => (<div key={p} className="p-3 rounded-md border bg-muted/30 text-center"><div className="font-medium">{p}</div><div className="text-xs text-muted-foreground mt-1">Configurable in Settings</div></div>))}</div></Card>
    </div>
  );
}
