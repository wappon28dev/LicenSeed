import { Icon } from "@iconify/react";
import { HStack, styled as p } from "panda/jsx";
import { token } from "panda/tokens";
import { type ComponentProps, type ReactElement } from "react";
import { match } from "ts-pattern";

export function Button({
  icon,
  children,
  type = "filled",
  styles,
}: {
  type?: "filled" | "light" | "outline";
  icon?: string;
  children: ReactElement;
  styles?: ComponentProps<(typeof p)["button"]>;
}): ReactElement {
  return (
    <p.button
      p="2"
      px="5"
      rounded="md"
      {...styles}
      style={{
        backgroundColor: match(type)
          .with("filled", () => token("colors.blue.500"))
          .with("light", () => token("colors.blue.50"))
          .with("outline", () => token("colors.white"))
          .exhaustive(),
        color: match(type)
          .with("filled", () => token("colors.white"))
          .otherwise(() => token("colors.blue.500")),
        border: match(type)
          .with("outline", () => `1px solid ${token("colors.blue.500")}`)
          .otherwise(() => "none"),
      }}
    >
      <HStack>
        {icon != null && <Icon icon={icon} />}
        {children}
      </HStack>
    </p.button>
  );
}
