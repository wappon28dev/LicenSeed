import { useEffect, useMemo, useState, type ReactElement } from "react";
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
type FileTreeItem = TreeItemData<FileEntry>;

function fileEntriesToTreeItems(fileEntries: FileEntry[]): FileTreeItem {
  const treeItems: FileTreeItem = {};

  treeItems.root = {
    index: "root",
    data: {
      path: "root",
      is_dir: true,
    },
    children: fileEntries.map((entry) => entry.path),
  };

  fileEntries.forEach((entry, idx) => {
    treeItems[entry.path] = {
      index: entry.path,
      data: entry,
      children: [],
    };
  });

  return treeItems;
}

export function FileTree({
  fileEntries,
}: {
  fileEntries: FileEntry[];
}): ReactElement {
  const [treeData, setTreeData] = useState<FileTreeItem>({});
  const dataProvider = useMemo(
    () => new StaticTreeDataProvider(fileEntriesToTreeItems(fileEntries)),
    [treeData],
  );

  useEffect(() => {
    setTreeData(fileEntriesToTreeItems(fileEntries));
    console.log("fileEntries", fileEntries);
    console.log("treeData", treeData);
  }, [fileEntries]);

  return (
    <UncontrolledTreeEnvironment
      dataProvider={dataProvider}
      getItemTitle={(item) => item.data}
      viewState={{}}
    >
      <Tree rootItem="root" treeId="tree-1" treeLabel="Tree Example" />
    </UncontrolledTreeEnvironment>
  );
}
