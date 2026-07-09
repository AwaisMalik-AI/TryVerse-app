import { createFileRoute, Link } from "@tanstack/react-router";
import userImg from "@/assets/tv-user.jpg";
import outfitImg from "@/assets/tv-outfit.jpg";
import resultImg from "@/assets/tv-result.jpg";
import { TryVerseLogo } from "@/components/TryVerseLogo";

export const Route = createFileRoute("/onboarding/try-on")({
  head: () => ({
    meta: [
      { title: "Try Clothes On Yourself — TryVerse" },
      {
        name: "description",
        content:
          "Upload your photo, choose an outfit, and see how it looks on you instantly with TryVerse.",
      },
      { property: "og:title", content: "Try Clothes On Yourself — TryVerse" },
      {
        property: "og:description",
        content: "See any outfit on you before you buy. TryVerse virtual try-on.",
      },
    ],
  }),
  component: TryOnOnboarding,
});

const cards = [
  { src: userImg, label: "You", delay: "tv-enter-1" },
  { src: outfitImg, label: "Outfit", delay: "tv-enter-2" },
  { src: resultImg, label: "Result", delay: "tv-enter-3" },
];

const steps = [
  { n: "1", title: "Upload photo", desc: "Add a clear full-body picture." },
  { n: "2", title: "Choose outfit", desc: "Pick anything you love." },
  { n: "3", title: "See the result", desc: "Instant preview on you." },
];

function TryOnOnboarding() {
  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col items-center overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        {/* Top: wordmark + progress */}
        <header className="relative z-10 w-full px-6 pt-5 flex flex-col items-center">
          <TryVerseLogo height={22} />
          <div className="mt-3 w-full flex items-center justify-between">
            <span className="tv-body text-[10px] tracking-[0.25em] uppercase text-white/50">
              Step 1 of 4
            </span>
            <div className="flex gap-1.5">
              <span className="tv-progress-active h-1.5 w-6 rounded-full" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            </div>
          </div>
        </header>

        {/* Heading */}
        <div className="relative z-10 px-6 text-center mt-6">
          <h1 className="tv-heading text-white text-[26px] leading-[1.15] font-normal">
            <span className="tv-line tv-line-1 block">Try Clothes</span>
            <span className="tv-line tv-line-2 tv-grad block">On Yourself</span>
          </h1>
          <p className="tv-body mt-3 text-[12.5px] leading-relaxed text-white/60 px-3">
            Upload your photo, choose an outfit, and see the look on you instantly.
          </p>
        </div>

        {/* Card sequence */}
        <div className="relative z-10 mt-7 w-full px-4 flex items-center justify-center gap-1.5">
          {cards.map((c, i) => (
            <div key={c.label} className="flex items-center">
              <div className={`tv-mini-card ${c.delay} ${i === 2 ? "tv-mini-card-hero" : ""}`}>
                <img src={c.src} alt={c.label} className="tv-mini-img" />
                <div className="tv-mini-caption">
                  <span className="tv-dot" />
                  {c.label}
                </div>
                {i === 2 && <div className="tv-mini-glow" aria-hidden />}
              </div>
              {i < cards.length - 1 && (
                <div className="tv-arrow" aria-hidden>
                  <span />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Steps list */}
        <div className="relative z-10 mt-7 w-full px-6 flex flex-col gap-2">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className={`tv-step-row ${i === 0 ? "tv-enter-1" : i === 1 ? "tv-enter-2" : "tv-enter-3"}`}
            >
              <div className="tv-step-num">{s.n}</div>
              <div className="flex-1 min-w-0">
                <div className="tv-body text-[13px] text-white font-medium leading-tight">
                  {s.title}
                </div>
                <div className="tv-body text-[11px] text-violet-200/50 leading-tight mt-0.5">
                  {s.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="relative z-10 w-full px-6 pt-5 pb-8 mt-auto flex flex-col gap-3">
          <Link
            to="/onboarding/stylo"
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