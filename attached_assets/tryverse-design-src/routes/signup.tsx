import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { GoogleIcon } from "@/components/GoogleIcon";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — TryVerse" },
      { name: "description", content: "Sign up for TryVerse to try clothes on and save your favorite looks." },
    ],
  }),
  component: SignupScreen,
});

function SignupScreen() {
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

        <header className="relative z-10 w-full px-6 pt-6 flex flex-col items-center">
          <TryVerseLogo height={22} />
        </header>

        <div className="relative z-10 px-6 mt-5">
          <h1 className="tv-heading text-white text-[24px] leading-tight">
            <span className="tv-line tv-line-1 block">Create your account</span>
          </h1>
          <p className="tv-body mt-2 text-[12px] text-white/60">
            Start trying clothes on and saving your favorite looks.
          </p>
        </div>

        <form onSubmit={onSubmit} className="relative z-10 px-6 mt-4 flex flex-col gap-2.5">
          <label className="tv-field">
            <span className="tv-field-label">Full name</span>
            <input type="text" required autoComplete="name" placeholder="Jane Doe" className="tv-input" />
          </label>
          <label className="tv-field">
            <span className="tv-field-label">Email address</span>
            <input type="email" required autoComplete="email" placeholder="you@example.com" className="tv-input" />
          </label>
          <label className="tv-field">
            <span className="tv-field-label">Password</span>
            <div className="tv-input-wrap">
              <input
                type={showPw ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Create a password"
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

          <button
            type="submit"
            className="tv-cta tv-body h-12 rounded-full text-white font-medium text-[14px] flex items-center justify-center mt-2"
          >
            Create Account
          </button>
        </form>

        <div className="relative z-10 px-6 mt-3 flex items-center gap-3">
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
            Already have an account?{" "}
            <Link to="/login" className="text-violet-300 hover:text-violet-200">
              Log in
            </Link>
          </p>
          <p className="tv-body text-[10px] text-white/40 text-center">
            By continuing, you agree to our Privacy Policy and Terms.
          </p>
        </div>
      </div>
    </div>
  );
}