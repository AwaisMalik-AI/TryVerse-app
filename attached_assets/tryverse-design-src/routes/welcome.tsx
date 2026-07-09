import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import userImg from "@/assets/tv-user.jpg";
import outfitImg from "@/assets/tv-outfit.jpg";
import resultImg from "@/assets/tv-result.jpg";
import { TryVerseLogo } from "@/components/TryVerseLogo";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "TryVerse — Try it before you buy it" },
      {
        name: "description",
        content:
          "TryVerse lets shoppers virtually try clothes on themselves before buying. Upload a photo, pick an outfit, see the result.",
      },
      { property: "og:title", content: "TryVerse — Try it before you buy it" },
      {
        property: "og:description",
        content: "Virtual try-on for fashion. Try it before you buy it.",
      },
    ],
  }),
  component: WelcomeScreen,
});

const stages = [
  { src: userImg, label: "Your photo" },
  { src: outfitImg, label: "Outfit" },
  { src: resultImg, label: "Try-on" },
];

function WelcomeScreen() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStage((s) => (s + 1) % stages.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col items-center overflow-hidden">
        {/* Ambient background */}
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        {/* Top: logo */}
        <header className="relative z-10 pt-6 pb-1 flex flex-col items-center">
          <TryVerseLogo height={30} />
          <p className="tv-tagline mt-1.5 text-[10px] tracking-[0.35em] uppercase text-violet-300/70">
            Try it before you buy it
          </p>
        </header>

        {/* Center visual: glass card with sequence */}
        <div className="relative z-10 mt-2 flex items-center justify-center w-full">
          <div className="tv-float relative">
            <div className="tv-halo" aria-hidden />
            <div className="tv-card relative rounded-[28px] overflow-hidden">
              <div className="tv-card-inner relative">
                {stages.map((s, i) => (
                  <img
                    key={s.label}
                    src={s.src}
                    alt={s.label}
                    className={`tv-slide ${i === stage ? "tv-slide-active" : ""}`}
                    width={512}
                    height={768}
                  />
                ))}
                <div className="tv-card-shine" aria-hidden />
                <div className="tv-card-caption">
                  <span className="tv-dot" />
                  {stages[stage].label}
                </div>
              </div>
            </div>

            {/* stepper dots */}
            <div className="mt-4 flex justify-center gap-1.5">
              {stages.map((s, i) => (
                <span
                  key={s.label}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === stage ? "w-6 bg-violet-400" : "w-1.5 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="relative z-10 px-6 text-center mt-5">
          <h1 className="tv-heading text-white text-[26px] leading-[1.15] font-normal">
            <span className="tv-line tv-line-1 block">Try Clothes On</span>
            <span className="tv-line tv-line-2 block">Before You Buy</span>
            <span className="tv-line tv-line-3 tv-grad block">With TryVerse</span>
          </h1>
          <p className="tv-body mt-4 text-[12.5px] leading-relaxed text-white/60 px-3">
            Upload your photo, choose an outfit, and see how it looks on you before checkout.
          </p>
        </div>

        {/* CTAs */}
        <div className="relative z-10 w-full px-6 pt-5 pb-8 mt-auto flex flex-col gap-3">
          <Link
            to="/onboarding/try-on"
            className="tv-cta tv-body relative h-12 rounded-full text-white font-medium text-[14px] tracking-wide flex items-center justify-center"
          >
            <span className="relative z-10">Get Started</span>
          </Link>
          <Link
            to="/login"
            className="tv-cta-secondary tv-body h-11 rounded-full text-white/80 text-[13px] flex items-center justify-center"
          >
            I already have an account
          </Link>
          <p className="tv-body mt-1 text-center text-[10px] text-white/40">
            Private by design. Your photos stay yours.
          </p>
        </div>
      </div>
    </div>
  );
}