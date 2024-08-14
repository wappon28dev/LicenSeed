import { persistentAtom } from "@nanostores/persistent";
import { getLocalStorageKey } from "@/lib/consts";
import { type SeedDef } from "@/types/bindings";
import { type PartialRecursive } from "@/types/utils";

export const $seedDefWizard = persistentAtom<PartialRecursive<SeedDef>>(
  getLocalStorageKey("seedDefWizard"),
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
);
