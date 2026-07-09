import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import userImg from "@/assets/tv-user.jpg";
import { tvActions } from "@/lib/tryverse-store";
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

export const Route = createFileRoute("/pose-studio/result")({
  head: () => ({
    meta: [
      { title: "Pose Results — TryVerse" },
      { name: "description", content: "Your polished pose variations." },
    ],
  }),
  component: PoseResult,
});

type PoseInfo = { slug: string; name: string; tint: string; image: string };

const ALL_POSES: PoseInfo[] = [
  { slug: "white-studio", name: "White Studio", tint: "linear-gradient(160deg,#f0f0f0,#c0c0c0)", image: catalogWhite },
  { slug: "grey-backdrop", name: "Grey Backdrop", tint: "linear-gradient(160deg,#b0b8cf,#4b5570)", image: catalogGrey },
  { slug: "pastel-studio", name: "Pastel Studio", tint: "linear-gradient(160deg,#ffd8ec,#a17bff)", image: catalogPastel },
  { slug: "confident-standing", name: "Confident Standing", tint: "linear-gradient(160deg,#9cb8ff,#3b4dff)", image: proStanding },
  { slug: "executive-walk", name: "Executive Walk", tint: "linear-gradient(160deg,#8cbcff,#3b5dff)", image: proWalk },
  { slug: "business-portrait", name: "Business Portrait", tint: "linear-gradient(160deg,#e8d8ff,#8a6dff)", image: proPortrait },
  { slug: "casual-lean", name: "Casual Lean", tint: "linear-gradient(160deg,#b48cff,#6d3bff)", image: casualLean },
  { slug: "hands-pockets", name: "Hands-in-Pockets", tint: "linear-gradient(160deg,#ffb08c,#8a4b2b)", image: casualPockets },
  { slug: "street-stroll", name: "Street Stroll", tint: "linear-gradient(160deg,#ff8cc8,#a13b8a)", image: casualStroll },
  { slug: "window-gaze", name: "Window Gaze", tint: "linear-gradient(160deg,#c0a8ff,#6a4bff)", image: editWindow },
  { slug: "dramatic-profile", name: "Dramatic Profile", tint: "linear-gradient(160deg,#6d3bff,#1a0a3d)", image: editProfile },
  { slug: "model-turn", name: "Model Turn", tint: "linear-gradient(160deg,#ff8cc8,#4a1b8a)", image: editTurn },
  { slug: "coffee-shop", name: "Coffee Shop", tint: "linear-gradient(160deg,#d4a87a,#8a5b2b)", image: lifeCafe },
  { slug: "garden-portrait", name: "Garden Portrait", tint: "linear-gradient(160deg,#a8d4c8,#3b8a7b)", image: lifeGarden },
  { slug: "urban-background", name: "Urban Background", tint: "linear-gradient(160deg,#ffc48c,#a15b2b)", image: lifeUrban },
  { slug: "garden-wedding", name: "Garden Wedding", tint: "linear-gradient(160deg,#ffd8ec,#a13b8a)", image: eventWedding },
  { slug: "evening-gala", name: "Evening Gala", tint: "linear-gradient(160deg,#4a1b8a,#1a0a3d)", image: eventGala },
  { slug: "outdoor-reception", name: "Outdoor Reception", tint: "linear-gradient(160deg,#ffb08c,#8a4b2b)", image: eventReception },
  { slug: "poolside-resort", name: "Poolside Resort", tint: "linear-gradient(160deg,#8cd4ff,#3b6dff)", image: resortPool },
  { slug: "beach-sunset", name: "Beach Sunset", tint: "linear-gradient(160deg,#ffc48c,#a15b2b)", image: resortBeach },
  { slug: "boutique-hotel", name: "Boutique Hotel", tint: "linear-gradient(160deg,#d4a87a,#8a5b2b)", image: resortHotel },
  { slug: "gym-session", name: "Gym Session", tint: "linear-gradient(160deg,#9cb8ff,#3b4dff)", image: fitGym },
  { slug: "morning-run", name: "Morning Run", tint: "linear-gradient(160deg,#ffc48c,#a15b2b)", image: fitRun },
  { slug: "yoga-studio", name: "Yoga Studio", tint: "linear-gradient(160deg,#e8d8ff,#8a6dff)", image: fitYoga },
  { slug: "jump-shot", name: "Jump Shot", tint: "linear-gradient(160deg,#e8d8ff,#8a6dff)", image: actionJump },
  { slug: "wind-pose", name: "Wind Pose", tint: "linear-gradient(160deg,#b8a0ff,#4a2bff)", image: actionWind },
  { slug: "dance-move", name: "Dance Move", tint: "linear-gradient(160deg,#ffb08c,#8a4b2b)", image: actionDance },
];

const DEFAULT_POSES = ["white-studio", "executive-walk", "window-gaze", "poolside-resort"];

function PoseResult() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string>(userImg);
  const [poses, setPoses] = useState<PoseInfo[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let slugs = DEFAULT_POSES;
    let p: string = userImg;
    try {
      const raw = window.sessionStorage.getItem("tv-pose-run");
      if (raw) {
        const data = JSON.parse(raw) as { photo?: string; poses?: string[] };
        if (data.photo) p = data.photo;
        if (data.poses && data.poses.length) slugs = data.poses;
      }
    } catch {}
    const resolved = slugs
      .map((s) => ALL_POSES.find((x) => x.slug === s))
      .filter((x): x is PoseInfo => !!x);
    setPhoto(p);
    setPoses(resolved.length ? resolved : ALL_POSES.filter((p) => DEFAULT_POSES.includes(p.slug)));
  }, []);

  function handleSaveAll() {
    if (saving) return;
    setSaving(true);
    poses.forEach((pose) => {
      tvActions.saveLook({
        outfit: {
          slug: `pose-${pose.slug}`,
          name: `Pose · ${pose.name}`,
          image: photo,
          tint: pose.tint,
          store: "Pose Studio",
          color: "—",
        },
        photo,
        result: photo,
        size: "—",
        fitNote: `${pose.name} pose variation`,
        tag: "try-on",
      });
    });
    toast.success("Pose results saved");
    setTimeout(() => navigate({ to: "/saved" }), 500);
  }

  function handleSaveOne(pose: PoseInfo) {
    tvActions.saveLook({
      outfit: {
        slug: `pose-${pose.slug}`,
        name: `Pose · ${pose.name}`,
        image: photo,
        tint: pose.tint,
        store: "Pose Studio",
        color: "—",
      },
      photo,
      result: photo,
      size: "—",
      fitNote: `${pose.name} pose variation`,
      tag: "try-on",
    });
    toast.success(`${pose.name} saved`);
  }

  function handleDownload(pose: PoseInfo) {
    toast(`Download queued · ${pose.name}`);
  }

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between">
          <BackButton fallback="/pose-studio" />
          <TryVerseLogo height={26} />
          <Link to="/profile" aria-label="Profile" className="tv-avatar">HK</Link>
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full">
          <section className="px-5 mt-4 tv-enter-1">
            <h1 className="tv-heading text-white text-[24px] leading-tight">
              Your <span className="tv-grad">Pose Results</span>
            </h1>
            <p className="tv-body mt-2 text-[12.5px] text-white/60">
              Here are your polished pose variations.
            </p>
          </section>

          <section className="px-5 mt-5 tv-enter-2">
            <div className="tv-to-card">
              <div className="tv-to-card-title">Original Photo</div>
              <div className="tv-photo-preview mt-2">
                <img src={photo} alt="Original outfit" />
              </div>
            </div>
          </section>

          <section className="px-5 mt-4 tv-enter-3">
            <div className="tv-to-card-title mb-2">Pose Variations</div>
            <div className="tv-to-outfit-row">
              {poses.map((pose, i) => (
                <article
                  key={pose.slug}
                  className="tv-to-outfit"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <div className="tv-to-outfit-media" style={{ background: pose.tint, position: "relative" }}>
                    <img
                      src={pose.image}
                      alt={pose.name}
                      loading="lazy"
                    />
                  </div>
                  <div className="tv-to-outfit-name">{pose.name}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="tv-icon-btn"
                      aria-label={`Download ${pose.name}`}
                      onClick={() => handleDownload(pose)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M6 11l6 6 6-6"/><path d="M5 21h14"/></svg>
                    </button>
                    <button
                      type="button"
                      className="tv-icon-btn"
                      aria-label={`Save ${pose.name}`}
                      onClick={() => handleSaveOne(pose)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="px-5 mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving}
              className="tv-cta tv-body h-12 rounded-full text-white font-medium text-[14px] flex items-center justify-center"
            >
              {saving ? "Saving…" : "Save Results"}
            </button>
            <div className="grid grid-cols-3 gap-2">
              <Link to="/pose-studio" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[11.5px] flex items-center justify-center">
                Try Another
              </Link>
              <Link to="/video-studio" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[11.5px] flex items-center justify-center">
                Create Video
              </Link>
              <Link to="/stylo" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[11.5px] flex items-center justify-center">
                Ask Stylo
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