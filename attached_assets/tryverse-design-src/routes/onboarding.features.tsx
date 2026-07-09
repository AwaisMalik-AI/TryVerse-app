import { createFileRoute, Link } from "@tanstack/react-router";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import featPose from "@/assets/tv-feat-pose.jpg";
import featTryon from "@/assets/tv-feat-tryon.jpg";
import featStylist from "@/assets/tv-feat-stylist.jpg";
import featStore from "@/assets/tv-feat-store.jpg";
import featSaved from "@/assets/tv-feat-saved.jpg";
import featVideo from "@/assets/tv-feat-video.jpg";

export const Route = createFileRoute("/onboarding/features")({
  head: () => ({
    meta: [
      { title: "Everything In One Fashion App — TryVerse" },
      {
        name: "description",
        content:
          "TryVerse brings virtual try-on, AI styling, pose studio, showcase video, and saved looks together in one Android app.",
      },
      { property: "og:title", content: "Everything In One Fashion App — TryVerse" },
      {
        property: "og:description",
        content: "Try, style, pose, save, and share fashion — all in TryVerse.",
      },
    ],
  }),
  component: FeaturesOnboarding,
});

type Feature = {
  title: string;
  desc: string;
  image: string;
  delay: string;
  tag?: string;
};

const features: Feature[] = [
  {
    title: "Pose Studio",
    desc: "Turn outfit photos into polished fashion poses.",
    image: featPose,
    delay: "tv-enter-1",
    tag: "Featured",
  },
  {
    title: "Virtual Try-On",
    desc: "See clothes on yourself before checkout.",
    image: featTryon,
    delay: "tv-enter-1",
  },
  {
    title: "AI Stylist",
    desc: "Get outfit advice and color tips.",
    image: featStylist,
    delay: "tv-enter-2",
  },
  {
    title: "AI Fashion Store",
    desc: "Browse outfits and try them instantly.",
    image: featStore,
    delay: "tv-enter-2",
  },
  {
    title: "Saved Looks",
    desc: "Save and compare your favorite outfits.",
    image: featSaved,
    delay: "tv-enter-3",
  },
  {
    title: "Showcase Video",
    desc: "Create short outfit videos to share.",
    image: featVideo,
    delay: "tv-enter-3",
  },
];

function FeaturesOnboarding() {
  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col items-center overflow-y-auto overflow-x-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        {/* Top */}
        <header className="relative z-10 w-full px-6 pt-5 flex flex-col items-center">
          <TryVerseLogo height={22} />
          <div className="mt-3 w-full flex items-center justify-between">
            <span className="tv-body text-[10px] tracking-[0.25em] uppercase text-white/50">
              Step 4 of 4
            </span>
            <div className="flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <span className="tv-progress-active h-1.5 w-6 rounded-full" />
            </div>
          </div>
        </header>

        {/* Heading */}
        <div className="relative z-10 px-6 text-center mt-4">
          <h1 className="tv-heading text-white text-[24px] leading-[1.15] font-normal">
            <span className="tv-line tv-line-1 block">Everything You Need</span>
            <span className="tv-line tv-line-2 tv-grad block">To Shop Smarter</span>
          </h1>
          <p className="tv-body mt-2.5 text-[12px] leading-relaxed text-white/60 px-2">
            Try outfits, discover products, get AI styling, create poses, and save looks — all in one app.
          </p>
        </div>

        {/* Feature grid */}
        <div className="relative z-10 mt-4 w-full px-5 grid grid-cols-2 gap-2.5">
          {features.map((f) => (
            <div key={f.title} className={`tv-feat-card tv-feat-card-media ${f.delay}`}>
              <div className="tv-feat-media">
                <img
                  src={f.image}
                  alt={f.title}
                  className="tv-feat-media-img"
                  loading="lazy"
                />
                {f.tag && <span className="tv-feat-media-tag">{f.tag}</span>}
              </div>
              <div className="tv-feat-media-body">
                <div className="tv-body text-[12px] font-medium text-white leading-tight">
                  {f.title}
                </div>
                <div className="tv-body text-[10.5px] text-white/55 leading-snug mt-0.5">
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div
          className="relative z-10 w-full px-6 pt-4 mt-auto flex flex-col gap-2.5"
          style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }}
        >
          <Link
            to="/signup"
            className="tv-cta tv-body relative h-12 rounded-full text-white font-medium text-[14px] tracking-wide flex items-center justify-center"
          >
            <span className="relative z-10">Create Free Account</span>
          </Link>
          <Link
            to="/login"
            className="tv-cta-secondary tv-body h-11 rounded-full text-white/80 text-[13px] flex items-center justify-center"
          >
            I already have an account
          </Link>
          <Link
            to="/signup"
            className="tv-body h-10 text-[12px] text-white/50 hover:text-white/80 flex items-center justify-center"
          >
            Skip
          </Link>
          <p className="tv-body text-center text-[10px] text-white/40">
            Your photos are private and deleted after your session.
          </p>
        </div>
      </div>
    </div>
  );
}