import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import logoAsset from "@/assets/tryverse-logo.png.asset.json";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "TryVerse — Try it before you buy it" },
      { name: "description", content: "TryVerse premium AI fashion app for shoppers." },
    ],
  }),
  component: SplashScreen,
});

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const id = window.setTimeout(() => {
      navigate({ to: "/welcome" });
    }, 2800);
    return () => window.clearTimeout(id);
  }, [navigate]);

  return (
    <div
      className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden"
      onClick={() => navigate({ to: "/welcome" })}
      role="button"
      tabIndex={0}
      aria-label="Skip splash"
    >
      <div className="tv-frame relative flex flex-col items-center justify-center overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        {/* Particles */}
        <div className="tv-splash-particles" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className={`tv-particle tv-particle-${i + 1}`} />
          ))}
        </div>

        {/* Central content */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="tv-splash-halo" aria-hidden />

          {/* Logo reveal */}
          <div className="tv-splash-logo-wrap relative" aria-label="TryVerse">
            <img
              src={logoAsset.url}
              alt="TryVerse"
              className="tv-splash-logo"
              draggable={false}
            />
            <span className="tv-splash-sweep" aria-hidden />
          </div>

          {/* Tagline */}
          <p className="tv-splash-tagline tv-body">Try it before you buy it.</p>

          {/* Progress line */}
          <div className="tv-splash-progress" aria-hidden>
            <span className="tv-splash-progress-fill" />
          </div>
        </div>
      </div>
    </div>
  );
}