import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { GoogleIcon } from "@/components/GoogleIcon";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — TryVerse" },
      { name: "description", content: "Log in to TryVerse to keep trying outfits and saving looks." },
    ],
  }),
  component: LoginScreen,
});

function LoginScreen() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/home" });
  };

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-center">
          <Link
            to="/welcome"
            aria-label="Back"
            className="absolute left-4 top-5 h-9 w-9 rounded-full border border-white/10 bg-white/5 backdrop-blur flex items-center justify-center text-white/80 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </Link>
          <TryVerseLogo height={26} />
        </header>

        <div className="relative z-10 px-6 mt-6">
          <h1 className="tv-heading text-white text-[26px] leading-tight">
            <span className="tv-line tv-line-1 block">Welcome back</span>
          </h1>
          <p className="tv-body mt-2 text-[12.5px] text-white/60">
            Log in to continue trying outfits with TryVerse.
          </p>
        </div>

        <form onSubmit={onSubmit} className="relative z-10 px-6 mt-5 flex flex-col gap-3">
          <label className="tv-field">
            <span className="tv-field-label">Email address</span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="tv-input"
            />
          </label>
          <label className="tv-field">
            <span className="tv-field-label">Password</span>
            <div className="tv-input-wrap">
              <input
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="tv-input pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="tv-input-toggle tv-body"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between text-[11.5px] tv-body">
            <label className="flex items-center gap-2 text-white/70">
              <input type="checkbox" className="tv-checkbox" />
              Remember me
            </label>
            <a href="#" className="text-violet-300/90 hover:text-violet-200">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="tv-cta tv-body h-12 rounded-full text-white font-medium text-[14px] flex items-center justify-center mt-1"
          >
            Log In
          </button>
        </form>

        <div className="relative z-10 px-6 mt-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="tv-body text-[10px] tracking-[0.25em] uppercase text-white/40">
            or continue with
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="relative z-10 px-6 mt-3">
          <button type="button" className="tv-cta-secondary tv-body w-full h-11 rounded-full text-white/85 text-[12.5px] flex items-center justify-center gap-2">
            <GoogleIcon size={18} />
            Continue with Google
          </button>
        </div>

        <div className="relative z-10 w-full px-6 pt-4 pb-6 mt-auto flex flex-col items-center gap-2">
          <p className="tv-body text-[12px] text-white/60">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-violet-300 hover:text-violet-200">
              Sign up
            </Link>
          </p>
          <p className="tv-body text-[10px] text-white/40">
            Secure login · Clothing-only AI
          </p>
        </div>
      </div>
    </div>
  );
}