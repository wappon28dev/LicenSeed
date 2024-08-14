import { Icon } from "@iconify/react";
import { styled as p, VStack } from "panda/jsx";
import { type ReactElement } from "react";
import { Outlet, useRouteError } from "react-router-dom";

import "@/styles/global.css";
import "@/styles/fonts.css";

export function Catch(): ReactElement {
  const error = useRouteError();

  return (
    <p.div
      bg="red.50"
      color="red.500"
      display="grid"
      h="100vh"
      placeItems="center"
      w="100%"
    >
      <VStack position="relative" w="100%">
        <Icon height="3em" icon="mdi:robot-dead" />
        <p.p fontSize="1.2rem" fontWeight="bold">
          Oops! 予期せぬエラーが発生しました
        </p.p>
        <p.code>{String(error)}</p.code>
        <p.div
          left="50%"
          position="absolute"
          top="50%"
          transform="translate(-50%, -50%)"
          userSelect="none"
        >
          <p.img src="https://i.gyazo.com/ebdf27f6d7df60165b7711e5e44d4388.webp" />
        </p.div>
      </VStack>
    </p.div>
  );
}

export default function Layout(): ReactElement {
  return (
    <p.main h={["100vh", "100dvh"]} wordBreak="keep-all">
      <Outlet />
    </p.main>
  );
}
