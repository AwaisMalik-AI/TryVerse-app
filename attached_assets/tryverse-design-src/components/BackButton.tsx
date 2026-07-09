import { useRouter, useNavigate } from "@tanstack/react-router";

type Props = {
  fallback?: string;
  ariaLabel?: string;
  className?: string;
};

/**
 * Android-style back arrow for TryVerse inner pages.
 * Uses browser history when possible; otherwise navigates to `fallback` (default: /home).
 */
export function BackButton({ fallback = "/home", ariaLabel = "Go back", className = "" }: Props) {
  const router = useRouter();
  const navigate = useNavigate();

  function handleClick() {
    // Check whether there is meaningful history to go back to.
    const canGoBack =
      typeof window !== "undefined" && window.history.length > 1;
    if (canGoBack) {
      router.history.back();
    } else {
      navigate({ to: fallback });
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`tv-back-btn ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}

export default BackButton;