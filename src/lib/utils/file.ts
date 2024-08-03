import { join } from "@tauri-apps/api/path";
import naturalCompare from "natural-compare-lite";
import { type FileEntry } from "@/types/bindings";
import { type FileTreeData } from "@/types/file";

export function sortFileEntriesNaturally(
  fileEntries: FileEntry[],
): FileEntry[] {
  const dirs = fileEntries.filter((e) => e.isDir);
  const files = fileEntries.filter((e) => !e.isDir);

  const sortedDirs = dirs.sort((a, b) => naturalCompare(a.name, b.name));
  const sortedFiles = files.sort((a, b) => naturalCompare(a.name, b.name));

  return [...sortedDirs, ...sortedFiles];
}

export async function processFileEntries(
  entries: FileEntry[],
): Promise<FileTreeData[]> {
  return await Promise.all(
    sortFileEntriesNaturally(entries).map(async (f) => ({
      ...f,
      id: await join(f.basePath, f.name),
      children:
        f.children != null ? await processFileEntries(f.children) : null,
    })),
  );
}
