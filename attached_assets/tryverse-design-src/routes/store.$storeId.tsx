import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/store/$storeId")({
  head: () => ({
    meta: [
      { title: "Store — TryVerse" },
      { name: "description", content: "Browse this store's clothing and try any outfit on instantly." },
    ],
  }),
  component: StoreDetail,
});

const NAMES: Record<string, string> = {
  "12th-tribe": "12th Tribe",
  "frank-and-oak": "Frank And Oak",
  meshki: "Meshki",
  zara: "Zara",
};

const cats = ["All", "Women", "Men"] as const;

const tints = [
  "linear-gradient(160deg,#b48cff,#6d3bff)",
  "linear-gradient(160deg,#ffb3d1,#c93bff)",
  "linear-gradient(160deg,#e9d9c4,#b39a7a)",
  "linear-gradient(160deg,#3b6bff,#7a3bff)",
  "linear-gradient(160deg,#2a2233,#0a0812)",
  "linear-gradient(160deg,#7a8355,#3d4426)",
];

function StoreDetail() {
  const { storeId } = Route.useParams();
  const [cat, setCat] = useState<string>("All");
  const name = NAMES[storeId] ?? "Store";

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between">
          <BackButton fallback="/store" />
          <TryVerseLogo height={26} />
          <span className="h-9 w-9" aria-hidden />
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full">
          <section className="px-5 pt-6 tv-enter-1">
            <h1 className="tv-heading text-white text-[24px] leading-tight">
              <span className="tv-grad">{name}</span>
            </h1>
            <p className="tv-body mt-2 text-[12.5px] text-white/60">
              19 products available for virtual try-on.
            </p>
          </section>

          <section className="px-5 mt-4 tv-enter-2">
            <label className="tv-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
              <input type="text" placeholder={`Search ${name}...`} className="tv-search-input" />
            </label>
          </section>

          <section className="mt-4">
            <div className="tv-chip-row">
              {cats.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`tv-chip ${cat === c ? "tv-chip-active" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </section>

          <section className="px-5 mt-5">
            <div className="tv-prod-grid">
              {tints.map((t, i) => (
                <Link
                  key={i}
                  to="/store/product/$productId"
                  params={{ productId: "lavender-blazer" }}
                  className={`tv-prod-card tv-prod-card-${(i % 6) + 1}`}
                >
                  <div className="tv-prod-media" style={{ background: t }} />
                  <div className="tv-prod-body">
                    <div className="tv-prod-cat">Look {i + 1}</div>
                    <div className="tv-prod-name">Curated outfit</div>
                    <div className="tv-prod-row">
                      <div className="tv-prod-price">${60 + i * 8}</div>
                      <span className="tv-prod-try">View</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="px-5 mt-6">
            <Link to="/try-on" className="tv-cta tv-body h-12 rounded-full text-white font-medium text-[14px] flex items-center justify-center">
              Start Try-On
            </Link>
          </section>

          <div className="h-6" />
        </div>

        <BottomNav />
      </div>
    </div>
  );
}