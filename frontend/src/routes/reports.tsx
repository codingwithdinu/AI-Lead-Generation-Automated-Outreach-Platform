import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Users, Flame, Mail, Phone, Clock, CalendarCheck, TrendingUp, Globe2, Factory } from "lucide-react";

export default function ReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    leads: 0,
    hot: 0,
    sent: 0,
    calls: 0,
    aiCalls: 0,
    pending: 0,
    booked: 0,
    converted: 0
  });
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [ld, hot, sent, calls, aiCalls, pending, booked, converted, all] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("lead_score", "Hot"),
        supabase.from("outreach_messages").select("id", { count: "exact", head: true }).neq("status", "Draft Generated"),
        supabase.from("outreach_messages").select("id", { count: "exact", head: true }).eq("channel", "call"),
        (supabase as any)
          .from("call_logs")
          .select("id", { count: "exact", head: true }),
        supabase.from("followups").select("id", { count: "exact", head: true }).eq("status", "Pending"),
        supabase.from("discovery_calls").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "Converted"),
        supabase.from("leads").select("country, sector"),
      ]);
      setStats({
        leads: ld.count ?? 0,
        hot: hot.count ?? 0,
        sent: sent.count ?? 0,
        calls: calls.count ?? 0,
        aiCalls: aiCalls.count ?? 0,
        pending: pending.count ?? 0,
        booked: booked.count ?? 0,
        converted: converted.count ?? 0,
      });
      setLeads(all.data ?? []);
    })();
  }, [user]);

  const byCountry = group(leads, "country");
  const bySector = group(leads, "sector");
  const conversion = stats.leads > 0 ? Math.round((stats.converted / stats.leads) * 100) : 0;

  const cards = [
    { label: "Total leads", value: stats.leads, icon: Users },
    { label: "Hot leads", value: stats.hot, icon: Flame },
    { label: "Messages sent", value: stats.sent, icon: Mail },
    { label: "AI Calls", value: stats.aiCalls, icon: Phone },
    { label: "Follow-ups pending", value: stats.pending, icon: Clock },
    { label: "Discovery calls booked", value: stats.booked, icon: CalendarCheck },
    { label: "Conversion rate", value: `${conversion}%`, icon: TrendingUp },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader title="Reports" description="Pipeline performance at a glance" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <c.icon className="size-5 text-gold mb-2" />
            <div className="text-2xl font-display font-bold">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <BreakdownCard title="Leads by country" icon={Globe2} data={byCountry} />
        <BreakdownCard title="Leads by sector" icon={Factory} data={bySector} />
      </div>
    </div>
  );
}

function group(items: any[], key: string) {
  const map: Record<string, number> = {};
  items.forEach((i) => {
    const k = i[key] || "—";
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function BreakdownCard({ title, icon: Icon, data }: { title: string; icon: any; data: [string, number][] }) {
  const max = Math.max(...data.map((d) => d[1]), 1);
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="size-5 text-navy" />
        <h3 className="font-display font-semibold">{title}</h3>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {data.slice(0, 10).map(([k, v]) => (
            <li key={k}>
              <div className="flex justify-between text-sm mb-1"><span>{k}</span><span className="text-muted-foreground">{v}</span></div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-navy rounded-full" style={{ width: `${(v / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
