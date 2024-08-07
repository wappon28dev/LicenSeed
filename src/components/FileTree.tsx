import { Icon } from "@iconify/react";
import { HStack, styled as p, VStack } from "panda/jsx";
import { token } from "panda/tokens";
import {
  type ComponentProps,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type MutableRefObject,
} from "react";
import {
  type NodeApi,
  type NodeRendererProps,
  Tree,
  type TreeApi,
} from "react-arborist";
import useResizeObserver from "use-resize-observer";
import { getIconUrlByName, getIconUrlForFilePath } from "vscode-material-icons";
import { fileEntry2fileTreeData, getMatchedIds } from "@/lib/utils/file";
import { type FileEntry } from "@/types/bindings";
import { type FileTreeData } from "@/types/file";
import { type Nullable } from "@/types/utils";

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
      style={{
        ...style,
        background: node.isSelected ? token("colors.blue.100") : "transparent",
      }}
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
      <p.div alignItems="center" display="grid">
        <p.img
          alt=""
          h="1em"
          src={node.data.isDir ? folderIcon : icon}
          w="auto"
        />
      </p.div>
      <p.code overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
        {node.data.name}
      </p.code>
    </HStack>
  );
}

function Controller<T>({ treeApi }: { treeApi: TreeApi<T> }): ReactElement {
  return (
    <HStack justifyContent="right" w="100%">
      <p.button
        _hover={{ bg: "gray.100" }}
        onClick={() => {
          treeApi.openAll();
        }}
      >
        <Icon icon="mdi:plus-box-multiple" />
      </p.button>
      <p.button
        _hover={{ bg: "gray.100" }}
        onClick={() => {
          treeApi.closeAll();
        }}
      >
        <Icon icon="mdi:minus-box-multiple" />
      </p.button>
    </HStack>
  );
}

export function FileTree({
  basePath,
  fileEntries,
  patterns,
}: {
  basePath: string;
  fileEntries: FileEntry[];
  patterns: string[];
}): ReactElement {
  type T = FileTreeData;

  const { ref, width, height } = useResizeObserver();

  const treeData = useMemo(
    () => fileEntry2fileTreeData(fileEntries, basePath),
    [fileEntries],
  );
  const [activatedNode, setActivatedNode] = useState<NodeApi<T>>();

  const treeRef = useRef() as ComponentProps<typeof Tree<T>>["ref"];
  const treeApi = useMemo<Nullable<TreeApi<T>>>(() => {
    const _ref = treeRef as Nullable<MutableRefObject<TreeApi<T>>>;
    if (_ref?.current == null) return undefined;
    return _ref.current;
  }, [treeRef, treeData]);

  const matchedIds = useMemo(
    () => getMatchedIds(treeData, patterns),
    [treeData, patterns],
  );

  useEffect(() => {
    treeApi?.deselectAll();
    matchedIds.forEach((m) => {
      treeApi?.selectMulti(m);
      treeApi?.onBlur();
    });
  }, [matchedIds]);

  useEffect(() => {
    if (activatedNode == null) return;
    const isTooDeep =
      activatedNode.data.isDir && activatedNode.data.children == null;
    console.log("too deep", isTooDeep);
  }, [activatedNode]);

  return (
    <VStack h="100%" w="100%">
      {treeApi != null && <Controller treeApi={treeApi} />}
      <p.div ref={ref} h="95%" w="100%">
        <Tree
          ref={treeRef}
          data={treeData}
          height={height}
          idAccessor={(d) => d.id}
          indent={24}
          onActivate={setActivatedNode}
          openByDefault
          selectionFollowsFocus
          width={width}
        >
          {Node}
        </Tree>
      </p.div>
    </VStack>
  );
}
