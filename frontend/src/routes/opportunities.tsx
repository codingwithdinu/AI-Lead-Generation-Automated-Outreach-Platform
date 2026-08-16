import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SECTORS, COUNTRIES, BUSINESS_GOALS } from "@/lib/constants";
import { generateOpportunityReport, type OpportunityReport } from "@/lib/ai";
import { toast } from "sonner";
import { Sparkles, Save, Download, Users, Mail, Check, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

const empty = {
  business_goal: "Export", product_name: "", sector: "Food & Beverage", hs_code: "",
  source_country: "India", target_country: "United Arab Emirates", target_buyer_type: "Distributors",
  business_stage: "Growth", product_description: "", certifications: "", monthly_capacity: "",
  price_range: "", website_link: "",
};

export default function Opportunities() {
  const { user } = useAuth();
  const [form, setForm] = useState(empty);
  const [report, setReport] = useState<OpportunityReport | null>(null);
  const [saved, setSaved] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const load = async () => {
    const { data } = await supabase.from("opportunities").select("*").order("created_at", { ascending: false }).limit(10);
    setSaved(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 600));
    setReport(generateOpportunityReport(form));
    setGenerating(false);
    toast.success("AI report generated");
  };

  const save = async () => {
    if (!report || !user) return;
    const { error } = await supabase.from("opportunities").insert({
      ...form, user_id: user.id, ai_report: report as any,
    });
    if (error) toast.error(error.message);
    else { toast.success("Report saved"); load(); }
  };

  const downloadPDF = async () => {
    const reportElement =
      document.getElementById("ai-report");

    if (!reportElement) return;

    try {
      const dataUrl = await toPng(reportElement, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#ffffff",

        filter: (node) => {
          if (
            node instanceof HTMLElement &&
            (
              node.classList.contains("no-print") ||
              node.tagName === "SVG"
            )
          ) {
            return false;
          }
          return true;
        }
      });

      const pdf = new jsPDF("p", "mm", "a4");

      const imgProps =
        pdf.getImageProperties(dataUrl);

      const pdfWidth =
        pdf.internal.pageSize.getWidth();

      const pdfHeight =
        (imgProps.height * pdfWidth) /
        imgProps.width;

      pdf.addImage(
        dataUrl,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight
      );

      pdf.save("ai-opportunity-report.pdf");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="AI Opportunity Finder"
        description="Generate a tailored export-import opportunity report in seconds"
      />
      

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="p-6 lg:col-span-2">
          <form onSubmit={generate} className="space-y-4">
            <div>
              <Label>Business goal</Label>
              <Select value={form.business_goal} onValueChange={(v) => set("business_goal", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>{BUSINESS_GOALS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Product or service</Label>
              <Input required value={form.product_name} onChange={(e) => set("product_name", e.target.value)} placeholder="e.g. Basmati Rice" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sector</Label>
                <Select value={form.sector} onValueChange={(v) => set("sector", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>HS code (optional)</Label>
                <Input value={form.hs_code} onChange={(e) => set("hs_code", e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Source country</Label>
                <Select value={form.source_country} onValueChange={(v) => set("source_country", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target country</Label>
                <Select value={form.target_country} onValueChange={(v) => set("target_country", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Target buyer type</Label>
              <Input value={form.target_buyer_type} onChange={(e) => set("target_buyer_type", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Product description</Label>
              <Textarea rows={3} value={form.product_description} onChange={(e) => set("product_description", e.target.value)} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Certifications</Label>
                <Input value={form.certifications} onChange={(e) => set("certifications", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Monthly capacity</Label>
                <Input value={form.monthly_capacity} onChange={(e) => set("monthly_capacity", e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price range</Label>
                <Input value={form.price_range} onChange={(e) => set("price_range", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={form.website_link} onChange={(e) => set("website_link", e.target.value)} placeholder="https://" className="mt-1.5" />
              </div>
            </div>
            <Button type="submit" disabled={generating} className="w-full bg-navy text-navy-foreground hover:bg-navy/90">
              <Sparkles className="size-4 mr-2" />
              {generating ? "Generating AI report…" : "Generate AI Opportunity Report"}
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {!report ? (
            <Card className="p-12 text-center">
              <Sparkles className="size-12 text-gold mx-auto mb-3" />
              <h3 className="font-display font-semibold text-lg">Your AI report will appear here</h3>
              <p className="text-sm text-muted-foreground mt-2">Fill the form and click Generate to see opportunity intelligence.</p>
            </Card>
          ) : (
            <ReportView
              report={report}
              sector={form.sector}
              onSave={save}
              onDownload={downloadPDF}
            />)}

          {saved.length > 0 && (
            <Card className="p-6">
              <h3 className="font-display font-semibold mb-4">Saved reports</h3>
              <ul className="divide-y">
                {saved.map((r) => (
                  <li key={r.id} className="py-3 flex justify-between items-start gap-3">
                    <div>
                      <div className="font-medium">{r.product_name}</div>
                      <div className="text-xs text-muted-foreground">{r.source_country} → {r.target_country} · {r.sector}</div>
                    </div>
                    <button
                      onClick={() => {
                        setForm({
                          business_goal: r.business_goal || "",
                          product_name: r.product_name || "",
                          sector: r.sector || "",
                          hs_code: r.hs_code || "",
                          source_country: r.source_country || "",
                          target_country: r.target_country || "",
                          target_buyer_type: r.target_buyer_type || "",
                          business_stage: r.business_stage || "",
                          product_description: r.product_description || "",
                          certifications: r.certifications || "",
                          monthly_capacity: r.monthly_capacity || "",
                          price_range: r.price_range || "",
                          website_link: r.website_link || "",
                        });

                        setReport(r.ai_report);
                      }} className="text-xs text-navy hover:underline">View</button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportView({
  report,
  onSave,
  onDownload,
  sector,
}: {
  report: OpportunityReport;
  onSave: () => void;
  onDownload: () => void;
  sector: string;
}) {
  return (
    <Card
      id="ai-report"
      style={{
        background: "#ffffff",
        color: "#000000",
      }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display font-semibold text-lg">AI Opportunity Report</h3>
        <div className="flex flex-wrap gap-2 no-print">
          <Button onClick={onSave} size="sm" className="bg-navy text-navy-foreground hover:bg-navy/90"><Save className="size-4 mr-1.5" />Save</Button>
          <Button onClick={onDownload} size="sm" variant="outline"><Download className="size-4 mr-1.5" />Download</Button>
          <Button asChild size="sm" variant="outline">
            <Link
              to={`/leads?country=${encodeURIComponent(report.best_target_countries[0])}&sector=${encodeURIComponent(sector)}`}
            >
              <Users className="size-4 mr-1.5" />
              Generate Leads
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/outreach">
              <Mail className="size-4 mr-1.5" />
              Outreach
            </Link>
          </Button>
        </div>
      </div>

      <Section title="Summary"><p className="text-sm">{report.summary}</p></Section>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-md bg-muted/50">
          <div className="text-xs uppercase text-muted-foreground font-semibold">Market entry difficulty</div>
          <div className="mt-2"><StatusBadge status={report.market_entry_difficulty} /></div>
        </div>
        <div className="p-4 rounded-md bg-muted/50">
          <div className="text-xs uppercase text-muted-foreground font-semibold">Competition</div>
          <div className="mt-2"><StatusBadge status={report.competition_level} /></div>
        </div>
      </div>

      <Section title="Best target countries">
        <div className="flex flex-wrap gap-2">
          {report.best_target_countries.map((c) => (
            <span key={c} className="px-3 py-1 rounded-full bg-navy text-navy-foreground text-xs">{c}</span>
          ))}
        </div>
      </Section>

      <Section title="Buyer profile"><p className="text-sm">{report.buyer_profile}</p></Section>
      <Section title="Distributor profile"><p className="text-sm">{report.distributor_profile}</p></Section>

      <Section title="Required documents">
        <ul className="text-sm space-y-1.5">
          {report.required_documents.map((d) => (
            <li key={d} className="flex gap-2"><Check className="size-4 text-success shrink-0 mt-0.5" />{d}</li>
          ))}
        </ul>
      </Section>

      <Section title="Pricing approach"><p className="text-sm">{report.pricing_approach}</p></Section>

      <Section title="30-day action plan">
        <ol className="text-sm space-y-2">
          {report.action_plan_30d.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 size-6 rounded-full bg-gold/20 text-navy text-xs font-semibold flex items-center justify-center">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Recommended outreach message">
        <pre className="text-sm whitespace-pre-wrap font-sans bg-muted/50 p-4 rounded-md border">{report.outreach_message}</pre>
      </Section>

      <Section title="Risk points">
        <ul className="text-sm space-y-1.5">
          {report.risk_points.map((r) => (
            <li key={r} className="flex gap-2"><AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />{r}</li>
          ))}
        </ul>
      </Section>

      <div className="p-4 rounded-md bg-navy text-navy-foreground">
        <div className="text-xs uppercase text-gold font-semibold">Next step</div>
        <div className="mt-1 text-sm">{report.next_step}</div>
      </div>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-display font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">{title}</h4>
      {children}
    </div>
  );
}
