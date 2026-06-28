import { Link } from "wouter";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/page-transition";
import { motion } from "framer-motion";
import { Activity, Trophy, Calendar, BarChart3, Zap, Target, Shield } from "lucide-react";

const features = [
  { icon: Activity, title: "Real-time Stats", desc: "Live WPM, CPM, and accuracy on every keystroke." },
  { icon: Target, title: "3 Difficulty Modes", desc: "Easy, Medium, and Hard passages for every level." },
  { icon: Trophy, title: "Global Leaderboard", desc: "Rank against typists worldwide by duration & mode." },
  { icon: Calendar, title: "Daily Challenge", desc: "New passage every day. Compete for the top spot." },
  { icon: BarChart3, title: "Personal Dashboard", desc: "Track WPM history, accuracy, and personal bests." },
  { icon: Shield, title: "Achievement Badges", desc: "Earn badges for milestones — 50 WPM, 100 tests…" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <PageTransition>
        <main className="flex-1">
          {/* Hero */}
          <section className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16 flex flex-col items-center text-center gap-6 md:gap-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative"
            >
              <div className="absolute inset-0 blur-3xl bg-primary/10 rounded-full scale-150" />
              <h1 className="relative font-mono font-bold text-6xl md:text-9xl tracking-tighter text-primary uppercase leading-none">
                TYPER
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-muted-foreground text-base md:text-xl max-w-md font-mono leading-relaxed"
            >
              Fast. Reactive. Satisfying. Track your typing speed with obsessive precision.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            >
              <Button asChild size="lg" className="font-mono font-bold uppercase tracking-widest px-8 w-full sm:w-auto">
                <Link href="/test">Start Typing</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-mono font-bold uppercase tracking-widest w-full sm:w-auto">
                <Link href="/sign-up">Create Account</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap justify-center gap-4 md:gap-8 font-mono"
            >
              {["15s", "30s", "60s", "120s"].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-muted-foreground text-xs md:text-sm">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  {t} tests
                </div>
              ))}
            </motion.div>
          </section>

          {/* Features */}
          <section className="border-t border-border/50 bg-card/20">
            <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
              <h2 className="font-mono font-bold text-sm md:text-lg uppercase tracking-widest text-muted-foreground mb-6 md:mb-8 text-center">
                Everything you need
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {features.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    className="p-4 md:p-5 rounded-lg border border-border/30 bg-card/30 hover:border-primary/30 hover:bg-card/60 transition-all"
                  >
                    <f.icon className="w-4 h-4 md:w-5 md:h-5 text-primary mb-2 md:mb-3" />
                    <h3 className="font-mono font-bold text-sm mb-1">{f.title}</h3>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="container mx-auto px-4 py-12 md:py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-mono font-bold text-2xl md:text-3xl uppercase tracking-widest text-primary mb-3 md:mb-4">Ready to race?</h2>
              <p className="text-muted-foreground font-mono text-sm mb-6 md:mb-8">No account needed to start. Create one to save your scores.</p>
              <Button asChild size="lg" className="font-mono font-bold uppercase tracking-widest px-10 w-full sm:w-auto">
                <Link href="/test">Start Typing Now</Link>
              </Button>
            </motion.div>
          </section>
        </main>
      </PageTransition>
    </div>
  );
}
