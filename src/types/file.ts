import { type FileEntry } from "./bindings";

export type FileTreeData = FileEntry & {
  id: string;
};
