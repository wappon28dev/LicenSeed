import { persistentAtom } from "@nanostores/persistent";
import { atom } from "nanostores";
import { getLocalStorageKey } from "@/lib/consts";
import { type SeedData, type SeedBaseGroup } from "@/types/bindings";
import { type Nullable } from "@/types/utils";
import { type SeedCheckData, type SeedDefWizardPartial } from "@/types/wizard";

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

export const $seedBaseGroupCache = atom<Nullable<SeedBaseGroup>>(undefined);

export const $seedCheckStatusData = atom<
  Nullable<
    | {
        status: "CHECKING";
      }
    | {
        status: "READY";
        seedDataType: SeedData["type"];
      }
    | {
        status: "ERROR";
        seedDataType?: SeedData["type"];
        title?: string;
        error?: unknown;
      }
    | {
        status: "DONE";
        seedDataType: SeedData["type"];
        data: SeedCheckData["fork"];
      }
  >
>(undefined);
