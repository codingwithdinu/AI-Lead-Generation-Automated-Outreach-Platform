import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Compass, Mail, Phone, CalendarCheck, Sparkles, Globe2,
  ArrowRight, Building2, Factory, Users, Check, Quote,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-navy flex items-center justify-center">
              <Sparkles className="size-4 text-gold" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold">TradeConnect</div>
              <div className="text-[10px] uppercase tracking-widest text-gold -mt-0.5">AI</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#audience" className="hover:text-foreground">Who it's for</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm" className="bg-navy text-navy-foreground hover:bg-navy/90"><Link to="/auth">Start free</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-hero-gradient">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/40 bg-gold/10 text-xs font-medium text-navy mb-6">
              <Sparkles className="size-3.5" /> AI-powered export-import growth platform
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-foreground leading-[1.05]">
              From export opportunity to{" "}
              <span className="text-gold">booked discovery call</span> — powered by AI.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
              TradeConnect AI helps exporters, importers, MSMEs and chambers discover
              opportunities, generate buyer–seller matches, run AI outreach across email,
              WhatsApp & calls, and book free discovery meetings — automatically.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-navy text-navy-foreground hover:bg-navy/90">
                <Link to="/auth">Start Free Demo <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-navy/20">
                <a href="#contact">Book Discovery Call</a>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Check className="size-4 text-gold" /> No credit card required</div>
              <div className="flex items-center gap-2"><Check className="size-4 text-gold" /> Calendly & Topmate ready</div>
              <div className="flex items-center gap-2"><Check className="size-4 text-gold" /> Built for global B2B</div>
            </div>
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="py-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-sm font-semibold text-gold uppercase tracking-wider">How it works</div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-2">Four steps from cold market to booked call</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { n: "01", title: "Find opportunity", desc: "AI maps best target countries, buyer types, and entry strategy for your product." },
            { n: "02", title: "Generate leads", desc: "Build a verified CRM of importers, distributors and chambers in seconds." },
            { n: "03", title: "Run AI outreach", desc: "Personalized emails, WhatsApp, LinkedIn and consent-based call scripts." },
            { n: "04", title: "Book discovery", desc: "Auto-share your Calendly or Topmate link and track meetings end-to-end." },
          ].map((s) => (
            <Card key={s.n} className="p-6 border-l-4 border-l-gold">
              <div className="text-xs font-semibold text-muted-foreground">{s.n}</div>
              <div className="mt-2 font-display font-semibold text-lg">{s.title}</div>
              <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-sm font-semibold text-gold uppercase tracking-wider">Key features</div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-2">Everything to convert global interest into pipeline</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Compass, title: "AI Opportunity Finder", desc: "Sector & country intelligence reports with buyer profiles, documents checklist, and 30-day action plan." },
              { icon: Users, title: "Lead CRM", desc: "Track leads with hot/warm/cold scoring, status pipeline, source attribution, and AI next-step recommendations." },
              { icon: Mail, title: "AI Outreach Agent", desc: "Generate personalized email, WhatsApp, LinkedIn messages and call scripts in one click." },
              { icon: Phone, title: "AI Calling (Consent-based)", desc: "Generate call scripts, qualification questions and outcomes — with placeholder integrations for Twilio, Exotel, WhatsApp Business." },
              { icon: CalendarCheck, title: "Calendly / Topmate Scheduling", desc: "Auto-insert your discovery call link in outreach. Track meetings, pre-call briefs and post-call summaries." },
              { icon: Globe2, title: "Multi-channel Follow-ups", desc: "Visual 6-step follow-up timeline. Mix email, WhatsApp and AI calls. Never lose a warm lead." },
            ].map((f) => (
              <Card key={f.title} className="p-6 hover:shadow-md transition-shadow">
                <div className="size-10 rounded-md bg-navy/5 flex items-center justify-center mb-4">
                  <f.icon className="size-5 text-navy" />
                </div>
                <div className="font-display font-semibold">{f.title}</div>
                <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section id="audience" className="py-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-sm font-semibold text-gold uppercase tracking-wider">Built for</div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-2">Exporters, importers, MSMEs & chambers</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { icon: Factory, title: "Exporters", desc: "Find target markets and qualified buyers fast." },
            { icon: Building2, title: "Importers", desc: "Discover verified suppliers and partnership opportunities." },
            { icon: Users, title: "MSMEs", desc: "Compete globally without an enterprise sales team." },
            { icon: Globe2, title: "Chambers & Forums", desc: "Convert expo and conclave leads into measurable outcomes." },
          ].map((a) => (
            <Card key={a.title} className="p-6 bg-navy text-navy-foreground">
              <a.icon className="size-6 text-gold mb-3" />
              <div className="font-display font-semibold">{a.title}</div>
              <p className="text-sm text-navy-foreground/70 mt-2">{a.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonial placeholder */}
      <section className="py-20 bg-muted/40">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <Quote className="size-10 text-gold mx-auto mb-4" />
          <p className="text-xl md:text-2xl font-display text-foreground leading-relaxed">
            "We turned a single trade expo into 14 qualified discovery calls in three weeks
            — without expanding our sales team. The AI outreach is the unlock."
          </p>
          <div className="mt-6 text-sm text-muted-foreground">
            — Head of Exports, Specialty Foods (pilot customer)
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold text-gold uppercase tracking-wider">Pricing</div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-2">Simple, scales with your trade pipeline</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            { name: "Starter", price: "Free", desc: "Run your first AI opportunity report and outreach.", features: ["1 opportunity report / mo", "25 leads", "AI outreach drafts", "Manual follow-ups"] },
            { name: "Growth", price: "$49", suffix: "/mo", featured: true, desc: "For active exporters running campaigns.", features: ["Unlimited reports", "2,000 leads", "AI calls (consent-based)", "Calendly + Topmate", "Automated follow-ups"] },
            { name: "Chamber", price: "Custom", desc: "Multi-member access for chambers & forums.", features: ["Member dashboard", "Expo lead capture", "Bulk outreach", "Priority support"] },
          ].map((p) => (
            <Card key={p.name} className={`p-6 ${p.featured ? "border-2 border-gold shadow-lg" : ""}`}>
              {p.featured && <div className="text-xs font-semibold text-gold uppercase mb-2">Most popular</div>}
              <div className="font-display font-bold text-lg">{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-display font-bold">{p.price}</span>
                {p.suffix && <span className="text-sm text-muted-foreground">{p.suffix}</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-2">{p.desc}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><Check className="size-4 text-gold shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <Button asChild className="w-full mt-6 bg-navy text-navy-foreground hover:bg-navy/90">
                <Link to="/auth">Get started</Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-navy-gradient text-navy-foreground">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Ready to grow your trade pipeline?</h2>
          <p className="mt-4 text-navy-foreground/80 max-w-2xl mx-auto">
            Start a free demo or book a 20-minute discovery call to see how
            TradeConnect AI fits your export-import workflow.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
              <Link to="/auth">Start Free Demo</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-navy-foreground/30 text-navy-foreground hover:bg-navy-foreground/10">
              <a href="mailto:hello@tradeconnect.ai">hello@tradeconnect.ai</a>
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} TradeConnect AI — From export opportunity to booked discovery call.
      </footer>
    </div>
  );
}
