import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import blazerImg from "@/assets/tv-blazer-lavender.jpg";
import topImg from "@/assets/tv-top.jpg";
import trousersImg from "@/assets/tv-trousers.jpg";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/store/")({
  head: () => ({
    meta: [
      { title: "AI Fashion Store — TryVerse" },
      { name: "description", content: "Browse curated clothing stores and try outfits on instantly with TryVerse." },
      { property: "og:title", content: "AI Fashion Store — TryVerse" },
      { property: "og:description", content: "Curated clothing from top stores. Try any outfit on yourself before you buy." },
    ],
  }),
  component: StoreScreen,
});

const categories = ["All", "Dresses", "Blazers", "Shirts", "Jackets", "Hoodies", "Pants"] as const;

const stores = [
  { slug: "12th-tribe", name: "12th Tribe", count: 19, tint: "linear-gradient(135deg,#7a3bff,#c93bff)" },
  { slug: "frank-and-oak", name: "Frank And Oak", count: 24, tint: "linear-gradient(135deg,#3b6bff,#7a3bff)" },
  { slug: "meshki", name: "Meshki", count: 16, tint: "linear-gradient(135deg,#ff3b8a,#c93bff)" },
  { slug: "zara", name: "Zara", count: 32, tint: "linear-gradient(135deg,#c93bff,#ff8a3b)" },
] as const;

type Product = {
  slug: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  tint: string;
};

const products: Product[] = [
  { slug: "lavender-blazer", name: "Lavender Oversized Blazer", price: 88, category: "Blazer", image: blazerImg, tint: "linear-gradient(160deg,#b48cff,#6d3bff)" },
  { slug: "cream-knit-sweater", name: "Cream Knit Sweater", price: 64, category: "Sweater", image: topImg, tint: "linear-gradient(160deg,#e9d9c4,#b39a7a)" },
  { slug: "pink-satin-dress", name: "Pink Satin Dress", price: 98, category: "Dress", tint: "linear-gradient(160deg,#ffb3d1,#c93bff)" },
  { slug: "white-linen-shirt", name: "White Linen Shirt", price: 54, category: "Shirt", tint: "linear-gradient(160deg,#f4f0e6,#c9c2b0)" },
  { slug: "black-cropped-jacket", name: "Black Cropped Jacket", price: 92, category: "Jacket", tint: "linear-gradient(160deg,#2a2233,#0a0812)" },
  { slug: "olive-wide-pants", name: "Olive Wide-Leg Pants", price: 76, category: "Pants", image: trousersImg, tint: "linear-gradient(160deg,#7a8355,#3d4426)" },
];

function StoreScreen() {
  const [activeCat, setActiveCat] = useState<string>("All");
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const visible =
    activeCat === "All"
      ? products
      : products.filter((p) => p.category.toLowerCase() === activeCat.slice(0, -1).toLowerCase() || p.category.toLowerCase() + "s" === activeCat.toLowerCase());

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <div className="tv-home-scroll relative z-10 flex-1 w-full">
          {/* Header */}
          <header className="w-full px-5 pt-5 flex items-center justify-between tv-enter-1">
            <div className="tv-header-left">
              <BackButton fallback="/home" />
              <Link to="/home" aria-label="TryVerse home">
              <TryVerseLogo height={30} />
            </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/notifications" className="tv-icon-btn" aria-label="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>
                <span className="tv-dot-badge" aria-hidden />
              </Link>
              <Link to="/profile" aria-label="Profile" className="tv-avatar">HK</Link>
            </div>
          </header>

          {/* Heading */}
          <section className="px-5 mt-5 tv-enter-2">
            <h1 className="tv-heading text-white text-[24px] leading-tight">
              Explore <span className="tv-grad">Fashion Stores</span>
            </h1>
            <p className="tv-body mt-2 text-[12.5px] text-white/60">
              Browse clothing from curated stores and try outfits on yourself instantly.
            </p>
          </section>

          {/* Search */}
          <section className="px-5 mt-4 tv-enter-3">
            <label className="tv-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
              <input
                type="text"
                placeholder="Search dresses, blazers, shirts..."
                className="tv-search-input"
              />
            </label>
          </section>

          {/* Category chips */}
          <section className="mt-4">
            <div className="tv-chip-row">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveCat(c)}
                  className={`tv-chip ${activeCat === c ? "tv-chip-active" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </section>

          {/* Featured stores */}
          <section className="px-5 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="tv-section-title">Featured Stores</h2>
              <span className="tv-body text-[10.5px] text-white/45">{stores.length} stores</span>
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {stores.map((s, i) => (
                <Link
                  key={s.slug}
                  to="/store/$storeId"
                  params={{ storeId: s.slug }}
                  className={`tv-store-card tv-store-card-${i + 1}`}
                >
                  <div className="tv-store-thumbs" aria-hidden>
                    <span style={{ background: s.tint }} />
                    <span style={{ background: s.tint, filter: "hue-rotate(30deg)" }} />
                    <span style={{ background: s.tint, filter: "hue-rotate(-30deg)" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="tv-store-name truncate">{s.name}</div>
                    <div className="tv-store-count">{s.count} products</div>
                  </div>
                  <div className="tv-feat-arrow" aria-hidden>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Trending outfits */}
          <section className="px-5 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="tv-section-title">Trending Outfits</h2>
              <span className="tv-body text-[10.5px] text-white/45">{visible.length} looks</span>
            </div>
            <div className="tv-prod-grid mt-3">
              {visible.map((p, i) => (
                <div key={p.slug} className={`tv-prod-card tv-prod-card-${(i % 6) + 1}`}>
                  <Link
                    to="/store/product/$productId"
                    params={{ productId: p.slug }}
                    className="tv-prod-media"
                    style={{ background: p.tint }}
                    aria-label={p.name}
                  >
                    {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : null}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSaved((s) => ({ ...s, [p.slug]: !s[p.slug] }));
                      }}
                      className={`tv-heart ${saved[p.slug] ? "tv-heart-on" : ""}`}
                      aria-label={saved[p.slug] ? "Remove from saved" : "Save"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={saved[p.slug] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z"/></svg>
                    </button>
                  </Link>
                  <div className="tv-prod-body">
                    <div className="tv-prod-cat">{p.category}</div>
                    <div className="tv-prod-name">{p.name}</div>
                    <div className="tv-prod-row">
                      <div className="tv-prod-price">${p.price}</div>
                      <Link to="/try-on" className="tv-prod-try">Try On</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-6" />
        </div>

        <BottomNav />
      </div>
    </div>
  );
}