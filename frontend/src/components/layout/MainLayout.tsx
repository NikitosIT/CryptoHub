import { Outlet } from "@tanstack/react-router";

import Header from "./Header";

export function MainLayout() {
  return (
    <>
      <Header />
      <hr className="mb-4 sm:mb-6 md:mb-8" />
      <div className="px-2 sm:px-4 md:px-6 lg:px-8">
        <Outlet />
      </div>
    </>
  );
}
