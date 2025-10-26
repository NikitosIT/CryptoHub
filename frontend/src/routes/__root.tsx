import { Outlet, createRootRoute } from "@tanstack/react-router";
import Header from "@/components/Header";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Header />
      <hr className="mb-30" />
      <div>
        <Outlet />
      </div>
    </>
  );
}
