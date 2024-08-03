import { getCurrent } from "@tauri-apps/api/window";
import { VStack, styled as p } from "panda/jsx";
import { useEffect, useState, type ReactElement } from "react";
import { FileTree } from "@/components/FileTree";
import { api } from "@/lib/services/api";
import { type FileEntry } from "@/types/bindings";

export default function Page(): ReactElement {
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);

  useEffect(() => {
    const unListen = getCurrent().onDragDropEvent((ev) => {
      if (ev.payload.type !== "dropped") {
        return;
      }
      const path = ev.payload.paths.at(0);
      if (path == null) throw new Error("Path at 0 is null!");
      void api.showFiles(path).then((result) => {
        setFileEntries(result);
      });
    });

    return () => {
      void unListen.then((fn) => {
        fn();
      });
    };
  }, []);

  return (
    <VStack>
      <p.div>
        <p.code>{fileEntries.length}</p.code>
      </p.div>
      <FileTree fileEntries={fileEntries} />
    </VStack>
  );
}
