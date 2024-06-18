import { css } from "panda/css";
import { styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import FolderTree, { type FolderTreeProps, testData } from "react-folder-tree";

import "react-folder-tree/dist/style.css";

export function FileTree(): ReactElement {
  const onTreeStateChange: FolderTreeProps["onChange"] = (state, event) => {
    console.log(state, event);
  };

  return (
    <p.div
      className={css({
        "& .TreeNode": {
          p: "0",
        },
      })}
    >
      <FolderTree
        data={testData}
        initOpenStatus="closed"
        onChange={onTreeStateChange}
        readOnly
        showCheckbox={false}
      />
    </p.div>
  );
}
