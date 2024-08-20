import { HStack } from "panda/jsx";
import { token } from "panda/tokens";
import { type ReactElement } from "react";

export function PickerCard({
  children,
  tail,
  isSelected,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  children: ReactElement;
  tail: ReactElement;
  isSelected: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}): ReactElement {
  return (
    <HStack
      _hover={{
        bg: "blue.100",
      }}
      cursor="pointer"
      justifyContent="space-between"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      p="2"
      rounded="md"
      style={{
        background: isSelected ? token("colors.blue.500") : undefined,
        color: isSelected ? "white" : "black",
      }}
      w="100%"
    >
      {children}
      {tail}
    </HStack>
  );
}
