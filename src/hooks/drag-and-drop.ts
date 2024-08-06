import { getCurrentWindow } from "@tauri-apps/api/window";
import { normalize } from "pathe";
import { useEffect, useState } from "react";
import { api } from "@/lib/services/api";
import { type FileEntry } from "@/types/bindings";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDragAndDrop() {
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);

  useEffect(() => {
    const unListen = getCurrentWindow().onDragDropEvent((event) => {
      if (event.payload.type !== "drop") {
        return;
      }

      const path = event.payload.paths.at(0);
      if (path == null) throw new Error("`path[0]` is null!");

      const normalizedPath = normalize(path);
      void api.showFiles(normalizedPath).then((result) => {
        setFileEntries(result);
      });
    });

    return () => {
      void unListen.then((f) => {
        f();
      });
    };
  }, []);

  return { fileEntries, setFileEntries };
}
