import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { css } from "panda/css";
import {
  useState,
  type Dispatch,
  type ReactElement,
  type SetStateAction,
} from "react";

export function Dialog({
  children,
  content,
}: {
  children: ReactElement;
  content: (setIsOpened: Dispatch<SetStateAction<boolean>>) => ReactElement;
}): ReactElement {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <AlertDialog.Root onOpenChange={setIsOpened} open={isOpened}>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          className={css({
            bgColor: "rgba(0, 0, 0, 0.4)",
            position: "fixed",
            inset: 0,
            zIndex: "modal",
            "&[data-state='open']": {
              animation: "fadeIn 100ms ease-out",
            },
            "&[data-state='closed']": {
              animation: "fadeOut 100ms ease-out",
            },
          })}
        />
        <AlertDialog.Content
          className={css({
            position: "fixed",
            top: "50%",
            overflowY: "auto",
            left: "50%",
            transform: "translate(-50%, -50%)",
            w: "100%",
            h: "100%",
            maxW: {
              base: "90%",
              mdDown: "100%",
            },
            maxH: "90vh",
            transition: "height 0.3s ease",
            p: "5",
            bgColor: "white",
            animation: "fadeIn 0.2s",
            display: "grid",
            zIndex: "modalContent",
            rounded: "md",
            _focus: {
              outline: "none",
            },
          })}
        >
          {content(setIsOpened)}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
