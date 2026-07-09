import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import userImg from "@/assets/tv-user.jpg";
import blazerImg from "@/assets/tv-blazer-lavender.jpg";
import topImg from "@/assets/tv-top.jpg";
import pinkDressImg from "@/assets/tv-pink-dress.jpg";
import whiteShirtImg from "@/assets/tv-white-shirt.jpg";
import { tvActions, useTryVerse, type Outfit } from "@/lib/tryverse-store";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/try-on/")({
  head: () => ({
    meta: [
      { title: "Virtual Try-On — TryVerse" },
      { name: "description", content: "Upload your photo and see how any outfit looks on you before checkout." },
      { property: "og:title", content: "Virtual Try-On — TryVerse" },
      { property: "og:description", content: "See how clothes look on you before you buy." },
    ],
  }),
  component: TryOnScreen,
});

const OUTFITS: Outfit[] = [
  { slug: "lavender-blazer", name: "Lavender Oversized Blazer", image: blazerImg, tint: "linear-gradient(160deg,#b48cff,#6d3bff)", price: "$88", store: "TryVerse Store", color: "Lavender" },
  { slug: "cream-sweater", name: "Cream Sweater", image: topImg, tint: "linear-gradient(160deg,#e9d9c4,#b39a7a)", price: "$62", store: "TryVerse Store", color: "Cream" },
  { slug: "pink-dress", name: "Pink Midi Dress", image: pinkDressImg, tint: "linear-gradient(160deg,#f7c6d3,#c86a92)", price: "$74", store: "TryVerse Store", color: "Pink" },
  { slug: "white-shirt", name: "White Shirt", image: whiteShirtImg, tint: "linear-gradient(160deg,#e8ecf3,#a6b0c2)", price: "$54", store: "TryVerse Store", color: "White" },
];

type Tab = "link" | "browse";

function TryOnScreen() {
  const navigate = useNavigate();
  const { selection } = useTryVerse();
  const photo = selection.photo;
  const outfit = selection.outfit;
  const [tab, setTab] = useState<Tab>("browse");
  const [linkUrl, setLinkUrl] = useState("");
  const [fetched, setFetched] = useState<Outfit | null>(null);
  const [fetching, setFetching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // reset generating state if user navigates back mid-flow
    setGenerating(false);
  }, []);

  const step = !photo ? 1 : !outfit ? 2 : 3;
  const canGenerate = !!photo && !!outfit && !generating;

  function handlePickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      tvActions.setPhoto(userImg);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => tvActions.setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  function handleFetchLink() {
    if (!linkUrl) return;
    setFetching(true);
    setTimeout(() => {
      setFetched(OUTFITS[0]);
      setFetching(false);
    }, 700);
  }

  function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    setTimeout(() => {
      navigate({ to: "/try-on/result" });
    }, 1600);
  }

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <div className="tv-home-scroll relative z-10 flex-1 w-full">
          {/* Header */}
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

          {/* Heading */}
          <section className="px-5 mt-5 tv-enter-2">
            <h1 className="tv-heading text-white text-[24px] leading-tight">
              <span className="tv-grad">Virtual Try-On</span>
            </h1>
            <p className="tv-body mt-2 text-[12.5px] text-white/60">
              Upload your photo and see how clothes look on you before checkout.
            </p>
          </section>

          {/* Step indicator */}
          <section className="px-5 mt-4 tv-enter-3">
            <div className="tv-step-row">
              {[
                { n: 1, label: "Photo" },
                { n: 2, label: "Outfit" },
                { n: 3, label: "Result" },
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

          {/* Photo */}
          <section className="px-5 mt-5">
            <div className="tv-to-card">
              <div className="tv-to-card-title">Your Photo</div>
              {!photo ? (
                <div className="tv-upload">
                  <div className="tv-upload-icon" aria-hidden>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M8 8l4-4 4 4"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
                  </div>
                  <div className="tv-upload-title">Upload your photo</div>
                  <div className="tv-upload-help">Full-body photo works best</div>
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
                    onClick={() => tvActions.setPhoto(userImg)}
                  >
                    Use demo photo
                  </button>
                </div>
              ) : (
                <div className="tv-photo-preview">
                  <img src={photo} alt="Your uploaded photo" />
                  <div className="tv-photo-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    Photo uploaded
                  </div>
                  <button type="button" className="tv-photo-change" onClick={() => tvActions.setPhoto(null)}>Change</button>
                </div>
              )}
            </div>
          </section>

          {/* Outfit */}
          <section className={`px-5 mt-4 tv-outfit-section ${!photo ? "tv-disabled" : ""}`}>
            <div className="tv-to-card">
              <div className="tv-to-card-title">Choose Outfit</div>

              <div className="tv-tabs mt-3">
                <button type="button" className={`tv-tab ${tab === "link" ? "tv-tab-active" : ""}`} onClick={() => setTab("link")}>Paste Link</button>
                <button type="button" className={`tv-tab ${tab === "browse" ? "tv-tab-active" : ""}`} onClick={() => setTab("browse")}>Browse Store</button>
              </div>

              {tab === "link" ? (
                <div className="mt-3 flex flex-col gap-2">
                  <label className="tv-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="Paste clothing product URL"
                      className="tv-search-input"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={!linkUrl || fetching}
                    className="tv-cta-secondary tv-body h-11 rounded-full text-white/90 font-medium text-[12.5px] disabled:opacity-50"
                    onClick={handleFetchLink}
                  >
                    {fetching ? "Fetching…" : "Fetch Outfit"}
                  </button>
                  {fetched && (
                    <div className="tv-fetched">
                      <div className="tv-fetched-thumb" style={{ background: fetched.tint }}>
                        <img src={fetched.image} alt="" loading="lazy" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="tv-fetched-name truncate">{fetched.name}</div>
                        <div className="tv-fetched-meta">{fetched.price} · {fetched.store}</div>
                      </div>
                      <button
                        type="button"
                        className={`tv-to-outfit-btn ${outfit?.slug === fetched.slug ? "tv-to-outfit-btn-on" : ""}`}
                        onClick={() => tvActions.setOutfit(fetched)}
                      >
                        {outfit?.slug === fetched.slug ? "Selected" : "Select"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="tv-to-outfit-row mt-3">
                  {OUTFITS.map((o) => {
                    const selected = outfit?.slug === o.slug;
                    return (
                      <button
                        type="button"
                        key={o.slug}
                        className={`tv-to-outfit ${selected ? "tv-to-outfit-active" : ""}`}
                        onClick={() => tvActions.setOutfit(o)}
                      >
                        <div className="tv-to-outfit-media" style={{ background: o.tint }}>
                          <img src={o.image} alt={o.name} loading="lazy" />
                        </div>
                        <div className="tv-to-outfit-name">{o.name}</div>
                        <div className={`tv-to-outfit-btn ${selected ? "tv-to-outfit-btn-on" : ""}`}>
                          {selected ? "Selected" : "Select"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {outfit && (
                <div className="tv-selected mt-3">
                  <div className="tv-selected-thumb" style={{ background: outfit.tint }}>
                    <img src={outfit.image} alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="tv-selected-label">Selected Outfit</div>
                    <div className="tv-selected-name truncate">{outfit.name}</div>
                  </div>
                  <button type="button" className="tv-selected-change" onClick={() => tvActions.setOutfit(null)}>Change</button>
                </div>
              )}
            </div>
          </section>

          {/* Generate */}
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
                  Generating your look...
                </>
              ) : (
                <>Generate Try-On</>
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