import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import userImg from "@/assets/tv-user.jpg";
import blazerImg from "@/assets/tv-blazer-lavender.jpg";
import resultImg from "@/assets/tv-result.jpg";
import { tvActions, useTryVerse, type Outfit } from "@/lib/tryverse-store";
import { BackButton } from "@/components/BackButton";

const FALLBACK_OUTFIT: Outfit = {
  slug: "lavender-blazer",
  name: "Lavender Oversized Blazer",
  image: blazerImg,
  tint: "linear-gradient(160deg,#b48cff,#6d3bff)",
  price: "$88",
  store: "TryVerse Store",
  color: "Lavender",
};

export const Route = createFileRoute("/try-on/result")({
  head: () => ({
    meta: [
      { title: "Your Try-On Result — TryVerse" },
      { name: "description", content: "See how the outfit looks on you." },
    ],
  }),
  component: TryOnResult,
});

function TryOnResult() {
  const navigate = useNavigate();
  const { selection } = useTryVerse();
  const photo = selection.photo ?? userImg;
  const outfit = selection.outfit ?? FALLBACK_OUTFIT;
  const [saving, setSaving] = useState(false);

  function handleSave() {
    if (saving) return;
    setSaving(true);
    tvActions.saveLook({
      outfit,
      photo,
      result: resultImg,
      size: "M",
      fitNote: "Regular fit recommended",
    });
    toast.success("Look saved successfully");
    setTimeout(() => navigate({ to: "/saved" }), 500);
  }

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between">
          <BackButton fallback="/try-on" />
          <TryVerseLogo height={26} />
          <Link to="/profile" aria-label="Profile" className="tv-avatar">HK</Link>
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full">
          <section className="px-5 mt-4 tv-enter-1">
            <h1 className="tv-heading text-white text-[24px] leading-tight">
              Your <span className="tv-grad">Try-On Result</span>
            </h1>
            <p className="tv-body mt-2 text-[12.5px] text-white/60">
              Here's how the outfit looks on you.
            </p>
          </section>

          <section className="px-5 mt-5 grid grid-cols-2 gap-2.5 tv-enter-2">
            <div className="tv-mini-card">
              <div className="tv-mini-media"><img src={photo} alt="Your photo" /></div>
              <div className="tv-mini-label">Your Photo</div>
            </div>
            <div className="tv-mini-card">
              <div className="tv-mini-media" style={{ background: outfit.tint }}>
                <img src={outfit.image} alt="Outfit" />
              </div>
              <div className="tv-mini-label">Outfit</div>
            </div>
          </section>

          <section className="px-5 mt-4 tv-enter-3">
            <div className="tv-result-card">
              <div className="tv-result-media">
                <img src={resultImg} alt="Try-on result" />
                <div className="tv-result-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>
                  Try-On Result
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 mt-4">
            <div className="tv-to-card">
              <div className="tv-to-card-title">Outfit Details</div>
              <dl className="tv-detail-list mt-2">
                <div><dt>Outfit</dt><dd>{outfit.name}</dd></div>
                <div><dt>Size</dt><dd>M</dd></div>
                <div><dt>Fit</dt><dd>Regular fit recommended</dd></div>
                <div><dt>Color</dt><dd>{outfit.color ?? "—"}</dd></div>
                <div><dt>Store</dt><dd>{outfit.store ?? "TryVerse Store"}</dd></div>
              </dl>
            </div>
          </section>

          <section className="px-5 mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="tv-cta tv-body h-12 rounded-full text-white font-medium text-[14px] flex items-center justify-center"
            >
              {saving ? "Saving…" : "Save Look"}
            </button>
            <div className="grid grid-cols-3 gap-2">
              <Link to="/try-on" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[11.5px] flex items-center justify-center">
                Try Another
              </Link>
              <Link to="/stylo" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[11.5px] flex items-center justify-center">
                Ask Stylo
              </Link>
              <Link to="/store" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[11.5px] flex items-center justify-center">
                Shop Similar
              </Link>
            </div>
          </section>

          <div className="h-24" />
        </div>

        <BottomNav />
      </div>
    </div>
  );
}