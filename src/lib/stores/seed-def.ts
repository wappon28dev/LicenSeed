import { persistentAtom } from "@nanostores/persistent";
import { atom } from "nanostores";
import { getLocalStorageKey } from "@/lib/consts";
import { type SeedBaseGroupManifest } from "@/types/bindings";
import { type Nullable } from "@/types/utils";
import { type SeedDefWizardPartial } from "@/types/wizard";

export const $seedDefWizard = persistentAtom<SeedDefWizardPartial>(
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
