import { persistentAtom } from "@nanostores/persistent";
import { atom } from "nanostores";
import { getLocalStorageKey } from "@/lib/consts";
import {
  type SeedData,
  type SeedBaseGroupManifest,
  type SeedDef,
} from "@/types/bindings";
import { type Override, type Nullable } from "@/types/utils";

export const $seedDefWizard = persistentAtom<
  Override<
    Partial<SeedDef>,
    {
      data?: Partial<SeedData>;
    }
  >
>(
  getLocalStorageKey("seedDefWizard"),
  {},
  {
    // @ts-expect-error: なんか型が合わない
    encode: JSON.stringify,
    // @ts-expect-error: なんか型が合わない
    decode: JSON.parse,
  },
);

export const $seedBaseGroupManifestCache =
  atom<Nullable<SeedBaseGroupManifest>>(undefined);
