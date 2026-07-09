import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";
import blazerImg from "@/assets/tv-blazer-lavender.jpg";
import topImg from "@/assets/tv-top.jpg";
import trousersImg from "@/assets/tv-trousers.jpg";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/stylo")({
  head: () => ({
    meta: [
      { title: "AI Stylist — TryVerse" },
      { name: "description", content: "Get outfit advice and color suggestions from Stylo." },
      { property: "og:title", content: "AI Stylist — TryVerse" },
      { property: "og:description", content: "Ask Stylo for outfit advice, color matching, and product ideas." },
    ],
  }),
  component: StyloScreen,
});

type Recommendation = { slug: string; name: string; reason: string; image: string; tint: string };

type Message = {
  id: string;
  role: "stylo" | "user";
  text: string;
  recs?: Recommendation[];
};

const CHIPS = [
  "Rate my outfit",
  "What colors suit me?",
  "Style this item",
  "Find similar products",
] as const;

const SUGGESTIONS = [
  "What should I wear with a lavender blazer?",
  "Help me find a summer look",
  "Which color suits me best?",
  "Style me for work",
];

const LAVENDER_RECS: Recommendation[] = [
  { slug: "cream-trousers", name: "Cream Trousers", reason: "Balances the lavender blazer.", image: trousersImg, tint: "linear-gradient(160deg,#e9d9c4,#8a7455)" },
  { slug: "white-top", name: "White Fitted Top", reason: "Keeps the look clean.", image: topImg, tint: "linear-gradient(160deg,#f2f4f8,#b8c0cc)" },
  { slug: "lavender-blazer", name: "Lavender Blazer", reason: "Your statement piece.", image: blazerImg, tint: "linear-gradient(160deg,#b48cff,#6d3bff)" },
];

function stylo(text: string, recs?: Recommendation[]): Message {
  return { id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, role: "stylo", text, recs };
}
function user(text: string): Message {
  return { id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, role: "user", text };
}

function replyFor(input: string): Message {
  const t = input.toLowerCase();
  if (t.includes("rate my outfit"))
    return stylo("Upload your outfit photo and I'll rate the color balance, fit, occasion match, and styling strength.");
  if (t.includes("colors suit") || t.includes("color suits"))
    return stylo("Based on your saved looks, soft lavender, cream, charcoal, and muted green would work well for you.");
  if (t.includes("style this item"))
    return stylo("Paste a product link or choose a saved item, and I'll build a complete outfit around it.");
  if (t.includes("similar products") || t.includes("find similar"))
    return stylo("I can help you discover similar clothing from the AI Fashion Store.");
  if (t.includes("lavender blazer"))
    return stylo(
      "Pair it with cream trousers, a white fitted top, and clean minimal layers. Want to try this look on?",
      LAVENDER_RECS,
    );
  if (t.includes("summer"))
    return stylo("Go for lightweight cream tones, soft pastels, and breathable silhouettes. I can put a summer look together for you.");
  if (t.includes("work"))
    return stylo("A tailored blazer, a clean fitted top, and neutral trousers keep your work looks polished but modern.");
  return stylo(
    "That's a great style question. I'd recommend starting with a clean base, one statement piece, and colors that complement your skin tone.",
  );
}

function StyloScreen() {
  const initial = useMemo<Message[]>(
    () => [stylo("Upload an outfit photo, paste a product link, or ask me anything about your style.")],
    [],
  );
  const [messages, setMessages] = useState<Message[]>(initial);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [suggestionsUsed, setSuggestionsUsed] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  function push(text: string) {
    const userMsg = user(text);
    setMessages((m) => [...m, userMsg]);
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, replyFor(text)]);
      setTyping(false);
    }, 1000);
  }

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const value = input.trim();
    if (!value || typing) return;
    setInput("");
    push(value);
    setTimeout(() => inputRef.current?.focus(), 30);
  }

  function handleSuggestion(text: string) {
    setSuggestionsUsed((s) => new Set(s).add(text));
    push(text);
  }

  function handleSheet(kind: "upload" | "saved" | "link") {
    setSheet(false);
    if (kind === "upload") {
      toast("Photo picker opened — upload your outfit");
      push("I'd like to upload an outfit photo.");
    } else if (kind === "saved") {
      toast("Opening your saved looks");
      push("Style me using one of my saved looks.");
    } else {
      toast("Paste a product URL to continue");
      push("Here's a product link I want styled.");
    }
  }

  const showSuggestions = messages.length <= 1;

  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between tv-enter-1">
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

        <div ref={scrollRef} className="tv-home-scroll relative z-10 flex-1 w-full pb-[168px]">
          <section className="px-5 mt-4 tv-enter-2">
            <h1 className="tv-heading text-white text-[24px] leading-tight">
              <span className="tv-grad">AI Stylist</span>
            </h1>
            <p className="tv-body mt-2 text-[12.5px] text-white/60">
              Ask Stylo for outfit advice, color matching, size guidance, and product ideas.
            </p>
          </section>

          <section className="px-5 mt-5 tv-enter-3">
            <div className="tv-stylo-hero">
              <div className="tv-stylo-avatar" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>
              </div>
              <div className="tv-body text-[10px] uppercase tracking-[0.22em] text-violet-300/80 mb-1">Stylo</div>
              <div className="tv-stylo-hero-title">Hi Hussnain, I'm Stylo. What are we styling today?</div>
              <div className="tv-chips">
                {CHIPS.map((chip, i) => (
                  <button
                    key={chip}
                    type="button"
                    className="tv-chip"
                    style={{ animationDelay: `${120 + i * 60}ms` }}
                    onClick={() => push(chip)}
                    disabled={typing}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 mt-4 flex flex-col gap-2.5">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {typing && <TypingBubble />}
          </section>

          {showSuggestions && (
            <section className="px-5 mt-4 tv-enter-3">
              <div className="tv-body text-[10.5px] uppercase tracking-[0.18em] text-white/45 mb-2">
                Try asking
              </div>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    className="tv-suggestion"
                    style={{ animationDelay: `${i * 60}ms` }}
                    onClick={() => handleSuggestion(s)}
                    disabled={typing || suggestionsUsed.has(s)}
                  >
                    <span>{s}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Chat input bar */}
        <form onSubmit={handleSend} className="tv-chat-bar">
          <button
            type="button"
            className="tv-chat-plus"
            aria-label="Add attachment"
            onClick={() => setSheet(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Stylo anything..."
            className="tv-chat-input"
            disabled={typing}
          />
          <button
            type="submit"
            className="tv-chat-send"
            aria-label="Send"
            disabled={!input.trim() || typing}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>
          </button>
        </form>

        <BottomNav />

        {sheet && (
          <div className="tv-sheet-scrim" onClick={() => setSheet(false)}>
            <div className="tv-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
              <div className="tv-sheet-handle" aria-hidden />
              <div className="flex items-center justify-between px-5 pt-1">
                <div className="tv-heading text-white text-[16px]">Add to chat</div>
                <button type="button" className="tv-icon-btn" aria-label="Close" onClick={() => setSheet(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </button>
              </div>
              <div className="px-4 pb-6 pt-3 flex flex-col gap-2">
                <SheetOption
                  label="Upload outfit photo"
                  desc="Snap or choose a full-body outfit"
                  onClick={() => handleSheet("upload")}
                  icon={<path d="M12 16V4M8 8l4-4 4 4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>}
                />
                <SheetOption
                  label="Choose saved look"
                  desc="Restyle one of your saved outfits"
                  onClick={() => handleSheet("saved")}
                  icon={<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>}
                />
                <SheetOption
                  label="Paste product link"
                  desc="Style around a specific clothing item"
                  onClick={() => handleSheet("link")}
                  icon={<><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></>}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="tv-msg-row tv-msg-row-user">
        <div className="tv-msg tv-msg-user">{message.text}</div>
      </div>
    );
  }
  return (
    <div className="tv-msg-row tv-msg-row-stylo">
      <div className="tv-msg-avatar" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>
      </div>
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <div className="tv-msg tv-msg-stylo">{message.text}</div>
        {message.recs && (
          <div className="tv-rec-row">
            {message.recs.map((r) => (
              <div key={r.slug} className="tv-rec-card">
                <div className="tv-rec-media" style={{ background: r.tint }}>
                  <img src={r.image} alt={r.name} loading="lazy" />
                </div>
                <div className="tv-rec-name">{r.name}</div>
                <div className="tv-rec-reason">{r.reason}</div>
                <Link to="/try-on" className="tv-rec-btn">Try On</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="tv-msg-row tv-msg-row-stylo">
      <div className="tv-msg-avatar" aria-hidden>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>
      </div>
      <div className="tv-msg tv-msg-stylo tv-typing" aria-label="Stylo is typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

function SheetOption({ label, desc, onClick, icon }: { label: string; desc: string; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="tv-sheet-opt">
      <div className="tv-sheet-opt-icon" aria-hidden>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </div>
      <div className="min-w-0 flex-1 text-left">
        <div className="tv-sheet-opt-label">{label}</div>
        <div className="tv-sheet-opt-desc">{desc}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50"><path d="M9 6l6 6-6 6"/></svg>
    </button>
  );
}