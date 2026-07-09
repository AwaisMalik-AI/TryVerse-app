import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { PACKS } from "./pricing.index";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/pricing/payment")({
  head: () => ({
    meta: [
      { title: "Payment — TryVerse" },
      { name: "description", content: "Complete your credit purchase securely." },
    ],
  }),
  component: PaymentScreen,
});

function PaymentScreen() {
  const navigate = useNavigate();
  const [packId, setPackId] = useState("plus");
  const [processing, setProcessing] = useState(false);
  const [card, setCard] = useState({ number: "", exp: "", cvc: "", name: "" });

  useEffect(() => {
    try {
      const p = window.sessionStorage.getItem("tv-pack");
      if (p) setPackId(p);
    } catch {}
  }, []);

  const pack = PACKS.find((p) => p.id === packId) ?? PACKS[1];

  function pay(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => navigate({ to: "/pricing/success" }), 1800);
  }

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between tv-enter-1">
          <BackButton fallback="/pricing/checkout" />
          <TryVerseLogo height={26} />
          <span className="h-9 w-9" />
        </header>

        <form onSubmit={pay} className="tv-home-scroll relative z-10 flex-1 w-full pb-8">
          <section className="px-5 mt-4 tv-enter-2">
            <h1 className="tv-heading text-white text-[22px]">Payment</h1>
          </section>

          <section className="px-5 mt-4 tv-enter-3">
            <div className="tv-stylo-hero">
              <div className="tv-body text-[10.5px] uppercase tracking-[0.22em] text-violet-300/80">{pack.name}</div>
              <div className="tv-heading text-white text-[24px] leading-tight mt-1">
                <span className="tv-grad">{pack.credits}</span> credits
              </div>
              <div className="tv-body text-[12.5px] text-white/70 mt-1">${pack.price}</div>
            </div>
          </section>

          <section className="px-5 mt-5 tv-enter-3">
            <h2 className="tv-section-title">Card details</h2>
            <div className="mt-2 flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className="tv-body text-[10.5px] uppercase tracking-[0.16em] text-white/45">Card number</span>
                <input required inputMode="numeric" placeholder="1234 5678 9012 3456" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} className="h-11 px-4 rounded-xl bg-white/[0.05] border border-white/10 text-white tv-body text-[12.5px] outline-none focus:border-violet-400/60" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1">
                  <span className="tv-body text-[10.5px] uppercase tracking-[0.16em] text-white/45">Expiry</span>
                  <input required placeholder="MM / YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} className="h-11 px-4 rounded-xl bg-white/[0.05] border border-white/10 text-white tv-body text-[12.5px] outline-none focus:border-violet-400/60" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="tv-body text-[10.5px] uppercase tracking-[0.16em] text-white/45">CVC</span>
                  <input required inputMode="numeric" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} className="h-11 px-4 rounded-xl bg-white/[0.05] border border-white/10 text-white tv-body text-[12.5px] outline-none focus:border-violet-400/60" />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="tv-body text-[10.5px] uppercase tracking-[0.16em] text-white/45">Name on card</span>
                <input required value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="h-11 px-4 rounded-xl bg-white/[0.05] border border-white/10 text-white tv-body text-[12.5px] outline-none focus:border-violet-400/60" />
              </label>
            </div>
            <p className="tv-body text-[10.5px] text-white/45 mt-3 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Payments are secure and encrypted.
            </p>
          </section>

          <section className="px-5 mt-5">
            <button type="submit" disabled={processing} className="tv-cta tv-body h-12 rounded-full text-white font-medium text-[14px] w-full flex items-center justify-center gap-2">
              {processing ? (<><span className="tv-spinner" aria-hidden /> Processing payment...</>) : (<>Pay ${pack.price}</>)}
            </button>
          </section>
        </form>
      </div>
    </div>
  );
}