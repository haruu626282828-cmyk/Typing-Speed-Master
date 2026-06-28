import { SignUp } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignUpPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4 gap-8">
      <div className="text-center">
        <a href={basePath || "/"} className="font-mono font-bold text-3xl tracking-tighter text-primary uppercase hover:opacity-80 transition-opacity">
          TYPER
        </a>
        <p className="text-muted-foreground text-sm mt-1 font-mono">Create an account to save your scores</p>
      </div>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/test`}
      />
    </div>
  );
}
