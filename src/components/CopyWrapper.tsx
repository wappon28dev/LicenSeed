import { Icon } from "@iconify/react";
import { styled as p } from "panda/jsx";
import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { waitMs } from "@/lib/consts";

export function CopyWrapper({
  copyText,
  titleText,
  children,
  spaceExpanded = false,
}: {
  copyText: string;
  titleText?: string;
  children: ReactNode;
  spaceExpanded?: boolean;
}): ReactElement {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selection = window.getSelection();
    const range = document.createRange();

    if (ref.current == null) throw new Error("ref.current is null");
    if (selection == null) throw new Error("selection is null");

    if (copied) {
      range.selectNode(ref.current);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      selection.removeAllRanges();
    }
  }, [copied]);

  const copyToClipboard = async (): Promise<void> => {
    if (copied) return;
    await navigator.clipboard.writeText(copyText);
    setCopied(true);

    await waitMs(2000);
    setCopied(false);
  };

  return (
    <p.span
      display="inline-flex"
      gap="2"
      justifyContent="space-between"
      w={spaceExpanded ? "100%" : "auto"}
    >
      <p.span ref={ref}>{children}</p.span>
      <p.button
        onClick={() => {
          void copyToClipboard();
        }}
        style={{
          cursor: copied ? "default" : "pointer",
        }}
        title={titleText ?? "クリップボードにコピー"}
      >
        <Icon icon={copied ? "mdi:check" : "mdi:content-copy"} />
      </p.button>
    </p.span>
  );
}
