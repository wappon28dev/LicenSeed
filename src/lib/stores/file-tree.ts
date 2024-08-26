import { atom } from "nanostores";
import { type FileEntry } from "@/types/bindings";
import { type Nullable } from "@/types/utils";

export const $selectedFiles =
  atom<Nullable<{ basePath: string; fileEntries: FileEntry[] }>>(undefined);

export const $hoveredPatterns = atom<string[]>([]);
