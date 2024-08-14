import { Icon } from "@iconify/react";
import { styled as p, VStack } from "panda/jsx";
import { useEffect, type ReactElement } from "react";

export function ErrorScreen({
  title,
  error,
}: {
  title?: string;
  error: any;
}): ReactElement {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, []);

  return (
    <p.div
      bg="red.50"
      color="red.500"
      display="grid"
      h="100%"
      placeItems="center"
      w="100%"
    >
      <VStack position="relative" w="100%">
        <Icon height="3em" icon="mdi:robot-dead" />
        <p.p fontSize="1.2rem" fontWeight="bold">
          {title != null ? `${title}中に` : "不明な"}エラーが発生しました
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
