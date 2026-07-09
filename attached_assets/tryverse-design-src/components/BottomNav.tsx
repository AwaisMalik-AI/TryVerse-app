import { Link, useRouterState } from "@tanstack/react-router";

const tabs = [
  { to: "/home", label: "Home", icon: "M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z" },
  { to: "/store", label: "Store", icon: "M4 7h16l-1 12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM9 7a3 3 0 0 1 6 0" },
  { to: "/try-on", label: "Try-On", icon: "M12 3l3 4h5l-4 4 2 7-6-4-6 4 2-7-4-4h5z" },
  { to: "/stylo", label: "AI Stylist", icon: "M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" },
  { to: "/saved", label: "Saved", icon: "M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="tv-bottom-nav" aria-label="Primary">
      <div className="tv-bottom-nav-inner">
        {tabs.map((t) => {
          const active = pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`tv-nav-tab ${active ? "tv-nav-tab-active" : ""}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={t.icon} />
              </svg>
              <span className="tv-nav-label">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;