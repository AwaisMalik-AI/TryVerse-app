import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import userImg from "@/assets/tv-user.jpg";
import { BackButton } from "@/components/BackButton";

import catalogWhite from "@/assets/poses/catalog-white.jpg";
import catalogGrey from "@/assets/poses/catalog-grey.jpg";
import catalogPastel from "@/assets/poses/catalog-pastel.jpg";
import proStanding from "@/assets/poses/pro-standing.jpg";
import proWalk from "@/assets/poses/pro-walk.jpg";
import proPortrait from "@/assets/poses/pro-portrait.jpg";
import casualLean from "@/assets/poses/casual-lean.jpg";
import casualPockets from "@/assets/poses/casual-pockets.jpg";
import casualStroll from "@/assets/poses/casual-stroll.jpg";
import editWindow from "@/assets/poses/edit-window.jpg";
import editProfile from "@/assets/poses/edit-profile.jpg";
import editTurn from "@/assets/poses/edit-turn.jpg";
import lifeCafe from "@/assets/poses/life-cafe.jpg";
import lifeGarden from "@/assets/poses/life-garden.jpg";
import lifeUrban from "@/assets/poses/life-urban.jpg";
import eventWedding from "@/assets/poses/event-wedding.jpg";
import eventGala from "@/assets/poses/event-gala.jpg";
import eventReception from "@/assets/poses/event-reception.jpg";
import resortPool from "@/assets/poses/resort-pool.jpg";
import resortBeach from "@/assets/poses/resort-beach.jpg";
import resortHotel from "@/assets/poses/resort-hotel.jpg";
import fitGym from "@/assets/poses/fit-gym.jpg";
import fitRun from "@/assets/poses/fit-run.jpg";
import fitYoga from "@/assets/poses/fit-yoga.jpg";
import actionJump from "@/assets/poses/action-jump.jpg";
import actionWind from "@/assets/poses/action-wind.jpg";
import actionDance from "@/assets/poses/action-dance.jpg";

export const Route = createFileRoute("/pose-studio/")({
  head: () => ({
    meta: [
      { title: "Pose Studio — TryVerse" },
      { name: "description", content: "Turn outfit photos into polished fashion poses." },
    ],
  }),
  component: PoseStudioScreen,
});

type Category =
  | "All"
  | "Catalog"
  | "Professional"
  | "Casual"
  | "Editorial"
  | "Lifestyle"
  | "Events"
  | "Resort"
  | "Fitness"
  | "Action";

type Gender = "All" | "Female" | "Male";

type Pose = {
  slug: string;
  name: string;
  desc: string;
  image: string;
  category: Exclude<Category, "All">;
  gender: Exclude<Gender, "All">;
};

const POSES: Pose[] = [
  // Catalog & E-Commerce
  { slug: "white-studio", name: "White Studio", desc: "Clean white e-commerce backdrop", image: catalogWhite, category: "Catalog", gender: "Female" },
  { slug: "grey-backdrop", name: "Grey Backdrop", desc: "Neutral studio catalog look", image: catalogGrey, category: "Catalog", gender: "Male" },
  { slug: "pastel-studio", name: "Pastel Studio", desc: "Soft pastel product framing", image: catalogPastel, category: "Catalog", gender: "Female" },
  // Professional
  { slug: "confident-standing", name: "Confident Standing", desc: "Straight and composed pose", image: proStanding, category: "Professional", gender: "Male" },
  { slug: "executive-walk", name: "Executive Walk", desc: "Purposeful lobby stride", image: proWalk, category: "Professional", gender: "Female" },
  { slug: "business-portrait", name: "Business Portrait", desc: "Polished LinkedIn framing", image: proPortrait, category: "Professional", gender: "Female" },
  // Casual
  { slug: "casual-lean", name: "Casual Lean", desc: "Relaxed lean against wall", image: casualLean, category: "Casual", gender: "Female" },
  { slug: "hands-pockets", name: "Hands-in-Pockets", desc: "Effortless everyday stance", image: casualPockets, category: "Casual", gender: "Male" },
  { slug: "street-stroll", name: "Street Stroll", desc: "Candid sidewalk walk", image: casualStroll, category: "Casual", gender: "Female" },
  // Editorial
  { slug: "window-gaze", name: "Window Gaze", desc: "Soft daylight moment", image: editWindow, category: "Editorial", gender: "Female" },
  { slug: "dramatic-profile", name: "Dramatic Profile", desc: "Sculpted side-profile light", image: editProfile, category: "Editorial", gender: "Male" },
  { slug: "model-turn", name: "Model Turn", desc: "Three-quarter couture turn", image: editTurn, category: "Editorial", gender: "Female" },
  // Lifestyle
  { slug: "coffee-shop", name: "Coffee Shop", desc: "Seated cafe candid", image: lifeCafe, category: "Lifestyle", gender: "Female" },
  { slug: "garden-portrait", name: "Garden Portrait", desc: "Golden hour greenery", image: lifeGarden, category: "Lifestyle", gender: "Male" },
  { slug: "urban-background", name: "Urban Background", desc: "Graphic street backdrop", image: lifeUrban, category: "Lifestyle", gender: "Female" },
  // Events
  { slug: "garden-wedding", name: "Garden Wedding", desc: "Elegant outdoor guest look", image: eventWedding, category: "Events", gender: "Female" },
  { slug: "evening-gala", name: "Evening Gala", desc: "Black-tie ballroom pose", image: eventGala, category: "Events", gender: "Male" },
  { slug: "outdoor-reception", name: "Outdoor Reception", desc: "String-light evening", image: eventReception, category: "Events", gender: "Male" },
  // Resort
  { slug: "poolside-resort", name: "Poolside Resort", desc: "Luxury poolside chic", image: resortPool, category: "Resort", gender: "Female" },
  { slug: "beach-sunset", name: "Beach Sunset", desc: "Warm golden hour stroll", image: resortBeach, category: "Resort", gender: "Male" },
  { slug: "boutique-hotel", name: "Boutique Hotel", desc: "Marble lobby elegance", image: resortHotel, category: "Resort", gender: "Female" },
  // Fitness
  { slug: "gym-session", name: "Gym Session", desc: "Active athletic stance", image: fitGym, category: "Fitness", gender: "Male" },
  { slug: "morning-run", name: "Morning Run", desc: "Mid-stride park run", image: fitRun, category: "Fitness", gender: "Female" },
  { slug: "yoga-studio", name: "Yoga Studio", desc: "Graceful standing pose", image: fitYoga, category: "Fitness", gender: "Female" },
  // Action
  { slug: "jump-shot", name: "Jump Shot", desc: "Freeze-motion mid-air", image: actionJump, category: "Action", gender: "Female" },
  { slug: "wind-pose", name: "Wind Pose", desc: "Flowing wind-caught fabric", image: actionWind, category: "Action", gender: "Female" },
  { slug: "dance-move", name: "Dance Move", desc: "Expressive graceful motion", image: actionDance, category: "Action", gender: "Female" },
];

const CATEGORIES: Category[] = [
  "All",
  "Catalog",
  "Professional",
  "Casual",
  "Editorial",
  "Lifestyle",
  "Events",
  "Resort",
  "Fitness",
  "Action",
];

const GENDERS: Gender[] = ["All", "Female", "Male"];
const MAX_POSES = 6;

function PoseStudioScreen() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("All");
  const [gender, setGender] = useState<Gender>("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const step = !photo ? 1 : selected.length === 0 ? 2 : 3;
  const canGenerate = !!photo && selected.length > 0 && !generating;

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

  function togglePose(slug: string) {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_POSES) return prev;
      return [...prev, slug];
    });
  }

  function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    try {
      const payload = { photo, poses: selected, category };
      window.sessionStorage.setItem("tv-pose-run", JSON.stringify(payload));
    } catch {}
    setTimeout(() => navigate({ to: "/pose-studio/result" }), 1700);
  }

  const visiblePoses = useMemo(() => {
    return POSES.filter((p) => {
      const catOk = category === "All" || p.category === category;
      const genOk = gender === "All" || p.gender === gender;
      return catOk && genOk;
    });
  }, [category, gender]);

  const selectedPoses = POSES.filter((p) => selected.includes(p.slug));

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
              <span className="tv-grad">Pose Studio</span>
            </h1>
            <p className="tv-body mt-2 text-[12.5px] text-white/60">
              Turn outfit photos into polished fashion poses for social, portfolios, and style inspiration.
            </p>
          </section>

          <section className="px-5 mt-4 tv-enter-3">
            <div className="tv-step-row">
              {[
                { n: 1, label: "Photo" },
                { n: 2, label: "Pose" },
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

          {/* Step 1 — Photo */}
          <section className="px-5 mt-5">
            <div className="tv-to-card">
              <div className="tv-to-card-title">Upload Your Outfit Photo</div>
              {!photo ? (
                <div className="tv-upload">
                  <div className="tv-upload-icon" aria-hidden>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                  <div className="tv-upload-title">Choose outfit photo</div>
                  <div className="tv-upload-help">Use a clear full-body photo for best results.</div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePickFile}
                  />
                  <button
                    type="button"
                    className="tv-cta-secondary tv-body h-11 rounded-full px-6 text-white/90 font-medium text-[12.5px] mt-4"
                    onClick={() => fileRef.current?.click()}
                  >
                    Choose Photo
                  </button>
                  <button
                    type="button"
                    className="tv-body text-[10.5px] text-white/50 mt-2 underline underline-offset-2"
                    onClick={() => setPhoto(userImg)}
                  >
                    Use demo photo
                  </button>
                </div>
              ) : (
                <div className="tv-photo-preview">
                  <img src={photo} alt="Uploaded outfit" />
                  <div className="tv-photo-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    Photo uploaded
                  </div>
                  <button type="button" className="tv-photo-change" onClick={() => setPhoto(null)}>Change</button>
                </div>
              )}
            </div>
          </section>

          {/* Step 2 — Pose */}
          <section className={`px-5 mt-4 tv-outfit-section ${!photo ? "tv-disabled" : ""}`}>
            <div className="tv-to-card">
              <div className="tv-to-card-title">Choose Your Pose</div>
              <p className="tv-body text-[11px] text-white/50 mt-1 leading-snug">
                Browse professional, lifestyle, editorial, and social-ready pose styles. Select up to {MAX_POSES}.
              </p>

              <div className="tv-chip-row mt-3 -mx-1 px-1 flex gap-2 overflow-x-auto">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`tv-tab ${category === c ? "tv-tab-active" : ""}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="mt-3 tv-gender-row">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`tv-gender-btn ${gender === g ? "tv-gender-btn-active" : ""}`}
                    onClick={() => setGender(g)}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="tv-pose-grid mt-4">
                {visiblePoses.map((p) => {
                  const isSel = selected.includes(p.slug);
                  const disabled = !isSel && selected.length >= MAX_POSES;
                  return (
                    <button
                      type="button"
                      key={p.slug}
                      className={`tv-pose-card ${isSel ? "tv-pose-card-active" : ""} ${disabled ? "opacity-40" : ""}`}
                      onClick={() => togglePose(p.slug)}
                      disabled={disabled}
                      aria-pressed={isSel}
                    >
                      <div className="tv-pose-media">
                        <img src={p.image} alt={p.name} loading="lazy" width={640} height={896} />
                        <span className="tv-pose-gender-badge">{p.gender === "Female" ? "F" : "M"}</span>
                        {isSel && (
                          <span aria-hidden className="tv-pose-check">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          </span>
                        )}
                      </div>
                      <div className="tv-pose-name">{p.name}</div>
                      <div className="tv-pose-desc">{p.desc}</div>
                    </button>
                  );
                })}
              </div>

              {visiblePoses.length === 0 && (
                <div className="tv-body text-[11.5px] text-white/50 mt-4 text-center py-6">
                  No poses match this filter. Try another category or gender.
                </div>
              )}

              {selectedPoses.length > 0 && (
                <div className="tv-selected mt-3">
                  <div className="tv-selected-thumb">
                    <img src={selectedPoses[0].image} alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="tv-selected-label">Your selected poses ({selectedPoses.length}/{MAX_POSES})</div>
                    <div className="tv-selected-name truncate">
                      {selectedPoses.map((p) => p.name).join(", ")}
                    </div>
                  </div>
                  <button type="button" className="tv-selected-change" onClick={() => setSelected([])}>Clear</button>
                </div>
              )}
            </div>
          </section>

          {/* Step 3 — Generate */}
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
                  Creating your pose variations...
                </>
              ) : (
                <>Generate Poses{selected.length > 0 ? ` · ${selected.length}` : ""}</>
              )}
            </button>
            <div className="tv-body text-[10.5px] text-white/45 mt-2.5 text-center px-4 leading-snug">
              Your uploaded photo is deleted after your session.
            </div>
          </section>

          <div className="h-24" />
        </div>

        <BottomNav />
      </div>
    </div>
  );
}