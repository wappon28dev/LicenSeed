import { css } from "panda/css";
import { styled as p } from "panda/jsx";
import {
  type CSSProperties,
  type ComponentProps,
  type ReactElement,
} from "react";
import { Resplit } from "react-resplit";

export function Splitter({
  order = 1,
  style = {},
}: {
  order?: ComponentProps<typeof Resplit.Splitter>["order"];
  style?: CSSProperties;
}): ReactElement {
  return (
    <Resplit.Splitter
      className={css({
        display: "grid",
        placeItems: "center",
        _hover: {
          "& > div": {
            bg: "blue.300",
          },
        },
        _active: {
          "& > div": {
            bg: "blue.700",
          },
        },
      })}
      order={order}
      size="12px"
    >
      <p.div
        h="100%"
        style={style}
        transition="background 0.3s"
        transitionDelay="0.1s"
        w="3px"
      />
    </Resplit.Splitter>
  );
}
