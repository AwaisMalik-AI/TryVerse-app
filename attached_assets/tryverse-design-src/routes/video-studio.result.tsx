import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import userImg from "@/assets/tv-user.jpg";
import { tvActions } from "@/lib/tryverse-store";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/video-studio/result")({
  head: () => ({
    meta: [
      { title: "Your Showcase Video — TryVerse" },
      { name: "description", content: "Your short outfit video is ready." },
    ],
  }),
  component: VideoResult,
});

type StyleInfo = { slug: string; name: string; tint: string; image?: string };

type RunData = {
  photo?: string;
  style?: StyleInfo;
  duration?: string;
  ratio?: string;
  music?: string;
  overlay?: boolean;
};

const DEFAULT_STYLE: StyleInfo = { slug: "reels-spin", name: "Reels Spin", tint: "linear-gradient(160deg,#b48cff,#6d3bff)" };

function VideoResult() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string>(userImg);
  const [style, setStyle] = useState<StyleInfo>(DEFAULT_STYLE);
  const [duration, setDuration] = useState("8 sec");
  const [ratio, setRatio] = useState("9:16");
  const [music, setMusic] = useState("Soft Beat");
  const [playing, setPlaying] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("tv-video-run");
      if (raw) {
        const data = JSON.parse(raw) as RunData;
        if (data.photo) setPhoto(data.photo);
        if (data.style) setStyle(data.style);
        if (data.duration) setDuration(data.duration);
        if (data.ratio) setRatio(data.ratio);
        if (data.music) setMusic(data.music);
      }
    } catch {}
  }, []);

  function handleSave() {
    if (saving) return;
    setSaving(true);
    tvActions.saveLook({
      outfit: {
        slug: `video-${style.slug}`,
        name: `Video · ${style.name}`,
        image: photo,
        tint: style.tint,
        store: "Showcase Video",
        color: "—",
      },
      photo,
      result: photo,
      size: "—",
      fitNote: `${style.name} · ${duration} · ${ratio}`,
      tag: "try-on",
    });
    toast.success("Video saved");
    setTimeout(() => navigate({ to: "/saved" }), 500);
  }

  function handleDownload() {
    toast("Download starting soon");
  }

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between">
          <BackButton fallback="/video-studio" />
          <TryVerseLogo height={26} />
          <Link to="/profile" aria-label="Profile" className="tv-avatar">HK</Link>
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full">
          <section className="px-5 mt-4 tv-enter-1">
            <h1 className="tv-heading text-white text-[24px] leading-tight">
              Your <span className="tv-grad">Showcase Video</span>
            </h1>
            <p className="tv-body mt-2 text-[12.5px] text-white/60">
              Your short outfit video is ready.
            </p>
          </section>

          <section className="px-5 mt-5 tv-enter-2 flex justify-center">
            <div
              style={{
                width: 240,
                aspectRatio: "9 / 16",
                borderRadius: 22,
                overflow: "hidden",
                position: "relative",
                background: style.tint,
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 20px 60px -10px rgba(109,59,255,0.5)",
                animation: "tv-fade-scale 500ms ease",
              }}
            >
              <img
                src={style.image || photo}
                alt="Outfit"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              {photo && (
                <img
                  src={photo}
                  alt=""
                  aria-hidden
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.28, mixBlendMode: "screen" }}
                />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,0) 40%,rgba(0,0,0,0.55) 100%)" }} />
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? "Pause" : "Play"}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 62,
                  height: 62,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.92)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2a1560",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  animation: playing ? undefined : "tv-pulse 1.8s ease-in-out infinite",
                  border: "none",
                }}
              >
                {playing ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <div style={{ position: "absolute", left: 12, bottom: 12, padding: "4px 10px", borderRadius: 999, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", backdropFilter: "blur(6px)" }}>
                {duration.toUpperCase()} VIDEO
              </div>
            </div>
          </section>

          <section className="px-5 mt-5 tv-enter-3">
            <div className="tv-to-card">
              <div className="tv-to-card-title">Video Details</div>
              <div className="mt-3 flex flex-col gap-2">
                {[
                  { k: "Style", v: style.name },
                  { k: "Format", v: ratio },
                  { k: "Music", v: music },
                  { k: "Quality", v: "HD Preview" },
                ].map((row) => (
                  <div key={row.k} className="flex items-center justify-between text-[12px]">
                    <span className="text-white/55">{row.k}</span>
                    <span className="text-white/90 font-medium">{row.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="tv-cta tv-body h-12 rounded-full text-white font-medium text-[14px] flex items-center justify-center"
            >
              {saving ? "Saving…" : "Save Video"}
            </button>
            <Link
              to="/video-studio"
              className="tv-cta-secondary tv-body h-11 rounded-full text-white/90 font-medium text-[12.5px] flex items-center justify-center"
            >
              Create Another
            </Link>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <button
                type="button"
                onClick={handleDownload}
                className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[11.5px] flex items-center justify-center"
              >
                Download
              </button>
              <Link to="/stylo" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[11.5px] flex items-center justify-center">
                Ask Stylo
              </Link>
              <Link to="/try-on" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[11.5px] flex items-center justify-center">
                Try Another
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