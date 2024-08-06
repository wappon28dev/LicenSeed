import { Icon } from "@iconify/react";
import { HStack, styled as p, VStack } from "panda/jsx";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import { type NodeApi, type NodeRendererProps, Tree } from "react-arborist";
import { getIconUrlByName, getIconUrlForFilePath } from "vscode-material-icons";
import { fileEntry2fileTreeData } from "@/lib/utils/file";
import { type FileEntry } from "@/types/bindings";
import { type FileTreeData } from "@/types/file";

function Node({
  node,
  style,
  dragHandle,
}: NodeRendererProps<FileTreeData>): ReactElement {
  const ICONS_URL = "/assets/material-icons";
  const icon = getIconUrlForFilePath(node.data.name, ICONS_URL);
  const folderIcon = getIconUrlByName("folder", ICONS_URL);

  return (
    <HStack
      ref={dragHandle}
      _hover={{
        bg: "gray.100",
      }}
      onClick={() => {
        node.toggle();
      }}
      style={style}
      w="100%"
    >
      <p.div
        style={{
          opacity: node.data.isDir ? 1 : 0,
          rotate: node.isOpen ? "0deg" : "-90deg",
        }}
      >
        <Icon icon="mdi:triangle-small-down" />
      </p.div>
      <p.img
        alt=""
        height="1em"
        src={node.data.isDir ? folderIcon : icon}
        width="auto"
      />
      <p.code overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
        {node.data.name}
      </p.code>
    </HStack>
  );
}

export function FileTree({
  fileEntries,
}: {
  fileEntries: FileEntry[];
}): ReactElement {
  const treeData = useMemo(
    () => fileEntry2fileTreeData(fileEntries),
    [fileEntries],
  );
  const [activatedNode, setActivatedNode] = useState<NodeApi<FileTreeData>>();

  useEffect(() => {
    if (activatedNode == null) return;
    const isTooDeep =
      activatedNode.data.isDir && activatedNode.data.children == null;
    console.log("too deep", isTooDeep);
  }, [activatedNode]);

  return (
    <VStack h="100%" w="100%">
      <Tree
        data={treeData}
        disableMultiSelection
        idAccessor={(d) => d.id}
        indent={24}
        onActivate={setActivatedNode}
        openByDefault={false}
        width="100%"
      >
        {Node}
      </Tree>
    </VStack>
  );
}
