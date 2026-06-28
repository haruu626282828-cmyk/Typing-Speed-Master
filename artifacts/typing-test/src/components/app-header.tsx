import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Show, useClerk, useUser } from "@clerk/react";
import { Activity, Trophy, LayoutDashboard, Calendar, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const navItems = [
  { href: "/test", label: "Test", icon: Activity },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/daily", label: "Daily", icon: Calendar },
];

export function AppHeader() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
              <span className="font-mono font-bold text-xl tracking-tighter uppercase">TYPER</span>
            </Link>

            <Show when="signed-in">
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Show>
          </div>

          <div className="flex items-center gap-2">
            <Show when="signed-in">
              <div className="hidden md:flex items-center gap-3">
                <Link href="/profile">
                  <Avatar className="h-8 w-8 border border-primary/20 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
                    <AvatarImage src={user?.imageUrl} alt={user?.username || ""} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {(user?.username || user?.firstName || "T").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ redirectUrl: basePath || "/" })}
                  title="Sign out"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </Show>

            <Show when="signed-out">
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm" className="font-medium">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="font-bold tracking-wide uppercase">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            </Show>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-border/40 bg-background"
            >
              <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
                <Show when="signed-in">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-muted transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Avatar className="h-7 w-7 border border-primary/20">
                      <AvatarImage src={user?.imageUrl} />
                      <AvatarFallback className="text-xs bg-muted">
                        {(user?.username || user?.firstName || "T").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-bold">{user?.username || user?.firstName || "Typist"}</div>
                      <div className="text-xs text-muted-foreground">View profile</div>
                    </div>
                  </Link>
                  <div className="h-px bg-border my-1" />
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        location === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="h-px bg-border my-1" />
                  <button
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-colors w-full text-left"
                    onClick={() => { setMobileMenuOpen(false); signOut({ redirectUrl: basePath || "/" }); }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </Show>
                <Show when="signed-out">
                  <Link href="/sign-in" className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="px-3 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-md text-center uppercase tracking-wide" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Show>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile bottom nav — signed-in only */}
      <Show when="signed-in">
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border/60 flex items-center justify-around px-2 py-1 safe-area-bottom">
          {navItems.map((item) => {
            const active = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[3rem] ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <motion.div
                  animate={{ scale: active ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {active && (
                    <motion.div
                      layoutId="bottom-nav-pill"
                      className="absolute inset-0 bg-primary/10 rounded-xl"
                    />
                  )}
                  <item.icon className="w-5 h-5 relative" />
                </motion.div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[3rem] ${
              location === "/profile" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Avatar className="h-5 w-5 border border-current">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="text-[8px] bg-muted">
                {(user?.username || user?.firstName || "T").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-medium leading-none">Profile</span>
          </Link>
        </nav>
      </Show>
    </>
  );
}
