import { Icon } from "@iconify/react/dist/iconify.js";
import { HStack, styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import { useNavigate } from "@/hooks/useNavigate";

const Card = p("button", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1",
    p: "3",
    rounded: "md",
    border: "1px solid",

    _hover: {
      bg: "gray.100",
    },

    "& > p": {
      fontSize: "xl",
    },
  },
});

export default function Page(): ReactElement {
  const navigate = useNavigate();

  return (
    <p.div display="grid" h="100%" placeItems="center">
      <HStack gap="5">
        <Card
          onClick={() => {
            navigate("/seeds/view");
          }}
        >
          <Icon height="2em" icon="mdi:file-eye-outline" />
          <p.p>シードの確認</p.p>
        </Card>
        <Card
          onClick={() => {
            navigate("/seeds/new");
          }}
        >
          <Icon height="2em" icon="mdi:seed-plus" />
          <p.p>シードの付与</p.p>
        </Card>
      </HStack>
    </p.div>
  );
}
