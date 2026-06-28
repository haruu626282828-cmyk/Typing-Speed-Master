import { Link } from "wouter";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Activity, Trophy, Calendar, BarChart3, Zap, Target, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 flex flex-col items-center text-center gap-8 max-w-4xl">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-primary/10 rounded-full" />
            <h1 className="relative font-mono font-bold text-7xl md:text-9xl tracking-tighter text-primary uppercase leading-none">
              TYPER
            </h1>
          </div>
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl font-mono leading-relaxed">
            Fast. Reactive. Satisfying. Track your typing speed with obsessive precision — real-time WPM, CPM, and accuracy on every keystroke.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="font-mono font-bold uppercase tracking-widest px-10" data-testid="button-start-guest">
              <Link href="/test">Start Typing</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-mono font-bold uppercase tracking-widest" data-testid="button-sign-up">
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-4 font-mono">
            {[
              { label: "15s tests", icon: Zap },
              { label: "30s tests", icon: Zap },
              { label: "60s tests", icon: Zap },
              { label: "120s tests", icon: Zap },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                <item.icon className="w-4 h-4 text-primary" />
                {item.label}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/50 bg-card/20">
          <div className="container mx-auto px-4 py-16 max-w-5xl">
            <h2 className="font-mono font-bold text-lg uppercase tracking-widest text-muted-foreground mb-8 text-center">
              Everything you need
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Activity, title: "Real-time Stats", desc: "Live WPM, CPM, and accuracy as you type. Every character is tracked." },
                { icon: Target, title: "3 Difficulty Modes", desc: "Easy, Medium, and Hard passages to challenge every skill level." },
                { icon: Trophy, title: "Global Leaderboard", desc: "See how you rank against typists worldwide. Filter by duration and difficulty." },
                { icon: Calendar, title: "Daily Challenge", desc: "A new passage every day. Compete for the top spot on the daily board." },
                { icon: BarChart3, title: "Personal Dashboard", desc: "Track your WPM history, accuracy trends, and personal bests over time." },
                { icon: Shield, title: "Achievement Badges", desc: "Earn badges for milestones — First Test, 50 WPM, 100 tests, and more." },
              ].map((f) => (
                <div key={f.title} className="p-5 rounded-lg border border-border/30 bg-card/30 hover:border-primary/30 transition-colors">
                  <f.icon className="w-5 h-5 text-primary mb-3" />
                  <h3 className="font-mono font-bold text-sm mb-1">{f.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="font-mono font-bold text-3xl uppercase tracking-widest text-primary mb-4">Ready to race?</h2>
          <p className="text-muted-foreground font-mono mb-8">No account needed to start. Create one to save your scores.</p>
          <Button asChild size="lg" className="font-mono font-bold uppercase tracking-widest px-12" data-testid="button-cta-start">
            <Link href="/test">Start Typing Now</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
