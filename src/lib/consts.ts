import { P } from "ts-pattern";
import { INFO } from "./config";

// pattern for swr
export const S = {
  Error: { error: P.not(undefined) },
  Loading: { isLoading: true },
  Success: { data: P.not(undefined) },
};

// pattern for tauri API
export const T = {
  Ok: { status: "ok" } as const,
  Error: { status: "error" } as const,
};

export const LOCAL_STORAGE_VERSION = "1";
export function getLocalStorageKey(key: string, trailingColon = false): string {
  return `${INFO.id}.v${LOCAL_STORAGE_VERSION}.${key}${trailingColon ? ":" : ""}`;
}
