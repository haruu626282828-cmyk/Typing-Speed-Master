import { Link, useLocation } from "wouter";
import { Show, useClerk, useUser } from "@clerk/react";
import { Activity, Trophy, LayoutDashboard, Calendar, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function AppHeader() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();

  const navItems = [
    { href: "/test", label: "Test", icon: Activity },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/daily", label: "Daily", icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
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

        <div className="flex items-center gap-4">
          <Show when="signed-in">
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold leading-none">{user?.username || user?.firstName || "Typist"}</span>
              </div>
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarImage src={user?.imageUrl} alt={user?.username || ""} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => signOut({ redirectUrl: basePath || "/" })}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </Show>
          
          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" className="font-medium">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild className="font-bold tracking-wide uppercase">
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
}
