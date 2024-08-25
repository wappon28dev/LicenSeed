import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import { normalize } from "pathe";
import { useEffect, useState } from "react";
import { match } from "ts-pattern";
import { api } from "@/lib/services/api";
import { type $selectedFiles } from "@/lib/stores/file-tree";
import { type FileEntry } from "@/types/bindings";
import { type Nullable } from "@/types/utils";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useFileSelection(
  init?: ReturnType<(typeof $selectedFiles)["get"]>,
) {
  const [basePath, setBasePath] = useState<Nullable<string>>(init?.basePath);
  const [fileEntries, setFileEntries] = useState<FileEntry[]>(
    init?.fileEntries ?? [],
  );

  async function dirPath2fileEntries(dirPath: string): Promise<FileEntry[]> {
    if (dirPath == null || dirPath.length === 0) {
      throw new Error("`dirPath` is null!");
    }

    const normalizedPath = normalize(dirPath);
    setBasePath(normalizedPath);

    const { isDir } = match(await api.getFsMetadata(normalizedPath))
      .with({ status: "ok" }, ({ data }) => data)
      .otherwise(({ error }) => {
        throw new Error("ディレクトリの読み取りに失敗しました.", {
          cause: error,
        });
      });

    if (!isDir) throw new Error("ディレクトリではありません.");

    return match(await api.collectFileEntries(normalizedPath))
      .with({ status: "ok" }, ({ data }) => data)
      .otherwise(({ error }) => {
        throw new Error("ディレクトリの読み取りに失敗しました.", {
          cause: error,
        });
      });
  }

  async function selectDir(): Promise<void> {
    const dir = await open({
      directory: true,
    });

    if (dir == null) {
      throw new Error("`dir` is null!");
    }

    setFileEntries(await dirPath2fileEntries(dir));
  }

  useEffect(() => {
    const unListen = getCurrentWindow().onDragDropEvent((event) => {
      if (event.payload.type !== "drop") {
        return;
      }

      const path = event.payload.paths.at(0);
      if (path == null) {
        throw new Error("`path[0]` is null!");
      }

      void dirPath2fileEntries(path).then((entries) => {
        setFileEntries(entries);
      });
    });

    return () => {
      void unListen.then((f) => {
        f();
      });
    };
  }, []);

  return { fileEntries, setFileEntries, basePath, selectDir };
}
