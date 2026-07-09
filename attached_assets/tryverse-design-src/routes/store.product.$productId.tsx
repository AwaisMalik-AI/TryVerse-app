import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import blazerImg from "@/assets/tv-blazer-lavender.jpg";
import topImg from "@/assets/tv-top.jpg";
import trousersImg from "@/assets/tv-trousers.jpg";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/store/product/$productId")({
  head: () => ({
    meta: [
      { title: "Outfit — TryVerse" },
      { name: "description", content: "Preview this outfit and try it on virtually." },
    ],
  }),
  component: ProductDetail,
});

type P = { name: string; price: number; category: string; image?: string; tint: string };

const CATALOG: Record<string, P> = {
  "lavender-blazer": { name: "Lavender Oversized Blazer", price: 88, category: "Blazer", image: blazerImg, tint: "linear-gradient(160deg,#b48cff,#6d3bff)" },
  "cream-knit-sweater": { name: "Cream Knit Sweater", price: 64, category: "Sweater", image: topImg, tint: "linear-gradient(160deg,#e9d9c4,#b39a7a)" },
  "pink-satin-dress": { name: "Pink Satin Dress", price: 98, category: "Dress", tint: "linear-gradient(160deg,#ffb3d1,#c93bff)" },
  "white-linen-shirt": { name: "White Linen Shirt", price: 54, category: "Shirt", tint: "linear-gradient(160deg,#f4f0e6,#c9c2b0)" },
  "black-cropped-jacket": { name: "Black Cropped Jacket", price: 92, category: "Jacket", tint: "linear-gradient(160deg,#2a2233,#0a0812)" },
  "olive-wide-pants": { name: "Olive Wide-Leg Pants", price: 76, category: "Pants", image: trousersImg, tint: "linear-gradient(160deg,#7a8355,#3d4426)" },
};

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
const COLORS = [
  { name: "Lavender", hex: "#b48cff" },
  { name: "Cream", hex: "#e9d9c4" },
  { name: "Black", hex: "#1a1520" },
];

function ProductDetail() {
  const { productId } = Route.useParams();
  const p = CATALOG[productId] ?? CATALOG["lavender-blazer"];
  const [size, setSize] = useState<string>("M");
  const [color, setColor] = useState<string>(COLORS[0].name);
  const [saved, setSaved] = useState(false);

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between">
          <BackButton fallback="/store" />
          <TryVerseLogo height={26} />
          <button
            type="button"
            onClick={() => setSaved((s) => !s)}
            aria-label={saved ? "Remove from saved" : "Save item"}
            className={`tv-icon-btn ${saved ? "tv-heart-on" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6C19 16.5 12 21 12 21z"/></svg>
          </button>
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full">
          <section className="px-5 mt-4 tv-enter-1">
            <div className="tv-prod-hero" style={{ background: p.tint }}>
              {p.image ? <img src={p.image} alt={p.name} /> : null}
            </div>
          </section>

          <section className="px-5 mt-5 tv-enter-2">
            <div className="tv-prod-cat">{p.category}</div>
            <h1 className="tv-heading text-white text-[22px] leading-tight mt-1">{p.name}</h1>
            <div className="tv-heading text-white text-[20px] mt-2"><span className="tv-grad">${p.price}</span></div>
          </section>

          <section className="px-5 mt-5 tv-enter-3">
            <div className="tv-section-title">Size</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`tv-size-chip ${size === s ? "tv-size-chip-active" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section className="px-5 mt-4">
            <div className="tv-section-title">Color</div>
            <div className="mt-2 flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  aria-label={c.name}
                  className={`tv-color-swatch ${color === c.name ? "tv-color-swatch-active" : ""}`}
                  style={{ background: c.hex }}
                />
              ))}
            </div>
          </section>

          <section className="px-5 mt-6 flex flex-col gap-2">
            <Link to="/try-on" className="tv-cta tv-body h-12 rounded-full text-white font-medium text-[14px] flex items-center justify-center">
              Try On
            </Link>
            <button
              type="button"
              onClick={() => setSaved((s) => !s)}
              className="tv-cta-secondary tv-body h-12 rounded-full text-white/85 font-medium text-[13.5px]"
            >
              {saved ? "Saved" : "Save item"}
            </button>
          </section>

          <div className="h-6" />
        </div>

        <BottomNav />
      </div>
    </div>
  );
}