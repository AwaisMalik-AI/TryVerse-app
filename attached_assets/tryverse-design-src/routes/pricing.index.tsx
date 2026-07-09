import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/pricing/")({
  head: () => ({
    meta: [
      { title: "Buy Credits — TryVerse" },
      { name: "description", content: "Choose a credit pack to keep creating with TryVerse." },
    ],
  }),
  component: PricingScreen,
});

export const PACKS = [
  { id: "starter", name: "Starter", credits: 250, price: 50, desc: "Best for casual try-ons", badge: null as string | null },
  { id: "plus", name: "Plus", credits: 500, price: 85, desc: "Best for regular styling", badge: "Best Value" as string | null },
  { id: "pro", name: "Pro Boost", credits: 1000, price: 150, desc: "Best for creators and heavy users", badge: null as string | null },
  { id: "mini", name: "Mini Pack", credits: 100, price: 25, desc: "Quick top-up", badge: null as string | null },
];

const USAGE = [
  { label: "Virtual Try-On", value: "5 credits" },
  { label: "Pose Studio", value: "8 credits" },
  { label: "Showcase Video", value: "15 credits" },
  { label: "AI Stylist", value: "1 credit" },
  { label: "HD Download", value: "3 credits" },
];

function PricingScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>("plus");

  useEffect(() => {
    try {
      const c = window.sessionStorage.getItem("tv-selected-pack");
      if (c) {
        const p = PACKS.find((x) => String(x.credits) === c);
        if (p) setSelected(p.id);
      }
    } catch {}
  }, []);

  function choose(id: string) {
    setSelected(id);
    try { window.sessionStorage.setItem("tv-pack", id); } catch {}
    navigate({ to: "/pricing/checkout" });
  }

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between tv-enter-1">
          <BackButton fallback="/credits" />
          <TryVerseLogo height={26} />
          <div className="flex items-center gap-2">
            <Link to="/notifications" aria-label="Notifications" className="tv-icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>
            </Link>
            <Link to="/profile" aria-label="Profile" className="tv-avatar">HK</Link>
          </div>
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full pb-24">
          <section className="px-5 mt-4 tv-enter-2">
            <h1 className="tv-heading text-white text-[24px]">Buy <span className="tv-grad">Credits</span></h1>
            <p className="tv-body text-[12.5px] text-white/60 mt-1.5">Generate more try-ons, poses, videos, and AI styling results.</p>
          </section>

          <section className="px-5 mt-4 tv-enter-3">
            <div className="tv-privacy-card">
              <div className="tv-privacy-icon" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l3 6 6 1-4.5 4 1 6L12 17l-5.5 3 1-6L3 10l6-1z"/></svg>
              </div>
              <div>
                <div className="tv-body text-[11.5px] text-white font-medium">182 credits remaining</div>
                <div className="tv-body text-[10.5px] text-white/55">Pro plan · Refills each month</div>
              </div>
            </div>
          </section>

          <section className="px-5 mt-5 tv-enter-3">
            <h2 className="tv-section-title">Credit packs</h2>
            <div className="mt-2 flex flex-col gap-2">
              {PACKS.map((p) => {
                const isSel = selected === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(p.id)}
                    className="tv-privacy-card w-full text-left"
                    style={{
                      alignItems: "center",
                      borderColor: isSel ? "rgba(148,88,255,0.7)" : undefined,
                      boxShadow: isSel ? "0 0 0 1px rgba(148,88,255,0.6), 0 0 22px rgba(148,88,255,0.25)" : undefined,
                    }}
                  >
                    <div className="tv-privacy-icon" aria-hidden style={{ background: "linear-gradient(135deg,#7a3bff,#c93bff)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 3l3 6 6 1-4.5 4 1 6L12 17l-5.5 3 1-6L3 10l6-1z"/></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="tv-body text-[13px] text-white font-semibold">{p.name}</div>
                        {p.badge && <span className="tv-credit-pill" style={{ minHeight: 20, fontSize: 9.5, padding: "2px 7px" }}>{p.badge}</span>}
                      </div>
                      <div className="tv-body text-[11px] text-white/70">{p.credits} credits · ${p.price}</div>
                      <div className="tv-body text-[10.5px] text-white/50 mt-0.5">{p.desc}</div>
                    </div>
                    <span
                      onClick={(e) => { e.stopPropagation(); choose(p.id); }}
                      className="tv-saved-btn"
                      style={{ minHeight: 34, padding: "6px 14px", background: isSel ? "linear-gradient(135deg,#7a3bff,#c93bff)" : undefined, color: isSel ? "#fff" : undefined, borderColor: isSel ? "transparent" : undefined, fontWeight: 600, cursor: "pointer" }}
                    >
                      Choose Pack
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="px-5 mt-6 tv-enter-3">
            <h2 className="tv-section-title">How credits are used</h2>
            <div className="mt-2 flex flex-col gap-1.5">
              {USAGE.map((u) => (
                <div key={u.label} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 min-h-[48px]">
                  <span className="tv-body text-[12.5px] text-white/90 font-medium">{u.label}</span>
                  <span className="tv-body text-[12px] text-white/70">{u.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}