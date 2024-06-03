import { VStack, styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import { api } from "@/lib/services/rpc";

export default function Page(): ReactElement {
  const hello = async (): Promise<void> => {
    const result = await api.query(["hello"]);
    // eslint-disable-next-line no-console
    console.log(result);
  };

  return (
    <p.div display="grid" h="100%" placeItems="center">
      <VStack>
        <p.p fontWeight="bold">Hello!</p.p>
        <p.button
          bg={{ base: "blue.200", _hover: "blue.100" }}
          cursor="pointer"
          onClick={() => {
            void hello();
          }}
          p="2"
          rounded="lg"
        >
          asdf
        </p.button>
      </VStack>
    </p.div>
  );
}
