import { persistentAtom } from "@nanostores/persistent";
import { getLocalStorageKey } from "@/lib/consts";
import { type SeedDefWizard } from "@/types/seed-def";

export const $seedDefWizard = persistentAtom<Partial<SeedDefWizard>>(
  getLocalStorageKey("seedDefWizard"),
  {},
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  },
);
