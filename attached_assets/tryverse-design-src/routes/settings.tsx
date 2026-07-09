import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TryVerse" },
      { name: "description", content: "Manage account, notifications, privacy, and appearance for TryVerse." },
    ],
  }),
  component: SettingsScreen,
});

function SettingsScreen() {
  const [notif, setNotif] = useState({ updates: true, credits: true, tips: true, stores: false, reminders: true });
  const [privacy, setPrivacy] = useState({ uploads: true, results: true, improve: true, hide: false });
  const [appearance, setAppearance] = useState({ dark: true, motion: false, compact: false });
  const [confirm, setConfirm] = useState(false);
  const [pwSheet, setPwSheet] = useState(false);

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between tv-enter-1">
          <BackButton fallback="/profile" />
          <h1 className="tv-heading text-white text-[16px]">Settings</h1>
          <span className="h-9 w-9" aria-hidden />
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full pb-24">
          <Group title="Account">
            <StaticRow label="Name" hint="Hussnain" />
            <StaticRow label="Email" hint="hussnain@tryverse.app" />
            <StaticRow label="Change Password" onClick={() => setPwSheet(true)} />
          </Group>

          <Group title="Notifications">
            <Toggle label="Product updates" value={notif.updates} onChange={(v) => setNotif({ ...notif, updates: v })} />
            <Toggle label="Credit alerts" value={notif.credits} onChange={(v) => setNotif({ ...notif, credits: v })} />
            <Toggle label="Stylo tips" value={notif.tips} onChange={(v) => setNotif({ ...notif, tips: v })} />
            <Toggle label="New store alerts" value={notif.stores} onChange={(v) => setNotif({ ...notif, stores: v })} />
            <Toggle label="Saved look reminders" value={notif.reminders} onChange={(v) => setNotif({ ...notif, reminders: v })} />
          </Group>

          <Group title="Privacy">
            <Toggle label="Auto-delete uploaded photos after session" value={privacy.uploads} onChange={(v) => setPrivacy({ ...privacy, uploads: v })} />
            <Toggle label="Auto-delete generated results after session" value={privacy.results} onChange={(v) => setPrivacy({ ...privacy, results: v })} />
            <Toggle label="Do not use uploads for product improvement" value={privacy.improve} onChange={(v) => setPrivacy({ ...privacy, improve: v })} />
            <Toggle label="Hide profile from public showcase" value={privacy.hide} onChange={(v) => setPrivacy({ ...privacy, hide: v })} />
          </Group>

          <Group title="Appearance">
            <Toggle label="Dark mode" value={appearance.dark} onChange={(v) => setAppearance({ ...appearance, dark: v })} />
            <Toggle label="Reduced motion" value={appearance.motion} onChange={(v) => setAppearance({ ...appearance, motion: v })} />
            <Toggle label="Compact cards" value={appearance.compact} onChange={(v) => setAppearance({ ...appearance, compact: v })} />
          </Group>

          <Group title="Danger Zone">
            <button type="button" onClick={() => setConfirm(true)} className="tv-saved-btn tv-saved-btn-danger w-full" style={{ minHeight: 48, fontSize: 13 }}>
              Delete Account
            </button>
          </Group>

          <div className="h-6" />
        </div>

        <BottomNav />

        {confirm && (
          <div className="tv-modal" onClick={() => setConfirm(false)}>
            <div className="tv-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="p-5">
                <h3 className="tv-heading text-white text-[18px]">Delete your account?</h3>
                <p className="tv-body text-[12px] text-white/60 mt-2">This action can't be undone. All your saved looks will be removed.</p>
                <div className="grid grid-cols-2 gap-2 mt-5">
                  <button onClick={() => setConfirm(false)} className="tv-saved-btn" style={{ minHeight: 44 }}>Cancel</button>
                  <button onClick={() => { setConfirm(false); toast("Demo only"); }} className="tv-saved-btn tv-saved-btn-danger" style={{ minHeight: 44 }}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {pwSheet && (
          <div className="tv-sheet-scrim" onClick={() => setPwSheet(false)}>
            <div className="tv-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="tv-sheet-handle" />
              <div className="px-5 pt-2 pb-6">
                <div className="flex items-center justify-between mt-1">
                  <h3 className="tv-heading text-white text-[16px]">Change Password</h3>
                  <button type="button" onClick={() => setPwSheet(false)} className="tv-icon-btn" aria-label="Close">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                  </button>
                </div>
                <label className="block mt-3"><span className="tv-body text-[11px] text-white/60">Current password</span><input type="password" className="tv-chat-input mt-1 w-full" placeholder="••••••••" /></label>
                <label className="block mt-3"><span className="tv-body text-[11px] text-white/60">New password</span><input type="password" className="tv-chat-input mt-1 w-full" placeholder="At least 8 characters" /></label>
                <button onClick={() => { setPwSheet(false); toast.success("Password updated"); }} className="tv-cta mt-5 h-11 rounded-full text-white font-medium text-[13px] flex items-center justify-center w-full">Update</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-5 mt-5 tv-enter-2">
      <h2 className="tv-section-title">{title}</h2>
      <div className="mt-2 flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

function StaticRow({ label, hint, onClick }: { label: string; hint?: string; onClick?: () => void }) {
  const cls = "flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 min-h-[48px] w-full text-left active:scale-[0.99] transition";
  const inner = (
    <>
      <span className="tv-body text-[12.5px] text-white/90 font-medium">{label}</span>
      {hint ? <span className="tv-body text-[11px] text-white/55">{hint}</span> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-white/40"><path d="M9 6l6 6-6 6"/></svg>}
    </>
  );
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 min-h-[48px] w-full text-left active:scale-[0.99] transition">
      <span className="tv-body text-[12.5px] text-white/90 font-medium pr-3">{label}</span>
      <span
        aria-hidden
        style={{
          width: 40, height: 22, borderRadius: 999,
          background: value ? "linear-gradient(135deg,#7a3bff,#c93bff)" : "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.14)",
          position: "relative",
          transition: "background 200ms ease",
          flex: "none",
        }}
      >
        <span
          style={{
            position: "absolute", top: 2, left: value ? 20 : 2,
            width: 16, height: 16, borderRadius: 999, background: "#fff",
            transition: "left 200ms cubic-bezier(0.22, 1, 0.36, 1)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
          }}
        />
      </span>
    </button>
  );
}