import { createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/pose-studio")({
  head: () => ({
    meta: [
      { title: "Pose Studio — TryVerse" },
      { name: "description", content: "Turn outfit photos into polished fashion poses." },
    ],
  }),
  component: () => <Outlet />,
});