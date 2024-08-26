import { Icon } from "@iconify/react";
import { HStack, styled as p } from "panda/jsx";
import { token } from "panda/tokens";
import { type ComponentProps, type ReactElement } from "react";
import { match } from "ts-pattern";

export function Button({
  icon,
  children,
  variant = "filled",
  baseColor = "blue",
  ...props
}: {
  variant?: "filled" | "light" | "outline";
  icon?: string;
  children: ReactElement;
  baseColor?: "blue" | "orange" | "green" | "red" | "gray";
} & ComponentProps<(typeof p)["button"]>): ReactElement {
  return (
    <p.button
      p="2"
      px="5"
      rounded="md"
      {...props}
      _hover={{
        opacity: 0.8,
      }}
      style={{
        backgroundColor: match(variant)
          .with("filled", () => token(`colors.${baseColor}.500`))
          .with("light", () => token(`colors.${baseColor}.50`))
          .with("outline", () => token("colors.white"))
          .exhaustive(),
        color: match(variant)
          .with("filled", () => token("colors.white"))
          .otherwise(() => token(`colors.${baseColor}.500`)),
        border: match(variant)
          .with(
            "outline",
            () => `1px solid ${token(`colors.${baseColor}.500`)}`,
          )
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
