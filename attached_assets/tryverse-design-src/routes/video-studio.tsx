import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/video-studio")({
  head: () => ({
    meta: [
      { title: "Showcase Video — TryVerse" },
      { name: "description", content: "Turn your outfit into a short fashion video for sharing." },
    ],
  }),
  component: () => <Outlet />,
});