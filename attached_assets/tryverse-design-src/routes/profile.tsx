import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import { useTryVerse } from "@/lib/tryverse-store";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — TryVerse" },
      { name: "description", content: "Manage your TryVerse account, credits, measurements, and preferences." },
    ],
  }),
  component: ProfileScreen,
});

type SheetKey =
  | null
  | "edit"
  | "history"
  | "measurements"
  | "sizes"
  | "styles"
  | "colors"
  | "manage-data"
  | "help"
  | "support"
  | "legal";

const sizeOptions = ["XS", "S", "M", "L", "XL"] as const;
const styleOptions = ["Casual", "Formal", "Streetwear", "Minimal", "Modest", "Luxury"] as const;
const colorOptions = [
  { name: "Lavender", hex: "#c8b6ff" },
  { name: "Cream", hex: "#f2e8cf" },
  { name: "Black", hex: "#141018" },
  { name: "Olive", hex: "#7a8450" },
  { name: "Navy", hex: "#1e2a4a" },
  { name: "Beige", hex: "#d9c4a3" },
];

function ProfileScreen() {
  const { saved } = useTryVerse();
  const [sheet, setSheet] = useState<SheetKey>(null);
  const [name, setName] = useState("Hussnain");
  const [email, setEmail] = useState("hussnain@tryverse.app");
  const [sizes, setSizes] = useState({ tops: "M", bottoms: "M", dresses: "S" });
  const [styles, setStyles] = useState<string[]>(["Minimal", "Casual"]);
  const [colors, setColors] = useState<string[]>(["Lavender", "Black"]);

  const toggleFromList = (list: string[], v: string, set: (l: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const close = () => setSheet(null);
  const savedCount = saved.length || 12;

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between tv-enter-1">
          <div className="tv-header-left">
            <BackButton fallback="/home" />
            <Link to="/home" aria-label="TryVerse home">
            <TryVerseLogo height={26} />
          </Link>
          </div>
          <h1 className="tv-heading text-white text-[15px]">Profile</h1>
          <Link to="/settings" aria-label="Settings" className="tv-icon-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
          </Link>
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full pb-24">
          {/* Hero card */}
          <section className="px-5 mt-5 tv-enter-2">
            <div className="tv-stylo-hero">
              <div className="flex items-center gap-3">
                <div className="tv-stylo-avatar text-[16px] font-semibold">HK</div>
                <div className="min-w-0 flex-1">
                  <div className="tv-heading text-white text-[18px] leading-tight truncate">{name}</div>
                  <div className="tv-body text-[11.5px] text-white/60 truncate">{email}</div>
                  <div className="flex gap-1.5 mt-1.5">
                    <span className="tv-credit-pill" style={{ minHeight: 22, fontSize: 10, padding: "3px 8px" }}>Pro</span>
                    <span className="tv-credit-pill" style={{ minHeight: 22, fontSize: 10, padding: "3px 8px" }}>
                      <span className="tv-credit-dot" />182 credits
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setSheet("edit")} className="tv-saved-btn" style={{ minHeight: 40 }}>
                  Edit Profile
                </button>
                <Link to="/credits" className="tv-saved-btn" style={{ minHeight: 40, background: "linear-gradient(135deg, #7a3bff, #c93bff)", color: "#fff", borderColor: "transparent" }}>
                  Credits
                </Link>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="px-5 mt-4 tv-enter-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Saved Looks", value: savedCount },
                { label: "Try-Ons", value: 38 },
                { label: "Stylo Chats", value: 9 },
              ].map((s, i) => (
                <div key={s.label} className="tv-privacy-card" style={{ flexDirection: "column", alignItems: "flex-start", padding: 12, animationDelay: `${i * 60}ms` }}>
                  <div className="tv-heading text-white text-[20px] leading-none">{s.value}</div>
                  <div className="tv-body text-[10.5px] text-white/55 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          <Section title="My Activity">
            <Row as={Link} to="/saved" label="Saved Looks" hint={`${savedCount} items`} />
            <Row onClick={() => setSheet("history")} label="Try-On History" hint="Recent" />
            <Row as={Link} to="/stylo" label="Stylo Conversations" hint="9 chats" />
            <Row as={Link} to="/video-studio" label="Generated Videos" hint="View" />
          </Section>

          <Section title="Preferences">
            <Row onClick={() => setSheet("measurements")} label="Body Measurements" hint="Add" />
            <Row onClick={() => setSheet("sizes")} label="Preferred Sizes" hint={`${sizes.tops} · ${sizes.bottoms}`} />
            <Row onClick={() => setSheet("styles")} label="Style Preferences" hint={styles.length ? `${styles.length} picked` : "Add"} />
            <Row onClick={() => setSheet("colors")} label="Color Palette" hint={colors.length ? `${colors.length} picked` : "Add"} />
          </Section>

          <Section title="Privacy & Security">
            <Row as={Link} to="/settings" label="Privacy Settings" hint="Manage" />
            <Row label="Auto-delete uploads" hint="On" />
            <Row onClick={() => setSheet("manage-data")} label="Manage Data" hint="Export" />
          </Section>

          <Section title="Support">
            <Row onClick={() => setSheet("help")} label="Help Center" hint="FAQs" />
            <Row onClick={() => setSheet("support")} label="Contact Support" hint="Email" />
            <Row onClick={() => setSheet("legal")} label="Terms & Privacy" hint="Read" />
          </Section>

          <section className="px-5 mt-5">
            <Link to="/login" className="tv-saved-btn tv-saved-btn-danger w-full" style={{ minHeight: 48, fontSize: 13 }}>
              Log Out
            </Link>
            <div className="tv-body text-center text-[10.5px] text-white/40 mt-3">TryVerse v1.0 · Made with love</div>
          </section>
        </div>

        <BottomNav />

        {/* Bottom sheets */}
        {sheet && (
          <div className="tv-sheet-scrim" onClick={close}>
            <div className="tv-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="tv-sheet-handle" />
              <div className="px-5 pt-2 pb-6">
                {sheet === "edit" && (
                  <SheetForm
                    title="Edit Profile"
                    onSave={() => { close(); toast.success("Profile updated"); }}
                  >
                    <Field label="Full name" value={name} onChange={setName} />
                    <Field label="Email" value={email} onChange={setEmail} />
                  </SheetForm>
                )}
                {sheet === "measurements" && (
                  <SheetForm title="Body Measurements" onSave={() => { close(); toast.success("Measurements saved"); }}>
                    <Field label="Height (cm)" defaultValue="176" />
                    <Field label="Chest (cm)" defaultValue="98" />
                    <Field label="Waist (cm)" defaultValue="82" />
                    <Field label="Shoulder (cm)" defaultValue="46" />
                  </SheetForm>
                )}
                {sheet === "sizes" && (
                  <div>
                    <SheetHead title="Preferred Sizes" onClose={close} />
                    {(["tops", "bottoms", "dresses"] as const).map((k) => (
                      <div key={k} className="mt-3">
                        <div className="tv-body text-[11.5px] text-white/70 capitalize mb-1.5">{k}</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {sizeOptions.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSizes({ ...sizes, [k]: s })}
                              className="tv-chip"
                              style={sizes[k] === s ? { background: "linear-gradient(135deg,#7a3bff,#c93bff)", borderColor: "transparent" } : undefined}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => { close(); toast.success("Sizes saved"); }} className="tv-cta mt-5 h-11 rounded-full text-white font-medium text-[13px] flex items-center justify-center w-full">Save</button>
                  </div>
                )}
                {sheet === "styles" && (
                  <ChipPicker
                    title="Style Preferences"
                    options={[...styleOptions]}
                    selected={styles}
                    onToggle={(v) => toggleFromList(styles, v, setStyles)}
                    onClose={close}
                    onSave={() => { close(); toast.success("Style preferences saved"); }}
                  />
                )}
                {sheet === "colors" && (
                  <div>
                    <SheetHead title="Color Palette" onClose={close} />
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {colorOptions.map((c) => {
                        const active = colors.includes(c.name);
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => toggleFromList(colors, c.name, setColors)}
                            className="tv-privacy-card"
                            style={{ flexDirection: "column", alignItems: "flex-start", padding: 10, borderColor: active ? "#c93bff" : undefined }}
                          >
                            <span style={{ width: 24, height: 24, borderRadius: 999, background: c.hex, border: "1px solid rgba(255,255,255,0.15)" }} />
                            <span className="tv-body text-[11px] text-white/85 mt-1.5">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    <button type="button" onClick={() => { close(); toast.success("Palette saved"); }} className="tv-cta mt-5 h-11 rounded-full text-white font-medium text-[13px] flex items-center justify-center w-full">Save</button>
                  </div>
                )}
                {sheet === "history" && (
                  <div>
                    <SheetHead title="Try-On History" onClose={close} />
                    <div className="mt-2 flex flex-col gap-2">
                      {["Lavender Blazer · Today", "Cream Knit Set · Yesterday", "Olive Trench · 3d ago", "Pink Slip Dress · 5d ago"].map((h) => (
                        <div key={h} className="tv-privacy-card">
                          <div className="tv-privacy-icon" aria-hidden><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/></svg></div>
                          <div className="tv-body text-[12px] text-white/85">{h}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {sheet === "manage-data" && (
                  <div>
                    <SheetHead title="Manage Data" onClose={close} />
                    <div className="mt-2 flex flex-col gap-2">
                      <button className="tv-sheet-opt" onClick={() => { close(); toast("Export requested"); }}>
                        <div className="tv-sheet-opt-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg></div>
                        <div><div className="tv-sheet-opt-label">Export my data</div><div className="tv-sheet-opt-desc">Receive a copy by email</div></div>
                      </button>
                      <button className="tv-sheet-opt" onClick={() => { close(); toast("Cleared uploads"); }}>
                        <div className="tv-sheet-opt-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m1 0v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7"/></svg></div>
                        <div><div className="tv-sheet-opt-label">Clear uploads</div><div className="tv-sheet-opt-desc">Remove all session photos</div></div>
                      </button>
                    </div>
                  </div>
                )}
                {sheet === "help" && (
                  <div>
                    <SheetHead title="Help Center" onClose={close} />
                    <div className="mt-2 flex flex-col gap-2">
                      {[
                        ["How does Virtual Try-On work?", "Upload a photo, pick an outfit, tap Generate."],
                        ["Are my photos private?", "Yes — uploads are auto-deleted after your session."],
                        ["Can I cancel Pro anytime?", "Yes, from Settings › Account."],
                        ["What are credits?", "Credits power generations across the app."],
                      ].map(([q, a]) => (
                        <div key={q} className="tv-privacy-card" style={{ alignItems: "flex-start" }}>
                          <div>
                            <div className="tv-body text-[12px] text-white font-medium">{q}</div>
                            <div className="tv-body text-[11px] text-white/55 mt-0.5">{a}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {sheet === "support" && (
                  <div>
                    <SheetHead title="Contact Support" onClose={close} />
                    <div className="tv-privacy-card mt-3">
                      <div className="tv-privacy-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16v12H4z"/><path d="M4 6l8 7 8-7"/></svg></div>
                      <div className="min-w-0">
                        <div className="tv-body text-[11.5px] text-white font-medium">info@tryverse.app</div>
                        <div className="tv-body text-[10.5px] text-white/55">We reply within 24 hours.</div>
                      </div>
                    </div>
                    <button type="button" onClick={() => { close(); toast.success("Opening email…"); }} className="tv-cta mt-4 h-11 rounded-full text-white font-medium text-[13px] flex items-center justify-center w-full">Email us</button>
                  </div>
                )}
                {sheet === "legal" && (
                  <div>
                    <SheetHead title="Terms & Privacy" onClose={close} />
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="tv-privacy-card"><div className="tv-body text-[12px] text-white/85">Terms of Service</div></div>
                      <div className="tv-privacy-card"><div className="tv-body text-[12px] text-white/85">Privacy Policy</div></div>
                      <div className="tv-privacy-card"><div className="tv-body text-[12px] text-white/85">Cookie Policy</div></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-5 mt-5 tv-enter-3">
      <h2 className="tv-section-title">{title}</h2>
      <div className="mt-2 flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

type RowProps = {
  label: string;
  hint?: string;
  onClick?: () => void;
  as?: typeof Link;
  to?: string;
};
function Row({ label, hint, onClick, as: As, to }: RowProps) {
  const inner = (
    <>
      <div className="tv-body text-[12.5px] text-white/90 font-medium">{label}</div>
      <div className="flex items-center gap-1.5">
        {hint && <span className="tv-body text-[11px] text-white/50">{hint}</span>}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white/40"><path d="M9 6l6 6-6 6"/></svg>
      </div>
    </>
  );
  const cls = "flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 min-h-[48px] active:scale-[0.99] transition";
  if (As && to) return <As to={to as any} className={cls}>{inner}</As>;
  return <button type="button" onClick={onClick} className={cls + " text-left w-full"}>{inner}</button>;
}

function SheetHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mt-1">
      <h3 className="tv-heading text-white text-[16px]">{title}</h3>
      <button type="button" onClick={onClose} className="tv-icon-btn" aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </div>
  );
}

function Field({ label, value, defaultValue, onChange }: { label: string; value?: string; defaultValue?: string; onChange?: (v: string) => void }) {
  return (
    <label className="block mt-3">
      <span className="tv-body text-[11px] text-white/60">{label}</span>
      <input
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        className="tv-chat-input mt-1 w-full"
      />
    </label>
  );
}

function SheetForm({ title, onSave, children }: { title: string; onSave: () => void; children: React.ReactNode }) {
  return (
    <div>
      <SheetHead title={title} onClose={onSave} />
      {children}
      <button type="button" onClick={onSave} className="tv-cta mt-5 h-11 rounded-full text-white font-medium text-[13px] flex items-center justify-center w-full">Save</button>
    </div>
  );
}

function ChipPicker({ title, options, selected, onToggle, onClose, onSave }: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void; onClose: () => void; onSave: () => void }) {
  return (
    <div>
      <SheetHead title={title} onClose={onClose} />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <button key={o} type="button" onClick={() => onToggle(o)} className="tv-chip" style={active ? { background: "linear-gradient(135deg,#7a3bff,#c93bff)", borderColor: "transparent" } : undefined}>
              {o}
            </button>
          );
        })}
      </div>
      <button type="button" onClick={onSave} className="tv-cta mt-5 h-11 rounded-full text-white font-medium text-[13px] flex items-center justify-center w-full">Save</button>
    </div>
  );
}