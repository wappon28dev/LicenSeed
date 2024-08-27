import { atom } from "nanostores";
import { type FileEntriesKit } from "@/types/file";
import { type Nullable } from "@/types/utils";

export const $fileEntriesKit = atom<Nullable<FileEntriesKit>>(undefined);

export const $hoveredPatterns = atom<string[]>([]);
