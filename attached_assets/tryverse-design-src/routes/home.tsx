import { createFileRoute, Link } from "@tanstack/react-router";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import { StyloFloatingAssistant } from "@/components/StyloFloatingAssistant";
import featPose from "@/assets/tv-feat-pose.jpg";
import featTryon from "@/assets/tv-feat-tryon.jpg";
import featStylist from "@/assets/tv-feat-stylist.jpg";
import featStore from "@/assets/tv-feat-store.jpg";
import featSaved from "@/assets/tv-feat-saved.jpg";
import featVideo from "@/assets/tv-feat-video.jpg";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — TryVerse" },
      { name: "description", content: "Your TryVerse dashboard. Try clothes on, ask Stylo, save looks." },
      { property: "og:title", content: "TryVerse — Your AI Fashion Home" },
      { property: "og:description", content: "Browse, try on, and save outfits with TryVerse." },
    ],
  }),
  component: HomeScreen,
});

type Feature = {
  to: "/store" | "/try-on" | "/stylo" | "/pose-studio" | "/video-studio" | "/saved";
  title: string;
  desc: string;
  image: string;
  tag: string;
};

const features: Feature[] = [
  {
    to: "/pose-studio",
    title: "Pose Studio",
    desc: "Turn outfit photos into polished poses.",
    image: featPose,
    tag: "Featured",
  },
  {
    to: "/try-on",
    title: "Virtual Try-On",
    desc: "See clothes on yourself before checkout.",
    image: featTryon,
    tag: "Popular",
  },
  {
    to: "/stylo",
    title: "AI Stylist",
    desc: "Get outfit advice and color tips.",
    image: featStylist,
    tag: "Ask Stylo",
  },
  {
    to: "/store",
    title: "AI Fashion Store",
    desc: "Browse outfits and try them instantly.",
    image: featStore,
    tag: "Shop",
  },
  {
    to: "/saved",
    title: "Saved Looks",
    desc: "Save and compare your favorite outfits.",
    image: featSaved,
    tag: "Library",
  },
  {
    to: "/video-studio",
    title: "Showcase Video",
    desc: "Create short outfit videos to share.",
    image: featVideo,
    tag: "Reels",
  },
];

const ideas = [
  { to: "/try-on" as const, title: "Try a Summer Look", desc: "Upload your photo and try a light outfit." },
  { to: "/stylo" as const, title: "Find Your Color Palette", desc: "Ask Stylo which colors suit you best." },
  { to: "/saved" as const, title: "Save Your First Look", desc: "Compare outfits before you buy." },
];

function HomeScreen() {
  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <div className="tv-home-scroll relative z-10 flex-1 w-full">
          {/* Header */}
          <header className="w-full px-5 pt-5 flex items-center justify-between">
            <Link to="/home" aria-label="TryVerse home">
              <TryVerseLogo height={30} />
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/notifications" className="tv-icon-btn" aria-label="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>
                <span className="tv-dot-badge" aria-hidden />
              </Link>
              <Link to="/profile" aria-label="Profile" className="tv-avatar">HK</Link>
            </div>
          </header>

          {/* Greeting */}
          <section className="px-5 mt-5">
            <div className="tv-body text-[11px] uppercase tracking-[0.22em] text-violet-300/70 tv-enter-1">
              Welcome back,
            </div>
            <h1 className="tv-heading text-white text-[26px] leading-tight mt-1 tv-enter-2">
              <span className="tv-grad">Hussnain</span>
            </h1>
            <p className="tv-body mt-2 text-[12.5px] text-white/60 tv-enter-3">
              What would you like to try today?
            </p>
            <div className="mt-3 tv-enter-3">
              <Link to="/credits" className="tv-credit-pill" aria-label="View credits">
                <span className="tv-credit-dot" />
                Pro · 182 credits
              </Link>
            </div>
          </section>

          {/* Privacy card */}
          <section className="px-5 mt-4">
            <div className="tv-privacy-card">
              <div className="tv-privacy-icon" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <div className="min-w-0">
                <div className="tv-body text-[11.5px] text-white font-medium leading-tight">
                  Your privacy is protected
                </div>
                <div className="tv-body text-[10.5px] text-white/55 leading-snug mt-0.5">
                  Uploads and generated results are deleted after your session.
                </div>
              </div>
            </div>
          </section>

          {/* Feature cards */}
          <section className="px-5 mt-5">
            <div className="flex items-center justify-between">
              <h2 className="tv-section-title">Explore</h2>
              <span className="tv-body text-[10.5px] text-white/45">6 features</span>
            </div>
            <div className="tv-feat-grid mt-3">
              {features.map((f, i) => (
                <Link
                  key={f.to}
                  to={f.to}
                  className={`tv-feat-card tv-feat-card-media tv-feat-card-${i + 1}`}
                >
                  <div className="tv-feat-media">
                    <img
                      src={f.image}
                      alt={f.title}
                      className="tv-feat-media-img"
                      loading="lazy"
                    />
                    <span className="tv-feat-media-tag">{f.tag}</span>
                  </div>
                  <div className="tv-feat-media-body">
                    <div className="tv-feat-title">{f.title}</div>
                    <div className="tv-feat-desc">{f.desc}</div>
                  </div>
                  <div className="tv-feat-arrow" aria-hidden>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Ideas */}
          <section className="px-5 mt-6">
            <h2 className="tv-section-title">Ideas to try</h2>
            <div className="mt-3 flex flex-col gap-2">
              {ideas.map((it) => (
                <Link key={it.title} to={it.to} className="tv-idea-card">
                  <div className="tv-idea-icon" aria-hidden>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="tv-idea-title truncate">{it.title}</div>
                    <div className="tv-idea-desc">{it.desc}</div>
                  </div>
                  <span className="tv-idea-cta">Start →</span>
                </Link>
              ))}
            </div>
          </section>

          <div className="h-6" />
        </div>

        <StyloFloatingAssistant />
        <BottomNav />
      </div>
    </div>
  );
}