import { type FileEntry } from "./bindings";

export type FileTreeData = FileEntry & {
  id: string;
  relativePath: string;
  children: FileTreeData[] | null;
};
