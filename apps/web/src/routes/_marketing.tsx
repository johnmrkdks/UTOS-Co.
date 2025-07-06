import Header from "@/components/header";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative">
      <Header className="sticky top-0 z-10" />
      <div>
        <Outlet />
      </div>
    </div>
  );
}
