import { createFileRoute, Link } from "@tanstack/react-router";
import trousersImg from "@/assets/tv-trousers.jpg";
import topImg from "@/assets/tv-top.jpg";
import blazerImg from "@/assets/tv-blazer-lavender.jpg";
import { TryVerseLogo } from "@/components/TryVerseLogo";

export const Route = createFileRoute("/onboarding/stylo")({
  head: () => ({
    meta: [
      { title: "AI Stylist — TryVerse" },
      {
        name: "description",
        content:
          "AI Stylist gives you outfit advice, color suggestions, size guidance, and product ideas in seconds. Powered by Stylo, your TryVerse chatbot.",
      },
      { property: "og:title", content: "AI Stylist — TryVerse" },
      {
        property: "og:description",
        content: "AI Stylist — outfit advice powered by Stylo, built into TryVerse.",
      },
    ],
  }),
  component: StyloOnboarding,
});

const recs = [
  { src: trousersImg, label: "Cream trousers" },
  { src: topImg, label: "Neutral top" },
  { src: blazerImg, label: "Lavender blazer" },
];

const chips = ["Outfit advice", "Color matching", "Size guidance", "Product discovery"];

function StyloOnboarding() {
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
              Step 2 of 4
            </span>
            <div className="flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <span className="tv-progress-active h-1.5 w-6 rounded-full" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
            </div>
          </div>
        </header>

        {/* Heading */}
        <div className="relative z-10 px-6 text-center mt-5">
          <h1 className="tv-heading text-white text-[26px] leading-[1.15] font-normal">
            <span className="tv-line tv-line-2 tv-grad block">AI Stylist</span>
          </h1>
          <p className="tv-body mt-3 text-[12.5px] leading-relaxed text-white/60 px-3">
            Get outfit advice, color suggestions, size guidance, and product ideas in seconds.
          </p>
          <p className="tv-body mt-1.5 text-[11px] leading-relaxed text-white/45 px-3">
            Powered by Stylo, your TryVerse chatbot.
          </p>
        </div>

        {/* Chat card */}
        <div className="relative z-10 mt-5 w-full px-5">
          <div className="tv-chat-card">
            {/* User bubble */}
            <div className="tv-chat-user tv-enter-1">
              <p className="tv-body text-[12px] leading-snug">
                What should I wear with this blazer?
              </p>
            </div>

            {/* Stylo response */}
            <div className="tv-chat-stylo tv-enter-2">
              <div className="tv-chat-avatar" aria-hidden>
                <span>S</span>
                <i className="tv-sparkle tv-sparkle-1" />
                <i className="tv-sparkle tv-sparkle-2" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="tv-body text-[10px] uppercase tracking-[0.18em] text-violet-300/80 mb-1">
                  Stylo
                </div>
                <p className="tv-body text-[12px] leading-snug text-white/85">
                  Try cream trousers, a neutral top, and soft lavender tones for a polished look.
                </p>

                {/* Recommendation mini cards */}
                <div className="mt-2.5 flex gap-1.5">
                  {recs.map((r, i) => (
                    <div
                      key={r.label}
                      className={`tv-rec-card ${i === 0 ? "tv-rec-1" : i === 1 ? "tv-rec-2" : "tv-rec-3"}`}
                    >
                      <img src={r.src} alt={r.label} className="tv-rec-img" loading="lazy" />
                      <div className="tv-rec-label">{r.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chips */}
        <div className="relative z-10 mt-4 w-full px-5 flex flex-wrap justify-center gap-1.5">
          {chips.map((c, i) => (
            <span
              key={c}
              className={`tv-chip tv-chip-${i + 1} ${i === 0 ? "tv-chip-active" : ""}`}
            >
              {c}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="relative z-10 w-full px-6 pt-5 pb-8 mt-auto flex flex-col gap-3">
          <Link
            to="/onboarding/save"
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