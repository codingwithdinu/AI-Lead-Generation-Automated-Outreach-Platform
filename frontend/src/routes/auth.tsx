import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { BUSINESS_TYPES, COUNTRIES, SECTORS } from "@/lib/constants";

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  useEffect(() => { if (!loading && user) navigate("/dashboard", { replace: true }); }, [loading, user, navigate]);

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-12 bg-navy-gradient text-navy-foreground">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="size-8 rounded-md bg-gold flex items-center justify-center">
            <Sparkles className="size-4 text-navy" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold">TradeConnect</div>
            <div className="text-[10px] uppercase tracking-widest text-gold">AI</div>
          </div>
        </Link>
        <div>
          <h2 className="text-4xl font-display font-bold leading-tight">
            From export opportunity to <span className="text-gold">booked discovery call</span>.
          </h2>
          <p className="mt-4 text-navy-foreground/80 max-w-md">
            Join exporters, importers, MSMEs and chambers using TradeConnect AI to convert
            global interest into qualified pipeline — automatically.
          </p>
        </div>
        <Link to="/" className="text-sm text-navy-foreground/70 hover:text-navy-foreground flex items-center gap-2 w-fit">
          <ArrowLeft className="size-4" /> Back to home
        </Link>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 bg-background">
        <Card className="w-full max-w-md p-8">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6"><SignInForm /></TabsContent>
            <TabsContent value="signup" className="mt-6"><SignUpForm /></TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome back"); navigate("/dashboard"); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label htmlFor="si-email">Email</Label>
        <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="si-pw">Password</Label>
        <Input id="si-pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-navy text-navy-foreground hover:bg-navy/90">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "", company_name: "", email: "", password: "",
    business_type: "Exporter", country: "India", sector: "Food & Beverage",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: form.full_name,
          company_name: form.company_name,
          business_type: form.business_type,
          country: form.country,
          sector: form.sector,
        },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Account created"); navigate("/dashboard"); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Full name</Label>
          <Input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label>Company</Label>
          <Input required value={form.company_name} onChange={(e) => set("company_name", e.target.value)} className="mt-1.5" />
        </div>
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label>Password</Label>
        <Input type="password" required minLength={6} value={form.password} onChange={(e) => set("password", e.target.value)} className="mt-1.5" />
      </div>
      <div>
        <Label>Business type</Label>
        <Select value={form.business_type} onValueChange={(v) => set("business_type", v)}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>{BUSINESS_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Country</Label>
          <Select value={form.country} onValueChange={(v) => set("country", v)}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Sector</Label>
          <Select value={form.sector} onValueChange={(v) => set("sector", v)}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-navy text-navy-foreground hover:bg-navy/90 mt-2">
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
