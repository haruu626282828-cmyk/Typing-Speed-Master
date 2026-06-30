import React, { useEffect, useRef, useState } from "react";
import { ClerkProvider, Show, useClerk, useAuth } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter, Link } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import TestPage from "@/pages/test";
import DashboardPage from "@/pages/dashboard";
import LeaderboardPage from "@/pages/leaderboard";
import DailyPage from "@/pages/daily";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import ProfilePage from "@/pages/profile";
import { TypingTest } from "@/components/typing-test";
import { FALLBACK_PASSAGES } from "@/data/fallback-passages";

// REQUIRED — resolves publishable key from hostname so the same build can
// serve multiple Clerk custom domains. Falls back to the env var.
let clerkPubKey: string | undefined;
try {
  clerkPubKey = publishableKeyFromHost(
    window.location.hostname,
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  ) || undefined;
} catch {
  clerkPubKey = undefined;
}

// REQUIRED — empty in dev (Clerk hits FAPI directly). On Cloudflare Pages set
// VITE_CLERK_PROXY_URL=https://<your-app>.replit.app/api/__clerk
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/favicon.svg`,
    socialButtonsPlacement: "bottom" as const,
  },
  variables: {
    colorPrimary: "hsl(172 100% 50%)",
    colorForeground: "hsl(0 0% 98%)",
    colorMutedForeground: "hsl(240 5% 64.9%)",
    colorDanger: "hsl(0 84.2% 60.2%)",
    colorBackground: "hsl(240 10% 3.9%)",
    colorInput: "hsl(240 3.7% 15.9%)",
    colorInputForeground: "hsl(0 0% 98%)",
    colorNeutral: "hsl(240 3.7% 15.9%)",
    fontFamily: "'Space Mono', 'Inter', monospace",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-background rounded-2xl w-[440px] max-w-full overflow-hidden border border-border shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none border-t border-border",
    headerTitle: "text-foreground font-bold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    formFieldSuccessText: "text-primary",
    alertText: "text-destructive",
    logoBox: "mb-6",
    logoImage: "w-12 h-12 rounded",
    socialButtonsBlockButton: "border border-border bg-card hover:bg-muted text-foreground",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 font-bold tracking-wider",
    formFieldInput: "bg-input border-border text-foreground focus:ring-primary focus:border-primary",
    footerAction: "bg-card",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border-destructive/20",
    otpCodeFieldInput: "bg-input border-border text-foreground",
    formFieldRow: "mb-4",
    main: "w-full",
  },
};

const queryClient = new QueryClient();

// Invalidates the React Query cache when the signed-in user changes.
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

// Show the homepage during Clerk loading so there is never a blank screen.
// Once Clerk resolves auth state, redirect signed-in users to /test.
function HomeRedirect() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <HomePage />;
  return (
    <>
      <Show when="signed-in">
        {isSignedIn ? <Redirect to="/test" /> : null}
      </Show>
      <Show when="signed-out">
        <HomePage />
      </Show>
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [location, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <AnimatePresence mode="wait">
            <Switch key={location}>
              <Route path="/" component={HomeRedirect} />
              <Route path="/test" component={TestPage} />
              <Route path="/leaderboard" component={LeaderboardPage} />
              <Route path="/dashboard">
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              </Route>
              <Route path="/daily">
                <ProtectedRoute><DailyPage /></ProtectedRoute>
              </Route>
              <Route path="/profile">
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              </Route>
              <Route path="/sign-in/*?">
                <SignInPage />
              </Route>
              <Route path="/sign-up/*?">
                <SignUpPage />
              </Route>
              <Route component={NotFound} />
            </Switch>
          </AnimatePresence>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

// ─── Guest Mode ───────────────────────────────────────────────────────────────
// Rendered when VITE_CLERK_PUBLISHABLE_KEY is not set at build time.
// Provides a fully functional typing test with bundled passages so the app
// works without a backend. Auth features are unavailable but clearly explained.

function GuestModeApp() {
  const [passageIdx, setPassageIdx] = useState(0);
  const passage = FALLBACK_PASSAGES[passageIdx % FALLBACK_PASSAGES.length];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Minimal header — no Clerk hooks */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-mono font-bold text-xl tracking-tighter uppercase text-primary hover:opacity-80 transition-opacity">
              TYPER
            </Link>
            <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
              <span>Auth requires env config</span>
              <a
                href="https://github.com/haruu626282828-cmyk/Typing-Speed-Master#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Setup guide
              </a>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl flex flex-col gap-6">
          {/* Env config notice */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 font-mono text-xs text-muted-foreground leading-relaxed">
            <span className="text-primary font-bold">Guest mode</span> — typing test runs locally with bundled passages.
            {" "}To enable sign-in, leaderboard, and stats, set{" "}
            <code className="bg-muted px-1 rounded text-foreground">VITE_CLERK_PUBLISHABLE_KEY</code> and{" "}
            <code className="bg-muted px-1 rounded text-foreground">VITE_CLERK_PROXY_URL</code> in your Cloudflare Pages environment variables.
          </div>

          {/* Passage selector */}
          <div className="flex flex-wrap gap-3 font-mono text-xs">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => {
                  const idx = FALLBACK_PASSAGES.findIndex((p) => p.difficulty === d);
                  if (idx >= 0) setPassageIdx(idx);
                }}
                className={`px-3 py-1 rounded capitalize transition-colors ${
                  passage.difficulty === d
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <TypingTest
            key={passage.id}
            passage={passage.text}
            duration={30}
            onComplete={() => {}}
            onNext={() => setPassageIdx((i) => i + 1)}
          />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

// ─── Error Boundary ───────────────────────────────────────────────────────────
interface ErrorBoundaryState { hasError: boolean; message: string }
class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 p-8 font-mono">
          <div className="text-5xl font-bold text-primary tracking-tighter">TYPER</div>
          <p className="text-muted-foreground text-center max-w-sm">Something went wrong loading the app.</p>
          <p className="text-xs text-muted-foreground/60 text-center max-w-sm">{this.state.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="typer-theme">
        {clerkPubKey ? (
          // Full app with Clerk auth
          <WouterRouter base={basePath}>
            <ClerkProviderWithRoutes />
          </WouterRouter>
        ) : (
          // Guest mode: Clerk key not configured at build time.
          // Typing test works with bundled passages; auth is unavailable.
          <WouterRouter base={basePath}>
            <GuestModeApp />
          </WouterRouter>
        )}
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default App;
