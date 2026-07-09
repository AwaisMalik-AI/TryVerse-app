import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { PACKS } from "./pricing.index";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/pricing/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — TryVerse" },
      { name: "description", content: "Review your credit pack and continue to payment." },
    ],
  }),
  component: CheckoutScreen,
});

const METHODS = [
  { id: "card", label: "Credit / Debit Card" },
  { id: "apple", label: "Apple Pay" },
  { id: "google", label: "Google Pay" },
  { id: "paypal", label: "PayPal" },
];

function CheckoutScreen() {
  const navigate = useNavigate();
  const [packId, setPackId] = useState<string>("plus");
  const [method, setMethod] = useState("card");
  const [form, setForm] = useState({ name: "Hussnain K.", email: "hussnain@tryverse.app", country: "United States", zip: "94105" });

  useEffect(() => {
    try {
      const p = window.sessionStorage.getItem("tv-pack");
      if (p) setPackId(p);
    } catch {}
  }, []);

  const pack = PACKS.find((p) => p.id === packId) ?? PACKS[1];
  const balance = 182;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/pricing/payment" });
  }

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between tv-enter-1">
          <BackButton fallback="/pricing" />
          <TryVerseLogo height={26} />
          <span className="h-9 w-9" />
        </header>

        <form onSubmit={submit} className="tv-home-scroll relative z-10 flex-1 w-full pb-8">
          <section className="px-5 mt-4 tv-enter-2">
            <h1 className="tv-heading text-white text-[22px]">Checkout</h1>
          </section>

          <section className="px-5 mt-4 tv-enter-3">
            <div className="tv-privacy-card" style={{ alignItems: "center" }}>
              <div className="tv-privacy-icon" aria-hidden style={{ background: "linear-gradient(135deg,#7a3bff,#c93bff)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 3l3 6 6 1-4.5 4 1 6L12 17l-5.5 3 1-6L3 10l6-1z"/></svg>
              </div>
              <div className="flex-1">
                <div className="tv-body text-[13px] text-white font-semibold">{pack.name}</div>
                <div className="tv-body text-[11px] text-white/70">{pack.credits} credits · ${pack.price}</div>
              </div>
            </div>
            <div className="mt-2 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
              <div className="flex justify-between tv-body text-[11.5px] text-white/70"><span>Current balance</span><span>{balance} credits</span></div>
              <div className="flex justify-between tv-body text-[11.5px] text-white"><span>New balance</span><span className="tv-grad font-semibold">{balance + pack.credits} credits</span></div>
            </div>
          </section>

          <section className="px-5 mt-5 tv-enter-3">
            <h2 className="tv-section-title">Payment method</h2>
            <div className="mt-2 flex flex-col gap-2">
              {METHODS.map((m) => (
                <label key={m.id} className="tv-privacy-card cursor-pointer" style={{ alignItems: "center", borderColor: method === m.id ? "rgba(148,88,255,0.7)" : undefined }}>
                  <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} className="accent-violet-500" />
                  <div className="tv-body text-[12.5px] text-white flex-1">{m.label}</div>
                </label>
              ))}
            </div>
          </section>

          <section className="px-5 mt-5 tv-enter-3">
            <h2 className="tv-section-title">Billing details</h2>
            <div className="mt-2 flex flex-col gap-2">
              {[
                { k: "name", label: "Full name" },
                { k: "email", label: "Email", type: "email" },
                { k: "country", label: "Country" },
                { k: "zip", label: "ZIP / Postal code" },
              ].map((f) => (
                <label key={f.k} className="flex flex-col gap-1">
                  <span className="tv-body text-[10.5px] uppercase tracking-[0.16em] text-white/45">{f.label}</span>
                  <input
                    required
                    type={f.type ?? "text"}
                    value={(form as any)[f.k]}
                    onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                    className="h-11 px-4 rounded-xl bg-white/[0.05] border border-white/10 text-white tv-body text-[12.5px] outline-none focus:border-violet-400/60"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="px-5 mt-5">
            <button type="submit" className="tv-cta tv-body h-12 rounded-full text-white font-medium text-[14px] w-full flex items-center justify-center">
              Continue to Payment
            </button>
          </section>
        </form>
      </div>
    </div>
  );
}