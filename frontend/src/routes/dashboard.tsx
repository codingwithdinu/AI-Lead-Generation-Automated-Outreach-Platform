import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { StatusBadge } from "@/components/status-badge";
import {
  Compass, Users, Flame, Clock, CalendarCheck, FileText, Plus, Mail,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ opp: 0, leads: 0, hot: 0, pending: 0, calls: 0 });
  const [reports, setReports] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [opp, ld, hot, fu, dc, lastOpp, lastLeads, upcoming, prof] = await Promise.all([
        supabase.from("opportunities").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("lead_score", "Hot"),
        supabase.from("followups").select("id", { count: "exact", head: true }).eq("status", "Pending"),
        supabase.from("discovery_calls").select("id", { count: "exact", head: true }),
        supabase.from("opportunities").select("*").order("created_at", { ascending: false }).limit(3),
        supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("discovery_calls").select("*, leads(name, company)").order("meeting_date", { ascending: true }).limit(5),
        supabase.from("users_profile").select("*").eq("user_id", user.id).maybeSingle(),
      ]);
      setStats({
        opp: opp.count ?? 0, leads: ld.count ?? 0, hot: hot.count ?? 0,
        pending: fu.count ?? 0, calls: dc.count ?? 0,
      });
      setReports(lastOpp.data ?? []);
      setLeads(lastLeads.data ?? []);
      setMeetings(upcoming.data ?? []);
      setProfile(prof.data);
    })();
  }, [user]);

  const statCards = [
    { label: "Opportunities", value: stats.opp, icon: Compass, color: "text-navy bg-navy/5" },
    { label: "Total Leads", value: stats.leads, icon: Users, color: "text-blue-700 bg-blue-50" },
    { label: "Hot Leads", value: stats.hot, icon: Flame, color: "text-red-700 bg-red-50" },
    { label: "Follow-ups Pending", value: stats.pending, icon: Clock, color: "text-amber-700 bg-amber-50" },
    { label: "Discovery Calls", value: stats.calls, icon: CalendarCheck, color: "text-emerald-700 bg-emerald-50" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <PageHeader
        title={`Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
        description="Your export-import pipeline at a glance"
        actions={
          <>
            <Button asChild className="bg-navy text-navy-foreground hover:bg-navy/90">
              <Link to="/opportunities"><Compass className="size-4 mr-2" />Find Opportunity</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/leads"><Plus className="size-4 mr-2" />Add Lead</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/outreach"><Mail className="size-4 mr-2" />Generate Outreach</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/discovery"><CalendarCheck className="size-4 mr-2" />Schedule Call</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5">
            <div className={`size-10 rounded-md flex items-center justify-center ${s.color}`}>
              <s.icon className="size-5" />
            </div>
            <div className="mt-3 text-2xl font-display font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Recent opportunity reports</h3>
            <Button asChild variant="ghost" size="sm"><Link to="/opportunities">View all</Link></Button>
          </div>
          {reports.length === 0 ? (
            <EmptyState icon={FileText} title="No reports yet" cta={{ label: "Generate first report", to: "/opportunities" }} />
          ) : (
            <ul className="space-y-3">
              {reports.map((r) => (
                <li key={r.id} className="flex items-start justify-between p-3 rounded-md border">
                  <div>
                    <div className="font-medium">{r.product_name || "Untitled product"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {r.source_country} → {r.target_country} · {r.sector}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Upcoming meetings</h3>
            <Button asChild variant="ghost" size="sm"><Link to="/discovery">View all</Link></Button>
          </div>
          {meetings.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No meetings booked" cta={{ label: "Schedule discovery", to: "/discovery" }} />
          ) : (
            <ul className="space-y-3">
              {meetings.map((m) => (
                <li key={m.id} className="p-3 rounded-md border">
                  <div className="font-medium text-sm">{m.leads?.name || "Lead"}</div>
                  <div className="text-xs text-muted-foreground">{m.leads?.company}</div>
                  <div className="text-xs mt-1 flex items-center justify-between">
                    <span>{m.meeting_date ? new Date(m.meeting_date).toLocaleString() : "TBD"}</span>
                    <StatusBadge status={m.meeting_status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Recent leads</h3>
            <Button asChild variant="ghost" size="sm"><Link to="/leads">View CRM</Link></Button>
          </div>
          {leads.length === 0 ? (
            <EmptyState icon={Users} title="No leads yet" cta={{ label: "Add your first lead", to: "/leads" }} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                  <tr>
                    <th className="py-2">Name</th><th>Company</th><th>Country</th>
                    <th>Sector</th><th>Status</th><th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{l.name}</td>
                      <td>{l.company}</td>
                      <td>{l.country}</td>
                      <td>{l.sector}</td>
                      <td><StatusBadge status={l.status} /></td>
                      <td><StatusBadge status={l.lead_score} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, cta }: { icon: any; title: string; cta?: { label: string; to: string } }) {
  return (
    <div className="text-center py-8">
      <Icon className="size-10 text-muted-foreground/40 mx-auto mb-3" />
      <div className="text-sm text-muted-foreground mb-3">{title}</div>
      {cta && <Button asChild size="sm" variant="outline"><Link to={cta.to}>{cta.label}</Link></Button>}
    </div>
  );
}
