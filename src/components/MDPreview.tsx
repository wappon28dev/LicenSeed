import MDEditor from "@uiw/react-md-editor";
import { css } from "panda/css";
import { type ReactElement, type ComponentProps } from "react";
import rehypeSanitize from "rehype-sanitize";

export function MDPreview(
  props: ComponentProps<(typeof MDEditor)["Markdown"]>,
): ReactElement {
  return (
    <MDEditor.Markdown
      {...props}
      className={css({
        w: "100%",
      })}
      rehypePlugins={[[rehypeSanitize]]}
    />
  );
}
