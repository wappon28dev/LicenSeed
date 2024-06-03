import { styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import { Outlet } from "react-router-dom";

import "@/styles/global.css";

export default function Layout(): ReactElement {
  return (
    <p.main h={["100vh", "100dvh"]} wordBreak="keep-all">
      <Outlet />
    </p.main>
  );
}
