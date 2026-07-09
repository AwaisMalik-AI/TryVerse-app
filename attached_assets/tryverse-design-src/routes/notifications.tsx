import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import featPose from "@/assets/tv-feat-pose.jpg";
import featStylist from "@/assets/tv-feat-stylist.jpg";
import featStore from "@/assets/tv-feat-store.jpg";
import featSaved from "@/assets/tv-feat-saved.jpg";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — TryVerse" },
      { name: "description", content: "Updates about your outfits, credits, and generated results." },
    ],
  }),
  component: NotificationsScreen,
});

type Notif = {
  id: string;
  title: string;
  text: string;
  time: string;
  image: string;
  to: "/pose-studio/result" | "/stylo" | "/credits" | "/store" | "/saved";
  cta: string;
  group: "Today" | "Earlier";
};

const INITIAL: Notif[] = [
  { id: "n1", group: "Today", title: "Your Pose Studio result is ready", text: "Tap to view your generated pose variations.", time: "2m", image: featPose, to: "/pose-studio/result", cta: "View Result" },
  { id: "n2", group: "Today", title: "New AI Stylist tip from Stylo", text: "Lavender and cream tones are trending for your saved looks.", time: "1h", image: featStylist, to: "/stylo", cta: "Ask Stylo" },
  { id: "n3", group: "Today", title: "Credits updated", text: "You have 182 credits remaining.", time: "3h", image: featSaved, to: "/credits", cta: "View Credits" },
  { id: "n4", group: "Earlier", title: "New store added", text: "Browse new outfits available for virtual try-on.", time: "Yesterday", image: featStore, to: "/store", cta: "Open Store" },
  { id: "n5", group: "Earlier", title: "Saved look reminder", text: "Compare your saved looks before checkout.", time: "2d", image: featSaved, to: "/saved", cta: "Saved Looks" },
];

function NotificationsScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Notif[]>(INITIAL);
  const [unread, setUnread] = useState<Set<string>>(new Set(INITIAL.map((i) => i.id)));
  const [confirmClear, setConfirmClear] = useState(false);

  const groups: Array<"Today" | "Earlier"> = ["Today", "Earlier"];

  function open(n: Notif) {
    setUnread((u) => { const c = new Set(u); c.delete(n.id); return c; });
    navigate({ to: n.to });
  }
  function del(id: string) {
    setItems((it) => it.filter((n) => n.id !== id));
  }

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between tv-enter-1">
          <BackButton fallback="/home" />
          <TryVerseLogo height={26} />
          <Link to="/profile" aria-label="Profile" className="tv-avatar">HK</Link>
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full pb-24">
          <section className="px-5 mt-4 tv-enter-2">
            <h1 className="tv-heading text-white text-[22px]">Notifications</h1>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="tv-saved-btn"
                style={{ minHeight: 34, padding: "6px 12px", fontSize: 11.5 }}
                onClick={() => setUnread(new Set())}
              >
                Mark all as read
              </button>
              <button
                type="button"
                className="tv-saved-btn"
                style={{ minHeight: 34, padding: "6px 12px", fontSize: 11.5 }}
                onClick={() => setConfirmClear(true)}
              >
                Clear all
              </button>
            </div>
          </section>

          {items.length === 0 ? (
            <section className="px-5 mt-8 text-center tv-enter-3">
              <div className="tv-heading text-white text-[16px]">No notifications yet</div>
              <p className="tv-body text-[12px] text-white/55 mt-2">Updates about your outfits, credits, and results will appear here.</p>
            </section>
          ) : (
            groups.map((g) => {
              const list = items.filter((i) => i.group === g);
              if (!list.length) return null;
              return (
                <section key={g} className="px-5 mt-5 tv-enter-3">
                  <h2 className="tv-section-title">{g}</h2>
                  <div className="mt-2 flex flex-col gap-2">
                    {list.map((n) => (
                      <div key={n.id} className="tv-privacy-card" style={{ alignItems: "flex-start", gap: 12 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "rgba(255,255,255,0.05)" }}>
                          <img src={n.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                        </div>
                        <button type="button" onClick={() => open(n)} className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-1.5">
                            <div className="tv-body text-[12.5px] text-white font-semibold leading-tight truncate">{n.title}</div>
                            {unread.has(n.id) && <span style={{ width: 7, height: 7, borderRadius: 999, background: "linear-gradient(135deg,#7a3bff,#c93bff)", flexShrink: 0 }} />}
                          </div>
                          <div className="tv-body text-[11px] text-white/60 leading-snug mt-0.5">{n.text}</div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="tv-body text-[10.5px] text-violet-300/90 font-medium">{n.cta} →</span>
                            <span className="tv-body text-[10.5px] text-white/40">· {n.time}</span>
                          </div>
                        </button>
                        <button type="button" onClick={() => del(n.id)} aria-label="Delete" className="tv-icon-btn" style={{ width: 32, height: 32 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>

        {confirmClear && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6" onClick={() => setConfirmClear(false)}>
            <div className="tv-privacy-card max-w-[320px] w-full flex-col text-center" style={{ display: "flex", padding: 20 }} onClick={(e) => e.stopPropagation()}>
              <div className="tv-heading text-white text-[15px]">Clear all notifications?</div>
              <p className="tv-body text-[11.5px] text-white/60 mt-1.5">This cannot be undone.</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setConfirmClear(false)} className="tv-cta-secondary tv-body h-10 rounded-full flex-1 text-white/80 text-[12px]">Cancel</button>
                <button type="button" onClick={() => { setItems([]); setUnread(new Set()); setConfirmClear(false); }} className="tv-cta tv-body h-10 rounded-full flex-1 text-white font-medium text-[12px]">Clear all</button>
              </div>
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </div>
  );
}