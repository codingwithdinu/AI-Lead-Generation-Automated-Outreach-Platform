import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import {
  LayoutDashboard, Compass, Users, Mail, Repeat, CalendarCheck,
  BarChart3, Settings, LogOut, Phone, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/opportunities", label: "Opportunity Finder", icon: Compass },
  { to: "/leads", label: "Leads CRM", icon: Users },
  { to: "/outreach", label: "AI Outreach", icon: Mail },
  { to: "/calls", label: "AI Calling", icon: Phone },
  { to: "/followups", label: "Follow-ups", icon: Repeat },
  { to: "/discovery", label: "Discovery Calls", icon: CalendarCheck },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export default function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex md:w-64 flex-col bg-sidebar text-sidebar-foreground">
        <div className="px-6 py-6 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-gold flex items-center justify-center">
              <Sparkles className="size-4 text-navy" />
            </div>
            <div>
              <div className="font-display font-bold text-base leading-tight">TradeConnect</div>
              <div className="text-[10px] uppercase tracking-widest text-gold">AI</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-2 border-gold"
                    : "hover:bg-sidebar-accent/60"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-sidebar-foreground/60">Signed in as</div>
            <div className="text-sm truncate">{user.email}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-navy flex items-center justify-center">
              <Sparkles className="size-3.5 text-gold" />
            </div>
            <span className="font-display font-bold">TradeConnect AI</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="size-4" /></Button>
        </header>
        <nav className="md:hidden flex gap-1 overflow-x-auto px-2 py-2 border-b bg-card scrollbar-thin">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-md text-xs whitespace-nowrap",
                  active ? "bg-navy text-navy-foreground" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
