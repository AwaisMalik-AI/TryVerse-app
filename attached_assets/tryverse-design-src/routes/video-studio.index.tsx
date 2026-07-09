import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import userImg from "@/assets/tv-user.jpg";
import { useTryVerse } from "@/lib/tryverse-store";
import { BackButton } from "@/components/BackButton";

import vsSpin from "@/assets/videos/vs-spin.jpg";
import vsRunway from "@/assets/videos/vs-runway.jpg";
import vsPoseShift from "@/assets/videos/vs-pose-shift.jpg";
import vsSlowmo from "@/assets/videos/vs-slowmo.jpg";
import vsTurn from "@/assets/videos/vs-turn.jpg";
import vsEditorial from "@/assets/videos/vs-editorial.jpg";

export const Route = createFileRoute("/video-studio/")({
  head: () => ({
    meta: [
      { title: "Showcase Video — TryVerse" },
      { name: "description", content: "Turn your outfit into a short fashion video for sharing." },
    ],
  }),
  component: VideoStudioScreen,
});

type VideoStyle = {
  slug: string;
  name: string;
  desc: string;
  tint: string;
  image: string;
  badge: string;
};

const STYLES: VideoStyle[] = [
  {
    slug: "spin-360",
    name: "360° Spin",
    desc: "Full-body turntable rotation showing the outfit from every angle.",
    tint: "linear-gradient(160deg,#6d3bff,#1a0a3d)",
    image: vsSpin,
    badge: "360°",
  },
  {
    slug: "runway-walk",
    name: "Runway Walk",
    desc: "Confident catwalk motion, ideal for Reels and brand content.",
    tint: "linear-gradient(160deg,#c48cff,#6d3bff)",
    image: vsRunway,
    badge: "Reels",
  },
  {
    slug: "pose-shift",
    name: "Pose Shift",
    desc: "Smooth transitions between 3–4 natural poses.",
    tint: "linear-gradient(160deg,#ff9ac4,#8a2b6d)",
    image: vsPoseShift,
    badge: "3–4 poses",
  },
  {
    slug: "slow-motion-walk",
    name: "Slow Motion Walk",
    desc: "Cinematic slow-motion fashion walk with fabric movement.",
    tint: "linear-gradient(160deg,#8cd4ff,#3b6dff)",
    image: vsSlowmo,
    badge: "Slow-mo",
  },
  {
    slug: "graceful-turn",
    name: "Graceful Turn",
    desc: "Elegant half-turn revealing front and back of the outfit.",
    tint: "linear-gradient(160deg,#e8d8ff,#8a6dff)",
    image: vsTurn,
    badge: "Half-turn",
  },
  {
    slug: "editorial-stance",
    name: "Editorial Stance",
    desc: "Magazine-style pose with premium brand energy.",
    tint: "linear-gradient(160deg,#ff8cc8,#4a1b8a)",
    image: vsEditorial,
    badge: "Editorial",
  },
];

const DURATIONS = ["8 sec", "12 sec", "15 sec"] as const;
const RATIOS = ["9:16", "1:1", "4:5"] as const;
const MUSICS = ["None", "Soft Beat", "Fashion Pop", "Calm Luxe"] as const;

const USE_CASES: { label: string; note: string }[] = [
  { label: "Instagram Reels", note: "9:16 ready" },
  { label: "TikTok Videos", note: "Trend-worthy" },
  { label: "Product Pages", note: "360° showcase" },
  { label: "Ads & Marketing", note: "Professional" },
];

function VideoStudioScreen() {
  const navigate = useNavigate();
  const { saved } = useTryVerse();
  const [photo, setPhoto] = useState<string | null>(null);
  const [styleSlug, setStyleSlug] = useState<string | null>(null);
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>("8 sec");
  const [ratio, setRatio] = useState<(typeof RATIOS)[number]>("9:16");
  const [music, setMusic] = useState<(typeof MUSICS)[number]>("Soft Beat");
  const [overlay, setOverlay] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const selectedStyle = STYLES.find((s) => s.slug === styleSlug) ?? null;

  const step = !photo ? 1 : !selectedStyle ? 2 : 3;
  const canGenerate = !!photo && !!selectedStyle && !generating;

  function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPhoto(userImg);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    try {
      window.sessionStorage.setItem(
        "tv-video-run",
        JSON.stringify({
          photo,
          style: selectedStyle,
          duration,
          ratio,
          music,
          overlay,
        }),
      );
    } catch {}
    setTimeout(() => navigate({ to: "/video-studio/result" }), 2000);
  }

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <div className="tv-home-scroll relative z-10 flex-1 w-full">
          <header className="w-full px-5 pt-5 flex items-center justify-between tv-enter-1">
            <div className="tv-header-left">
              <BackButton fallback="/home" />
              <Link to="/home" aria-label="TryVerse home" className="flex items-center">
              <TryVerseLogo height={30} />
            </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/notifications" className="tv-icon-btn" aria-label="Notifications">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>
                <span className="tv-dot-badge" aria-hidden />
              </Link>
              <Link to="/profile" aria-label="Profile" className="tv-avatar">HK</Link>
            </div>
          </header>

          <section className="px-5 mt-5 tv-enter-2">
            <h1 className="tv-heading text-white text-[24px] leading-tight">
              <span className="tv-grad">Showcase Video</span>
            </h1>
            <p className="tv-body mt-2 text-[12.5px] text-white/60">
              Turn your outfit into a short fashion video for sharing.
            </p>
          </section>

          <section className="px-5 mt-4 tv-enter-3">
            <div className="tv-step-row">
              {[
                { n: 1, label: "Upload" },
                { n: 2, label: "Style" },
                { n: 3, label: "Generate" },
              ].map((s, i, arr) => (
                <div key={s.n} className="tv-step-item">
                  <div className={`tv-step-dot ${step >= s.n ? "tv-step-dot-active" : ""} ${step === s.n ? "tv-step-dot-current" : ""}`}>
                    {step > s.n ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    ) : (
                      <span>{s.n}</span>
                    )}
                  </div>
                  <div className={`tv-step-label ${step === s.n ? "tv-step-label-current" : ""}`}>{s.label}</div>
                  {i < arr.length - 1 && <div className={`tv-step-line ${step > s.n ? "tv-step-line-active" : ""}`} aria-hidden />}
                </div>
              ))}
            </div>
          </section>

          {/* Step 1 — Upload */}
          <section className="px-5 mt-5">
            <div className="tv-to-card">
              <div className="tv-to-card-title">Choose Your Outfit</div>
              {!photo ? (
                <div className="tv-upload">
                  <div className="tv-upload-icon" aria-hidden>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  </div>
                  <div className="tv-upload-title">Upload outfit image</div>
                  <div className="tv-upload-help">Use a try-on result, saved look, or full-body outfit photo.</div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePickFile} />
                  <div className="flex flex-col items-center gap-2 mt-4 w-full">
                    <button
                      type="button"
                      className="tv-cta-secondary tv-body h-11 rounded-full px-6 text-white/90 font-medium text-[12.5px]"
                      onClick={() => fileRef.current?.click()}
                    >
                      Upload Image
                    </button>
                    <button
                      type="button"
                      className="tv-body text-[11.5px] text-white/70 underline underline-offset-2"
                      onClick={() => setSheetOpen(true)}
                    >
                      Choose Saved Look
                    </button>
                    <button
                      type="button"
                      className="tv-body text-[10.5px] text-white/50 mt-1 underline underline-offset-2"
                      onClick={() => setPhoto(userImg)}
                    >
                      Use demo photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="tv-photo-preview">
                  <img src={photo} alt="Outfit preview" />
                  <div className="tv-photo-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    Look selected
                  </div>
                  <button type="button" className="tv-photo-change" onClick={() => setPhoto(null)}>Change</button>
                </div>
              )}
            </div>
          </section>

          {/* Step 2 — Style */}
          <section className={`px-5 mt-4 tv-outfit-section ${!photo ? "tv-disabled" : ""}`}>
            <div className="tv-to-card">
              <div className="tv-to-card-title">Choose Video Style</div>
              <p className="tv-body text-[11px] text-white/50 mt-1 leading-snug">
                Pick a motion style. Every video is a premium 8-second fashion clip.
              </p>

              <div className="tv-pose-grid mt-4">
                {STYLES.map((s) => {
                  const isSel = styleSlug === s.slug;
                  return (
                    <button
                      type="button"
                      key={s.slug}
                      className={`tv-pose-card ${isSel ? "tv-pose-card-active" : ""}`}
                      onClick={() => setStyleSlug(s.slug)}
                      aria-pressed={isSel}
                    >
                      <div className="tv-pose-media">
                        <img src={s.image} alt={s.name} loading="lazy" width={640} height={896} />
                        <span className="tv-pose-gender-badge">{s.badge}</span>
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            bottom: 8,
                            left: 8,
                            padding: "3px 8px",
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            borderRadius: 999,
                            background: "rgba(0,0,0,0.6)",
                            color: "rgba(255,255,255,0.95)",
                            border: "1px solid rgba(255,255,255,0.14)",
                            zIndex: 2,
                          }}
                        >
                          8 SEC
                        </span>
                        {isSel && (
                          <span aria-hidden className="tv-pose-check">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </span>
                        )}
                      </div>
                      <div className="tv-pose-name">{s.name}</div>
                      <div className="tv-pose-desc">{s.desc}</div>
                    </button>
                  );
                })}
              </div>

              {selectedStyle && (
                <div className="tv-selected mt-3">
                  <div className="tv-selected-thumb">
                    <img src={selectedStyle.image} alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="tv-selected-label">Selected Style</div>
                    <div className="tv-selected-name truncate">{selectedStyle.name}</div>
                  </div>
                  <button type="button" className="tv-selected-change" onClick={() => setStyleSlug(null)}>Change</button>
                </div>
              )}
            </div>
          </section>

          {/* Section 3 — Settings */}
          <section className="px-5 mt-4">
            <div className="tv-to-card">
              <div className="tv-to-card-title">Video Settings</div>
              <div className="mt-3">
                <div className="tv-body text-[11px] text-white/55 uppercase tracking-wider mb-1.5">Duration</div>
                <div className="flex gap-2 flex-wrap">
                  {DURATIONS.map((d) => (
                    <button key={d} type="button" className={`tv-tab ${duration === d ? "tv-tab-active" : ""}`} onClick={() => setDuration(d)}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <div className="tv-body text-[11px] text-white/55 uppercase tracking-wider mb-1.5">Aspect Ratio</div>
                <div className="flex gap-2 flex-wrap">
                  {RATIOS.map((r) => (
                    <button key={r} type="button" className={`tv-tab ${ratio === r ? "tv-tab-active" : ""}`} onClick={() => setRatio(r)}>{r}</button>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <div className="tv-body text-[11px] text-white/55 uppercase tracking-wider mb-1.5">Music</div>
                <div className="flex gap-2 flex-wrap">
                  {MUSICS.map((m) => (
                    <button key={m} type="button" className={`tv-tab ${music === m ? "tv-tab-active" : ""}`} onClick={() => setMusic(m)}>{m}</button>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="tv-body text-[12.5px] text-white/90 font-medium">Text Overlay</div>
                  <div className="tv-body text-[10.5px] text-white/50">Add outfit title on video.</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={overlay}
                  onClick={() => setOverlay((v) => !v)}
                  style={{
                    width: 44,
                    height: 26,
                    borderRadius: 999,
                    background: overlay ? "linear-gradient(135deg,#a17bff,#6d3bff)" : "rgba(255,255,255,0.12)",
                    position: "relative",
                    transition: "background 200ms ease",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 2,
                      left: overlay ? 20 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      background: "white",
                      transition: "left 200ms ease",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
                    }}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Credits card */}
          <section className="px-5 mt-4">
            <div
              className="tv-to-card"
              style={{
                background: "linear-gradient(160deg, rgba(147,59,255,0.16), rgba(255,255,255,0.03))",
                borderColor: "rgba(201,59,255,0.28)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="tv-body text-[10.5px] text-white/55 uppercase tracking-wider">Credits per video</div>
                  <div className="tv-heading text-white text-[20px] leading-tight mt-0.5">
                    <span className="tv-grad">10 credits</span>
                  </div>
                </div>
                <Link
                  to="/pricing"
                  className="tv-cta-secondary tv-body h-9 rounded-full px-4 text-white/90 font-medium text-[11.5px] flex items-center"
                >
                  Get credits
                </Link>
              </div>
              <ul className="mt-3 grid grid-cols-1 gap-1.5">
                {[
                  "8-second HD video",
                  "3 aspect ratios",
                  "6 video styles",
                  "Background removal",
                  "Instant download",
                ].map((b) => (
                  <li key={b} className="tv-body text-[11.5px] text-white/75 flex items-center gap-2">
                    <span
                      aria-hidden
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 999,
                        background: "linear-gradient(135deg,#a17bff,#6d3bff)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        flex: "0 0 auto",
                      }}
                    >
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Use case chips */}
          <section className="px-5 mt-4">
            <div className="tv-body text-[11px] text-white/55 uppercase tracking-wider mb-2 px-1">
              Perfect for
            </div>
            <div className="grid grid-cols-2 gap-2">
              {USE_CASES.map((u) => (
                <div
                  key={u.label}
                  className="rounded-2xl px-3 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="tv-body text-[12px] text-white/90 font-medium leading-tight">{u.label}</div>
                  <div className="tv-body text-[10.5px] text-white/50 mt-0.5">{u.note}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Step 4 — Generate */}
          <section className="px-5 mt-5">
            <button
              type="button"
              disabled={!canGenerate}
              onClick={handleGenerate}
              className={`tv-cta tv-body h-12 rounded-full text-white font-medium text-[14px] w-full flex items-center justify-center gap-2 ${canGenerate ? "tv-cta-ready" : "tv-cta-off"}`}
            >
              {generating ? (
                <>
                  <span className="tv-spinner" aria-hidden />
                  Creating your showcase video...
                </>
              ) : (
                <>Generate Video</>
              )}
            </button>
            {generating && (
              <div className="mt-3 rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {["Preparing outfit", "Applying motion style", "Rendering video"].map((line, i) => (
                  <div key={line} className="tv-body text-[11.5px] text-white/70 flex items-center gap-2 py-0.5" style={{ opacity: 0.55 + i * 0.15 }}>
                    <span className="tv-spinner" aria-hidden style={{ width: 10, height: 10 }} />
                    {line}
                  </div>
                ))}
              </div>
            )}
            <div className="tv-body text-[10.5px] text-white/45 mt-2.5 text-center px-4 leading-snug">
              Your uploaded image is deleted after your session.
            </div>
          </section>

          <div className="h-24" />
        </div>

        {sheetOpen && (
          <>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSheetOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                zIndex: 30,
                backdropFilter: "blur(4px)",
              }}
            />
            <div
              className="tv-body"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 31,
                background: "linear-gradient(180deg,rgba(30,15,55,0.95),rgba(15,8,28,0.98))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                padding: 20,
                maxHeight: "70%",
                overflowY: "auto",
                animation: "tv-slide-up 260ms ease",
              }}
            >
              <div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.2)", margin: "0 auto 12px" }} />
              <div className="tv-heading text-white text-[16px] mb-1">Choose a Saved Look</div>
              <div className="text-[11.5px] text-white/55 mb-3">Pick one of your saved try-on looks.</div>
              {saved.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-[12px] text-white/60 mb-3">You don't have any saved looks yet.</div>
                  <Link to="/try-on" className="tv-cta-secondary tv-body h-10 rounded-full px-5 text-white/90 font-medium text-[11.5px] inline-flex items-center justify-center">
                    Go to Try-On
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {saved.map((look) => (
                    <button
                      key={look.id}
                      type="button"
                      onClick={() => {
                        setPhoto(look.result || look.photo);
                        setSheetOpen(false);
                        toast.success("Saved look selected");
                      }}
                      className="tv-to-outfit"
                      style={{ textAlign: "left" }}
                    >
                      <div className="tv-to-outfit-media" style={{ background: look.outfit.tint }}>
                        <img src={look.result || look.photo} alt={look.outfit.name} loading="lazy" />
                      </div>
                      <div className="tv-to-outfit-name">{look.outfit.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <BottomNav />
      </div>
    </div>
  );
}