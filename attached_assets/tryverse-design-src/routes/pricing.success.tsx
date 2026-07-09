import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { PACKS } from "./pricing.index";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/pricing/success")({
  head: () => ({
    meta: [
      { title: "Payment Successful — TryVerse" },
      { name: "description", content: "Your credits have been added to your account." },
    ],
  }),
  component: SuccessScreen,
});

function SuccessScreen() {
  const [packId, setPackId] = useState("plus");
  useEffect(() => {
    try {
      const p = window.sessionStorage.getItem("tv-pack");
      if (p) setPackId(p);
    } catch {}
  }, []);
  const pack = PACKS.find((p) => p.id === packId) ?? PACKS[1];
  const newBalance = 182 + pack.credits;

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between tv-enter-1">
          <BackButton fallback="/home" />
          <TryVerseLogo height={26} />
          <span className="h-9 w-9" />
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full pb-8 flex flex-col items-center text-center">
          <div className="mt-8 tv-enter-2" style={{ width: 96, height: 96, borderRadius: 999, background: "linear-gradient(135deg,#7a3bff,#c93bff)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(148,88,255,0.55)" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
          </div>
          <h1 className="tv-heading text-white text-[24px] mt-5 tv-enter-2">Payment Successful</h1>
          <p className="tv-body text-[12.5px] text-white/60 mt-2 px-8 tv-enter-3">Your credits have been added.</p>

          <section className="px-5 mt-6 w-full tv-enter-3">
            <div className="tv-privacy-card flex-col text-left" style={{ display: "flex", padding: 16, gap: 8 }}>
              <div className="flex justify-between tv-body text-[12px] text-white/70"><span>Pack purchased</span><span className="text-white font-medium">{pack.name}</span></div>
              <div className="flex justify-between tv-body text-[12px] text-white/70"><span>Credits added</span><span className="text-white font-medium">{pack.credits}</span></div>
              <div className="flex justify-between tv-body text-[12px] text-white/70"><span>New balance</span><span className="tv-grad font-semibold">{newBalance} credits</span></div>
              <div className="flex justify-between tv-body text-[12px] text-white/70"><span>Receipt sent to</span><span className="text-white/85">hussnain@tryverse.app</span></div>
            </div>
          </section>

          <section className="px-5 mt-6 w-full flex flex-col gap-2">
            <Link to="/try-on" className="tv-cta tv-body h-12 rounded-full text-white font-medium text-[14px] flex items-center justify-center">Start Try-On</Link>
            <Link to="/pose-studio" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 text-[13px] flex items-center justify-center">Open Pose Studio</Link>
            <Link to="/home" className="tv-body h-10 rounded-full text-white/60 text-[12.5px] flex items-center justify-center">Back Home</Link>
          </section>
        </div>
      </div>
    </div>
  );
}