import { HStack, styled as p, VStack } from "panda/jsx";
import { type ReactElement } from "react";
import { type NodeRendererProps, Tree } from "react-arborist";
import { getIconUrlByName, getIconUrlForFilePath } from "vscode-material-icons";
import { type FileEntry } from "@/types/bindings";

function Node({
  node,
  style,
  dragHandle,
}: NodeRendererProps<FileEntry>): ReactElement {
  const ICONS_URL = "/assets/material-icons";
  const icon = getIconUrlForFilePath(node.data.name, ICONS_URL);
  const folderIcon = getIconUrlByName("folder", ICONS_URL);

  return (
    <HStack
      ref={dragHandle}
      onClick={() => {
        node.toggle();
      }}
      style={style}
    >
      <p.img
        alt=""
        height="1em"
        src={node.data.is_dir ? folderIcon : icon}
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
  return (
    <VStack w="100%">
      <p>{fileEntries?.length}</p>
      {fileEntries?.length !== 0 && (
        <Tree
          idAccessor={(d) => d.name}
          indent={24}
          initialData={fileEntries}
          onToggle={(node) => {
            console.log(node);
          }}
        >
          {Node}
        </Tree>
      )}
    </VStack>
  );
}
