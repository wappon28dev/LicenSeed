/*
import { useMemo, type ReactElement } from "react";
import {
  UncontrolledTreeEnvironment,
  Tree,
  StaticTreeDataProvider,
  type TreeItem,
  type TreeItemIndex,
} from "react-complex-tree";
import { type FileEntry } from "@/types/bindings";

import "react-complex-tree/lib/style-modern.css";

type TreeItemData<T> = Record<TreeItemIndex, TreeItem<T>>;
type FileTreeItem = TreeItemData<string>;

function fileEntriesToTreeItems(fileEntries: FileEntry[]): FileTreeItem {
  const treeItems: FileTreeItem = {
    root: {
      index: "root",
      data: "root",
      children: fileEntries.map((entry) => entry.path.replaceAll("\\", "_")),
    },
  };

  fileEntries.forEach((entry) => {
    const index = entry.path.replaceAll("\\", "_");
    treeItems[index] = {
      index,
      data: index,
      children: [],
    };
  });

  console.log("treeItems: ", treeItems);

  return treeItems;
}

export function FileTree({
  fileEntries,
}: {
  fileEntries: FileEntry[];
}): ReactElement {
  const treeData = useMemo(
    () => fileEntriesToTreeItems(fileEntries),
    [fileEntries],
  );

  const dataProvider = useMemo(
    () =>
      new StaticTreeDataProvider(treeData, (item, data) => ({ ...item, data })),
    [treeData],
  );

  return (
    <UncontrolledTreeEnvironment
      dataProvider={dataProvider}
      getItemTitle={(item) => item.data} // アイテムのタイトルが正しいか確認
      viewState={{}} // 必要に応じて適切な viewState を設定
    >
      <Tree rootItem="root" treeId="tree-1" treeLabel="Tree Example" />
    </UncontrolledTreeEnvironment>
  );
}
*/
