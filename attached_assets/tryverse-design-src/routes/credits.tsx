import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/credits")({
  head: () => ({
    meta: [
      { title: "Credits — TryVerse" },
      { name: "description", content: "Manage your TryVerse Pro credits and buy additional packs." },
    ],
  }),
  component: CreditsScreen,
});

const usage = [
  { label: "Virtual Try-On", value: 24 },
  { label: "AI Fashion Store", value: 18 },
  { label: "Pose Studio", value: 12 },
  { label: "Showcase Video", value: 30 },
  { label: "AI Stylist", value: 5 },
];

const packs = [
  { credits: 250, price: 50, badge: null },
  { credits: 500, price: 85, badge: "Best Value" },
  { credits: 1000, price: 150, badge: null },
];

function CreditsScreen() {
  const navigate = useNavigate();
  const remaining = 182;
  const total = 200;
  const pct = Math.round((remaining / total) * 100);

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between tv-enter-1">
          <BackButton fallback="/profile" />
          <h1 className="tv-heading text-white text-[16px]">Credits</h1>
          <span className="h-9 w-9" aria-hidden />
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full pb-24">
          {/* Hero */}
          <section className="px-5 mt-5 tv-enter-2">
            <div className="tv-stylo-hero">
              <div className="flex items-center justify-between">
                <div>
                  <div className="tv-body text-[10.5px] uppercase tracking-[0.22em] text-violet-300/80">TryVerse Pro</div>
                  <div className="tv-heading text-white text-[26px] leading-tight mt-1">
                    <span className="tv-grad">{remaining}</span> credits
                  </div>
                  <div className="tv-body text-[11.5px] text-white/60 mt-0.5">remaining this month</div>
                </div>
                <div className="tv-stylo-avatar" style={{ width: 40, height: 40, fontSize: 13 }}>Pro</div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between tv-body text-[11px] text-white/60">
                  <span>{remaining} / {total}</span>
                  <span>{total} credits/month</span>
                </div>
                <div style={{ marginTop: 8, height: 8, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#7a3bff,#c93bff)", boxShadow: "0 0 14px rgba(148,88,255,0.55)" }} />
                </div>
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-1.5">
                {["Watermark-free results","Priority generation","HD downloads","Saved looks"].map((b) => (
                  <li key={b} className="tv-body text-[11px] text-white/80 flex items-center gap-1.5">
                    <span style={{ width: 14, height: 14, borderRadius: 999, background: "linear-gradient(135deg,#7a3bff,#c93bff)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Usage */}
          <section className="px-5 mt-5 tv-enter-3">
            <h2 className="tv-section-title">Credit usage</h2>
            <div className="mt-2 flex flex-col gap-1.5">
              {usage.map((u) => (
                <div key={u.label} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 min-h-[48px]">
                  <span className="tv-body text-[12.5px] text-white/90 font-medium">{u.label}</span>
                  <span className="tv-body text-[12px] text-white/70">{u.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Packs */}
          <section className="px-5 mt-5 tv-enter-3">
            <h2 className="tv-section-title">Buy more credits</h2>
            <div className="mt-2 flex flex-col gap-2">
              {packs.map((p) => (
                <div key={p.credits} className="tv-privacy-card" style={{ alignItems: "center" }}>
                  <div className="tv-privacy-icon" aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l3 6 6 1-4.5 4 1 6L12 17l-5.5 3 1-6L3 10l6-1z"/></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="tv-body text-[13px] text-white font-semibold">{p.credits} credits</div>
                      {p.badge && <span className="tv-credit-pill" style={{ minHeight: 20, fontSize: 9.5, padding: "2px 7px" }}>{p.badge}</span>}
                    </div>
                    <div className="tv-body text-[11px] text-white/55">${p.price} one-time</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      try { window.sessionStorage.setItem("tv-selected-pack", String(p.credits)); } catch {}
                      navigate({ to: "/pricing" });
                    }}
                    className="tv-saved-btn"
                    style={{ minHeight: 36, padding: "6px 14px", background: "linear-gradient(135deg,#7a3bff,#c93bff)", color: "#fff", borderColor: "transparent", fontWeight: 600 }}
                  >
                    Buy Pack
                  </button>
                </div>
              ))}
            </div>
            <Link
              to="/pricing"
              className="tv-cta tv-body mt-4 h-12 rounded-full text-white font-medium text-[14px] flex items-center justify-center"
            >
              Buy More Credits
            </Link>
            <p className="tv-body text-[10.5px] text-white/45 text-center mt-3">Credits never expire on Pro plan.</p>
          </section>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}