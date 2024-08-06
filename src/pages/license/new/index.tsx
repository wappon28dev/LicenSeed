import { VStack, styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import { FileTree } from "@/components/FileTree";
import { useDragAndDrop } from "@/hooks/drag-and-drop";

export default function Page(): ReactElement {
  const { fileEntries, basePath } = useDragAndDrop();

  return (
    <VStack h="100%" w="100%">
      <p.div>
        <p.code>{fileEntries.length}</p.code>
      </p.div>
      <p.div h="100%" p="2" w="100%">
        {basePath != null && (
          <FileTree basePath={basePath} fileEntries={fileEntries} />
        )}
      </p.div>
    </VStack>
  );
}
