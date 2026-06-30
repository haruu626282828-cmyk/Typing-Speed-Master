import { useState, useEffect } from "react";
import { SignIn, useClerk } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignInPage() {
  const { loaded } = useClerk();
  const [showFallback, setShowFallback] = useState(false);

  // If Clerk hasn't loaded within 4 s (domain not authorised / no proxy URL),
  // show an actionable configuration notice instead of a blank form.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!loaded) setShowFallback(true);
    }, 4000);
    return () => clearTimeout(t);
  }, [loaded]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4 gap-8">
      <div className="text-center">
        <a
          href={basePath || "/"}
          className="font-mono font-bold text-3xl tracking-tighter text-primary uppercase hover:opacity-80 transition-opacity"
        >
          TYPER
        </a>
        <p className="text-muted-foreground text-sm mt-1 font-mono">
          Sign in to track your speed
        </p>
      </div>

      {showFallback ? (
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 font-mono text-sm flex flex-col gap-4">
          <p className="text-foreground font-bold">Auth not configured</p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Clerk could not initialise on this domain. Set these environment
            variables in your Cloudflare Pages project and redeploy:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>
              <code className="bg-muted text-foreground px-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code>
              {" "}— from your Replit Secrets
            </li>
            <li>
              <code className="bg-muted text-foreground px-1 rounded">VITE_CLERK_PROXY_URL</code>
              {" "}— <code className="text-primary">https://your-app.replit.app/api/__clerk</code>
            </li>
            <li>
              <code className="bg-muted text-foreground px-1 rounded">VITE_API_BASE_URL</code>
              {" "}— <code className="text-primary">https://your-app.replit.app/api</code>
            </li>
          </ul>
          <a
            href={basePath || "/"}
            className="text-primary hover:underline text-xs mt-1"
          >
            ← Back to typing test (no account needed)
          </a>
        </div>
      ) : (
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          fallbackRedirectUrl={`${basePath}/test`}
        />
      )}
    </div>
  );
}
