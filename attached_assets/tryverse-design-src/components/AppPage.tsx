import { Link } from "@tanstack/react-router";
import { TryVerseLogo } from "@/components/TryVerseLogo";
import { BottomNav } from "@/components/BottomNav";

type Props = {
  title: string;
  description: string;
  showBottomNav?: boolean;
  backTo?: "/home" | "/welcome";
};

export function AppPage({ title, description, showBottomNav = true, backTo = "/home" }: Props) {
  return (
    <div className="tv-root min-h-screen w-full flex items-center justify-center bg-black overflow-hidden">
      <div className="tv-frame relative flex flex-col overflow-hidden">
        <div className="tv-bg-sweep" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-a" aria-hidden />
        <div className="tv-bg-glow tv-bg-glow-b" aria-hidden />

        <header className="relative z-10 w-full px-5 pt-5 flex items-center justify-between">
          <Link
            to={backTo}
            aria-label="Back"
            className="h-9 w-9 rounded-full border border-white/10 bg-white/5 backdrop-blur flex items-center justify-center text-white/80 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </Link>
          <TryVerseLogo height={26} />
          <span className="h-9 w-9" aria-hidden />
        </header>

        <div className="tv-home-scroll relative z-10 flex-1 w-full px-6 pt-8">
          <h1 className="tv-page-title tv-enter-1">{title}</h1>
          <p className="tv-page-desc mt-2 tv-enter-2">{description}</p>

          <div className="mt-6 tv-privacy-card tv-enter-3">
            <div className="tv-privacy-icon" aria-hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 5 5 1-3.5 4 1 6-5.5-3-5.5 3 1-6L4 8l5-1z"/></svg>
            </div>
            <div className="min-w-0">
              <div className="tv-body text-[11.5px] text-white font-medium leading-tight">
                Coming soon
              </div>
              <div className="tv-body text-[10.5px] text-white/55 leading-snug mt-0.5">
                We're crafting this experience with TryVerse premium quality.
              </div>
            </div>
          </div>

          <Link
            to="/home"
            className="tv-cta tv-body mt-6 h-12 rounded-full text-white font-medium text-[14px] flex items-center justify-center"
          >
            Back to Home
          </Link>
        </div>

        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}

export default AppPage;