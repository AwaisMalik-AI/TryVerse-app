import { createFileRoute, Link } from "@tanstack/react-router";
import resultImg from "@/assets/tv-result.jpg";
import outfitImg from "@/assets/tv-outfit.jpg";
import blazerImg from "@/assets/tv-blazer-lavender.jpg";
import topImg from "@/assets/tv-top.jpg";
import { TryVerseLogo } from "@/components/TryVerseLogo";

export const Route = createFileRoute("/onboarding/save")({
  head: () => ({
    meta: [
      { title: "Save Looks You Love — TryVerse" },
      {
        name: "description",
        content:
          "Keep your try-on results, compare outfits, and shop with more confidence in TryVerse.",
      },
      { property: "og:title", content: "Save Looks You Love — TryVerse" },
      {
        property: "og:description",
        content: "Save and compare outfits before you buy with TryVerse.",
      },
    ],
  }),
  component: SaveOnboarding,
});

const looks = [
  { src: resultImg, label: "Try-On", delay: "tv-enter-1" },
  { src: outfitImg, label: "Compare", delay: "tv-enter-2" },
  { src: blazerImg, label: "Stylo Pick", delay: "tv-enter-3" },
  { src: topImg, label: "Saved", delay: "tv-enter-3" },
];

const benefits = ["Private uploads", "Fast results", "Clothing-only AI", "Compare before buying"];

function SaveOnboarding() {
  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col items-center overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        {/* Top */}
        <header className="relative z-10 w-full px-6 pt-5 flex flex-col items-center">
          <TryVerseLogo height={22} />
          <div className="mt-3 w-full flex items-center justify-between">
            <span className="tv-body text-[10px] tracking-[0.25em] uppercase text-white/50">
              Step 3 of 4
            </span>
            <div className="flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <span className="tv-progress-active h-1.5 w-6 rounded-full" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            </div>
          </div>
        </header>

        {/* Heading */}
        <div className="relative z-10 px-6 text-center mt-5">
          <h1 className="tv-heading text-white text-[26px] leading-[1.15] font-normal">
            <span className="tv-line tv-line-1 block">Save Looks</span>
            <span className="tv-line tv-line-2 tv-grad block">You Love</span>
          </h1>
          <p className="tv-body mt-3 text-[12.5px] leading-relaxed text-white/60 px-3">
            Keep your try-on results, compare outfits, and shop with more confidence.
          </p>
        </div>

        {/* Gallery grid */}
        <div className="relative z-10 mt-5 w-full px-6 grid grid-cols-2 gap-2.5">
          {looks.map((l) => (
            <div key={l.label} className={`tv-mini-card ${l.delay}`} style={{ width: "100%", height: 140 }}>
              <img src={l.src} alt={l.label} className="tv-mini-img-contain" loading="lazy" />
              <div className="tv-mini-caption">
                <span className="tv-dot" />
                {l.label}
              </div>
            </div>
          ))}
        </div>

        {/* Benefit chips */}
        <div className="relative z-10 mt-4 w-full px-5 flex flex-wrap justify-center gap-1.5">
          {benefits.map((b, i) => (
            <span
              key={b}
              className={`tv-chip tv-chip-${i + 1} ${i === 0 ? "tv-chip-active" : ""}`}
            >
              {b}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="relative z-10 w-full px-6 pt-5 pb-8 mt-auto flex flex-col gap-3">
          <Link
            to="/onboarding/features"
            className="tv-cta tv-body relative h-12 rounded-full text-white font-medium text-[14px] tracking-wide flex items-center justify-center"
          >
            <span className="relative z-10">Next</span>
          </Link>
          <Link
            to="/signup"
            className="tv-cta-secondary tv-body h-11 rounded-full text-white/80 text-[13px] flex items-center justify-center"
          >
            Skip
          </Link>
        </div>
      </div>
    </div>
  );
}