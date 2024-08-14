import { css } from "panda/css";
import { VStack, styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import { Resplit } from "react-resplit";
import { Splitter } from "@/components/Splitter";

export function ConfirmSeedDef(): ReactElement {
  return (
    <Resplit.Root
      className={css({
        display: "flex",
        h: "100%",
        w: "100%",
      })}
      direction="horizontal"
    >
      <Resplit.Pane
        className={css({
          h: "100%",
          w: "100%",
          bg: "blue.100",
        })}
        initialSize="1fr"
        order={0}
      >
        <VStack justifyContent="space-between" w="100%">
          <p.div
            className={css({
              "& .FolderTree": {
                h: "50vh",
                w: "100%",
                overflow: "scroll",
              },
            })}
            w="100%"
          >
            asdf
          </p.div>
          <p.div h="50%" w="100%">
            metadata
          </p.div>
        </VStack>
      </Resplit.Pane>
      <Splitter />
      <Resplit.Pane
        className={css({
          h: "100%",
          overflowY: "auto",
        })}
        initialSize="5fr"
        order={2}
      >
        asdf
      </Resplit.Pane>
    </Resplit.Root>
  );
}
