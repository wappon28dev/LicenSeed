import { Icon } from "@iconify/react";
import { styled as p, VStack } from "panda/jsx";
import { useEffect, type ReactElement } from "react";

export function ErrorScreen({
  title,
  error,
}: {
  title: string;
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
      <VStack w="100%">
        <Icon height="3em" icon="mdi:robot-dead" />
        <p.p fontSize="1.2rem" fontWeight="bold">
          {title}中にエラーが発生しました.
        </p.p>
        <p.code>{String(error)}</p.code>
      </VStack>
    </p.div>
  );
}
