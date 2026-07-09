import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/try-on")({
  component: () => <Outlet />,
});