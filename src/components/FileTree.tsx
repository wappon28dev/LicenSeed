import { type ReactElement } from "react";
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
} from "react-complex-tree";

import "react-complex-tree/lib/style-modern.css";

export function FileTree(): ReactElement {
  const items = {
    root: {
      index: "root",
      isFolder: true,
      children: ["child1", "child2"],
      data: "Root item",
    },
    child1: {
      index: "child1",
      children: [],
      data: "Child item 1",
    },
    child2: {
      index: "child2",
      isFolder: true,
      children: ["child3"],
      data: "Child item 2",
    },
    child3: {
      index: "child3",
      children: [],
      data: "Child item 3",
    },
  };

  return (
    <UncontrolledTreeEnvironment
      dataProvider={
        new StaticTreeDataProvider(items, (item, data) => ({ ...item, data }))
      }
      getItemTitle={(item) => item.data}
      viewState={{}}
    >
      <Tree rootItem="root" treeId="tree-1" treeLabel="Tree Example" />
    </UncontrolledTreeEnvironment>
  );
}
