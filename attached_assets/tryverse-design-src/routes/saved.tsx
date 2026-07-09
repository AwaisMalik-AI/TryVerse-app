import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import blazerImg from "@/assets/tv-blazer-lavender.jpg";
import topImg from "@/assets/tv-top.jpg";
import pinkDressImg from "@/assets/tv-pink-dress.jpg";
import resultImg from "@/assets/tv-result.jpg";
import userImg from "@/assets/tv-user.jpg";
import { tvActions, useTryVerse, type SavedLook } from "@/lib/tryverse-store";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved Looks — TryVerse" },
      { name: "description", content: "Save and compare your favorite outfits." },
    ],
  }),
  component: SavedScreen,
});

const NOW = Date.now();
const DAY = 86400000;

const DEMO: SavedLook[] = [
  {
    id: "demo-1",
    outfit: { slug: "lavender-blazer", name: "Lavender Blazer Look", image: blazerImg, tint: "linear-gradient(160deg,#b48cff,#6d3bff)", color: "Lavender", store: "TryVerse Store", price: "$88" },
    photo: userImg,
    result: resultImg,
    size: "M",
    fitNote: "Regular fit",
    createdAt: NOW,
    tag: "try-on",
    favorite: true,
  },
  {
    id: "demo-2",
    outfit: { slug: "cream-sweater", name: "Cream Sweater Outfit", image: topImg, tint: "linear-gradient(160deg,#e9d9c4,#b39a7a)", color: "Cream", store: "TryVerse Store", price: "$62" },
    photo: userImg,
    result: resultImg,
    size: "S",
    fitNote: "Relaxed fit",
    createdAt: NOW - DAY,
    tag: "stylo",
    favorite: false,
  },
  {
    id: "demo-3",
    outfit: { slug: "pink-dress", name: "Pink Dress Compare", image: pinkDressImg, tint: "linear-gradient(160deg,#f7c6d3,#c86a92)", color: "Pink", store: "TryVerse Store", price: "$74" },
    photo: userImg,
    result: resultImg,
    size: "M",
    fitNote: "Slim fit",
    createdAt: NOW - DAY * 4,
    tag: "compare",
    favorite: false,
  },
];

type Filter = "all" | "try-on" | "stylo" | "compare" | "favorites";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "try-on", label: "Try-On" },
  { id: "stylo", label: "Stylo Picks" },
  { id: "compare", label: "Compare" },
  { id: "favorites", label: "Favorites" },
];

const TAG_LABEL: Record<NonNullable<SavedLook["tag"]>, string> = {
  "try-on": "Try-On Result",
  stylo: "Stylo Pick",
  compare: "Compare",
};

function relativeDate(ts: number) {
  const diff = Date.now() - ts;
  if (diff < DAY) return "Saved today";
  if (diff < DAY * 2) return "Saved yesterday";
  if (diff < DAY * 7) return "Saved this week";
  const d = new Date(ts);
  return `Saved ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

function SavedScreen() {
  const { saved } = useTryVerse();
  const [detail, setDetail] = useState<SavedLook | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SavedLook | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [localDemo, setLocalDemo] = useState<SavedLook[]>(DEMO);
  const [popId, setPopId] = useState<string | null>(null);

  const looks: SavedLook[] = useMemo(() => {
    const savedWithTags = saved.map((l) => ({ ...l, tag: l.tag ?? "try-on" as const }));
    return savedWithTags.length > 0 ? [...savedWithTags, ...localDemo] : localDemo;
  }, [saved, localDemo]);

  const filtered = useMemo(() => {
    if (filter === "all") return looks;
    if (filter === "favorites") return looks.filter((l) => l.favorite);
    return looks.filter((l) => l.tag === filter);
  }, [looks, filter]);

  function confirmDelete() {
    if (!pendingDelete) return;
    const l = pendingDelete;
    if (l.id.startsWith("demo-")) {
      setLocalDemo((prev) => prev.filter((x) => x.id !== l.id));
    } else {
      tvActions.deleteLook(l.id);
    }
    setPendingDelete(null);
    toast("Look removed");
  }

  function toggleFav(l: SavedLook) {
    setPopId(l.id);
    setTimeout(() => setPopId(null), 260);
    if (l.id.startsWith("demo-")) {
      setLocalDemo((prev) => prev.map((x) => (x.id === l.id ? { ...x, favorite: !x.favorite } : x)));
    } else {
      tvActions.toggleFavorite(l.id);
    }
  }

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between">
          <div className="tv-header-left">
            <BackButton fallback="/home" />
            <Link to="/home" aria-label="TryVerse home" className="flex items-center">
            <TryVerseLogo height={30} />
          </Link>
          </div>
          <Link to="/profile" aria-label="Profile" className="tv-avatar">HK</Link>
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full">
          <section className="px-5 mt-4 tv-enter-1">
            <h1 className="tv-heading text-white text-[24px] leading-tight">
              <span className="tv-grad">Saved Looks</span>
            </h1>
            <p className="tv-body mt-2 text-[12.5px] text-white/60">
              Keep your favorite outfits, compare styles, and try them again anytime.
            </p>
          </section>

          {/* Filter chips */}
          <section className="mt-4 tv-enter-2">
            <div className="tv-filter-row">
              {FILTERS.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  className={`tv-filter-chip ${filter === f.id ? "tv-filter-chip-active" : ""}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          <section className="px-5 mt-4 flex flex-col gap-3">
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((look, i) => (
                <article key={look.id} className={`tv-saved-card ${look.tag === "compare" ? "tv-saved-card-compare" : ""}`} style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="tv-saved-media" style={{ background: look.outfit.tint }}>
                    <img src={look.result} alt={look.outfit.name} loading="lazy" />
                    {look.tag === "compare" && <div className="tv-compare-divider" aria-hidden />}
                    <button
                      type="button"
                      className={`tv-heart ${look.favorite ? "tv-heart-on" : ""} ${popId === look.id ? "tv-heart-pop" : ""}`}
                      aria-label={look.favorite ? "Remove from favorites" : "Add to favorites"}
                      onClick={() => toggleFav(look)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={look.favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10z"/></svg>
                    </button>
                  </div>
                  <div className="tv-saved-body">
                    <div className="flex items-center gap-2">
                      <span className={`tv-saved-tag tv-saved-tag-${look.tag ?? "try-on"}`}>{TAG_LABEL[look.tag ?? "try-on"]}</span>
                    </div>
                    <div className="tv-saved-name mt-1.5">{look.outfit.name}</div>
                    <div className="tv-saved-meta">
                      {relativeDate(look.createdAt)} · Size {look.size} · {look.outfit.color}
                    </div>
                    <div className="tv-saved-actions">
                      <button type="button" className="tv-saved-btn" onClick={() => setDetail(look)}>View</button>
                      <Link to="/try-on" className="tv-saved-btn">Try Again</Link>
                      <Link to="/stylo" className="tv-saved-btn">Ask Stylo</Link>
                      <button type="button" className="tv-saved-btn tv-saved-btn-danger" onClick={() => setPendingDelete(look)}>Delete</button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </section>

          <div className="h-24" />
        </div>

        {detail && (
          <div className="tv-modal" role="dialog" aria-modal="true" onClick={() => setDetail(null)}>
            <div className="tv-modal-card" onClick={(e) => e.stopPropagation()}>
              <button type="button" className="tv-modal-close" onClick={() => setDetail(null)} aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
              <div className="tv-modal-media" style={{ background: detail.outfit.tint }}>
                <img src={detail.result} alt={detail.outfit.name} />
              </div>
              <div className="p-4">
                <div className="tv-selected-label">{TAG_LABEL[detail.tag ?? "try-on"]}</div>
                <div className="tv-selected-name mt-1">{detail.outfit.name}</div>
                <div className="tv-saved-meta mt-1">{relativeDate(detail.createdAt)}</div>
                <dl className="tv-detail-list mt-3">
                  <div><dt>Size</dt><dd>{detail.size}</dd></div>
                  <div><dt>Fit</dt><dd>{detail.fitNote}</dd></div>
                  <div><dt>Color</dt><dd>{detail.outfit.color ?? "—"}</dd></div>
                  <div><dt>Store</dt><dd>{detail.outfit.store ?? "TryVerse Store"}</dd></div>
                </dl>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Link to="/try-on" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[11.5px] flex items-center justify-center" onClick={() => setDetail(null)}>Try Again</Link>
                  <Link to="/stylo" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[11.5px] flex items-center justify-center" onClick={() => setDetail(null)}>Ask Stylo</Link>
                  <Link to="/store" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[11.5px] flex items-center justify-center" onClick={() => setDetail(null)}>Shop Similar</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {pendingDelete && (
          <div className="tv-modal" role="dialog" aria-modal="true" onClick={() => setPendingDelete(null)}>
            <div className="tv-confirm" onClick={(e) => e.stopPropagation()}>
              <div className="tv-heading text-white text-[18px]">Delete this saved look?</div>
              <div className="tv-body text-[12px] text-white/60 mt-2">
                “{pendingDelete.outfit.name}” will be removed from your saved looks.
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button type="button" className="tv-cta-secondary tv-body h-11 rounded-full text-white/85 font-medium text-[12.5px]" onClick={() => setPendingDelete(null)}>Cancel</button>
                <button type="button" className="tv-body h-11 rounded-full text-white font-medium text-[12.5px] tv-btn-danger" onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="tv-empty">
      <div className="tv-empty-icon" aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/></svg>
      </div>
      <div className="tv-heading text-white text-[18px] mt-3">No saved looks yet</div>
      <div className="tv-body text-[12px] text-white/60 mt-1.5 text-center max-w-[240px]">
        Try on your first outfit and save the result here.
      </div>
      <Link to="/try-on" className="tv-cta tv-body mt-5 h-11 rounded-full text-white font-medium text-[13px] px-6 flex items-center justify-center">
        Start Try-On
      </Link>
    </div>
  );
}