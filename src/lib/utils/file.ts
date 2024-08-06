import naturalCompare from "natural-compare-lite";
import { join } from "pathe";
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

export function fileEntry2fileTreeData(entries: FileEntry[]): FileTreeData[] {
  return sortFileEntriesNaturally(entries).map((f) => ({
    ...f,
    id: join(f.basePath, f.name),
    children: f.children != null ? fileEntry2fileTreeData(f.children) : null,
  }));
}
