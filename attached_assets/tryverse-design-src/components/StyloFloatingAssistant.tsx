import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function StyloFloatingAssistant() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="tv-stylo-fab-wrap">
      {open && (
        <div className="tv-stylo-pop" role="dialog" aria-label="Stylo assistant">
          <button
            type="button"
            aria-label="Close"
            className="tv-stylo-close"
            onClick={() => setOpen(false)}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          <div className="tv-stylo-pop-head">
            <div className="tv-stylo-avatar" aria-hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/></svg>
            </div>
            <div className="tv-stylo-name">Hi, I'm Stylo 👋</div>
          </div>
          <div className="tv-stylo-msg">Need help choosing an outfit?</div>
          <Link to="/stylo" className="tv-stylo-cta">Ask Stylo</Link>
        </div>
      )}
      <button
        type="button"
        aria-label={open ? "Close Stylo" : "Open Stylo"}
        className="tv-stylo-fab"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.3A8 8 0 1 1 21 12z"/><path d="M9 11h.01M12 11h.01M15 11h.01"/></svg>
        )}
      </button>
    </div>
  );
}

export default StyloFloatingAssistant;