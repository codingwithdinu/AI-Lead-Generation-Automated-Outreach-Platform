import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { generateEmailPitch, generateWhatsAppMessage, generateLinkedInMessage, generateCallScript, generateDiscoveryCallMessage } from "@/lib/ai";
import { Sparkles, Copy, Save, Send, Mail, MessageSquare, Linkedin, Phone, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { OUTREACH_STATUSES } from "@/lib/constants";
import { sendEmail } from "@/lib/email";

export default function OutreachPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [messages, setMessages] = useState<Record<string, { subject?: string; body: string }>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  const load = async () => {
    const [ld, hist, prof] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("outreach_messages").select("*, leads(name, company)").order("created_at", { ascending: false }).limit(15),
      supabase.from("users_profile").select("*").eq("user_id", user!.id).maybeSingle(),
    ]);
    setLeads(ld.data ?? []);
    setHistory(hist.data ?? []);
    setProfile(prof.data);
    if (!selectedId && ld.data?.[0]) setSelectedId(ld.data[0].id);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const lead = leads.find((l) => l.id === selectedId);

  const generate = async () => {
    if (!lead) return toast.error("Select a lead first");
    const product = lead.product_interest || "our products";
    const email = await generateEmailPitch(lead, product);
    setMessages({
      email: email,
      whatsapp: { body: generateWhatsAppMessage(lead, product) },
      linkedin: { body: generateLinkedInMessage(lead) },
      call: { body: generateCallScript(lead) },
      followup1: { body: `Hi ${(lead.name || "there").split(" ")[0]}, just following up on my previous note — happy to share samples or a short catalog when convenient.` },
      followup2: { body: `Hi ${(lead.name || "there").split(" ")[0]}, sharing a quick reminder. We have new export-ready stock this month and would love to discuss a partnership.` },
      final: { body: `Hi ${(lead.name || "there").split(" ")[0]}, last note from me. If now isn't the right time, no problem — I'll keep you in our quarterly update list.` },
      discovery: { body: generateDiscoveryCallMessage(profile?.calendly_link || profile?.topmate_link) },
    });
    toast.success("AI outreach drafts generated");
  };

  const saveMessage = async (channel: string, status = "Draft Generated") => {
    if (!lead || !user) return;
    const m = messages[channel];
    if (!m) return;
    const { error } = await supabase.from("outreach_messages").insert({
      user_id: user.id, lead_id: lead.id, channel,
      subject: m.subject || null, message: m.body, status,
    });
    if (error) toast.error(error.message);
    else { toast.success(`${channel} message saved`); load(); }
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copied"); };

  const channels = [
    { key: "email", label: "Email", icon: Mail },
    { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
    { key: "linkedin", label: "LinkedIn", icon: Linkedin },
    { key: "call", label: "Call script", icon: Phone },
    { key: "followup1", label: "Follow-up 1", icon: Mail },
    { key: "followup2", label: "Follow-up 2", icon: Mail },
    { key: "final", label: "Final reminder", icon: Mail },
    { key: "discovery", label: "Discovery link", icon: CalendarCheck },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader title="AI Outreach Agent" description="Generate personalized multi-channel outreach in one click" />

      <Card className="p-4 mb-6 flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium">Select lead</label>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose a lead…" /></SelectTrigger>
            <SelectContent>
              {leads.length === 0 ? <SelectItem value="none" disabled>No leads — add some first</SelectItem>
                : leads.map((l) => <SelectItem key={l.id} value={l.id}>{l.name} — {l.company || l.country}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={generate} disabled={!lead} className="bg-navy text-navy-foreground hover:bg-navy/90">
          <Sparkles className="size-4 mr-2" /> Generate AI Outreach
        </Button>
      </Card>

      {Object.keys(messages).length > 0 && (
        <Tabs defaultValue="email" className="mb-8">
          <TabsList className="flex flex-wrap h-auto">
            {channels.map((c) => <TabsTrigger key={c.key} value={c.key}><c.icon className="size-3.5 mr-1.5" />{c.label}</TabsTrigger>)}
          </TabsList>
          {channels.map((c) => (
            <TabsContent key={c.key} value={c.key} className="mt-4">
              <Card className="p-6 space-y-3">
                {messages[c.key]?.subject && (
                  <div>
                    <label className="text-xs uppercase text-muted-foreground font-semibold">Subject</label>
                    <div className="font-medium mt-1">{messages[c.key].subject}</div>
                  </div>
                )}
                {c.key === "email" ? (
                  <div
                    className="border rounded-md p-4 bg-white min-h-[350px] overflow-auto"
                    dangerouslySetInnerHTML={{
                      __html: messages[c.key]?.body || ""
                    }}
                  />
                ) : (
                  <Textarea
                    rows={14}
                    value={messages[c.key]?.body || ""}
                    onChange={(e) =>
                      setMessages((m) => ({
                        ...m,
                        [c.key]: {
                          ...m[c.key],
                          body: e.target.value
                        }
                      }))
                    }
                    className="font-sans text-sm"
                  />
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(messages[c.key]?.body || "")}><Copy className="size-4 mr-1.5" />Copy</Button>
                  <Button size="sm" variant="outline" onClick={() => saveMessage(c.key)}><Save className="size-4 mr-1.5" />Save draft</Button>
                  <Button size="sm" className="bg-navy text-navy-foreground hover:bg-navy/90" onClick={async () => {
                    if (c.key === "email" && lead?.email) {
                      await sendEmail(
                        lead.email,
                        messages[c.key]?.subject || "TradeConnect AI",
                        messages[c.key]?.body || ""
                      );
                    }

                    await saveMessage(c.key, "Sent");
                  }}>
                    <Send className="size-4 mr-1.5" />Send Email
                  </Button>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Card className="p-6">
        <h3 className="font-display font-semibold mb-4">Outreach history</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No outreach saved yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                <tr><th className="py-2">Lead</th><th>Channel</th><th>Status</th><th>Sent</th></tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{h.leads?.name} <span className="text-muted-foreground">— {h.leads?.company}</span></td>
                    <td className="capitalize">{h.channel}</td>
                    <td>
                      <Select value={h.status} onValueChange={async (v) => { await supabase.from("outreach_messages").update({ status: v }).eq("id", h.id); load(); }}>
                        <SelectTrigger className="h-7 w-[150px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{OUTREACH_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="text-muted-foreground text-xs">{new Date(h.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
