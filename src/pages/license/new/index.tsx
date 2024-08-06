import { VStack, styled as p } from "panda/jsx";
import { type ReactElement } from "react";
import { FileTree } from "@/components/FileTree";
import { useDragAndDrop } from "@/hooks/drag-and-drop";

export default function Page(): ReactElement {
  const { fileEntries } = useDragAndDrop();

  return (
    <VStack>
      <p.div>
        <p.code>{fileEntries.length}</p.code>
      </p.div>
      <FileTree fileEntries={fileEntries} />
    </VStack>
  );
}
