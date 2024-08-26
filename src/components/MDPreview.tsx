import MDEditor from "@uiw/react-md-editor";
import { css } from "panda/css";
import { styled as p } from "panda/jsx";
import {
  type ReactElement,
  type ComponentProps,
  useRef,
  useEffect,
} from "react";
import rehypeSanitize from "rehype-sanitize";
import { api } from "@/lib/services/api";

export function MDPreview(
  props: ComponentProps<(typeof MDEditor)["Markdown"]>,
): ReactElement {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref == null) return;

    ref.current?.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        void api.openBrowser(a.getAttribute("href") ?? "");
      });
    });
  }, [ref]);

  return (
    <p.div ref={ref} h="100%" w="100%">
      <MDEditor.Markdown
        {...props}
        className={css({
          w: "100%",
        })}
        rehypePlugins={[[rehypeSanitize]]}
      />
    </p.div>
  );
}
