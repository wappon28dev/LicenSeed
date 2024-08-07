import naturalCompare from "natural-compare-lite";
import outmatch from "outmatch";
import { join, normalize } from "pathe";
import { match, P } from "ts-pattern";
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

export function fileEntry2fileTreeData(
  entries: FileEntry[],
  basePath: string,
): FileTreeData[] {
  return sortFileEntriesNaturally(entries).map((f) => ({
    ...f,
    id: join(basePath, normalize(f.relativePath)),
    relativePath: normalize(f.relativePath),
    children: match(f.children)
      .with(P.nonNullable, (c) => fileEntry2fileTreeData(c, basePath))
      .otherwise(() => null),
  }));
}

export function getMatchedIds(
  treeData: FileTreeData[],
  patterns: string[],
): string[] {
  const isMatched = outmatch(patterns);
  const matchedIds: string[] = [];

  function traverse(currentTreeData: FileTreeData[]): void {
    currentTreeData.forEach((t) => {
      if (isMatched(t.relativePath)) {
        matchedIds.push(t.id);
      }
      if (t.children != null) {
        traverse(t.children);
      }
    });
  }

  traverse(treeData);
  return matchedIds;
}
