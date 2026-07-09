import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Buy Credits — TryVerse" },
      { name: "description", content: "Buy TryVerse credits for try-ons, poses, videos, and AI styling." },
    ],
  }),
  component: () => <Outlet />,
});