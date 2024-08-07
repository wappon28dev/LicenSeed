import { VStack, styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import { Link } from "@/router";

export default function Page(): ReactElement {
  return (
    <p.div display="grid" h="100%" placeItems="center">
      <VStack>
        <p.p fontWeight="bold">Hello!</p.p>
        <Link to="/licenses/new">
          <p.button
            bg={{ base: "blue.200", _hover: "blue.100" }}
            cursor="pointer"
            p="2"
            rounded="lg"
          >
            asdf
          </p.button>
        </Link>
      </VStack>
    </p.div>
  );
}
