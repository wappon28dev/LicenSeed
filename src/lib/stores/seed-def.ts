import { persistentAtom } from "@nanostores/persistent";
import { atom } from "nanostores";
import { match } from "ts-pattern";
import { getLocalStorageKey } from "@/lib/consts";
import { getValues } from "@/lib/utils";
import { type SeedBaseGroup } from "@/types/bindings";
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
        seedDataType: keyof SeedCheckData;
      }
    | {
        status: "ERROR";
        seedDataType?: keyof SeedCheckData;
        title?: string;
        error?: unknown;
      }
    | {
        status: "DONE";
        seedDataType: "FORK";
        data: SeedCheckData["FORK"];
      }
    | {
        status: "DONE";
        seedDataType: "CUSTOM";
        data: SeedCheckData["CUSTOM"];
      }
  >
>(undefined);

$seedDefWizard.subscribe((wizard) => {
  match(wizard)
    .with({ data: { type: "FORK" } }, ({ data, summary }) => {
      const enableChecking =
        data != null && (summary?.notes?.length ?? 0) > 0 && summary != null;

      if (!enableChecking) return;

      $seedCheckStatusData.set({
        status: "READY",
        seedDataType: "FORK",
      });
    })
    .with({ data: { type: "CUSTOM" } }, ({ data, summary }) => {
      const enableChecking =
        data != null &&
        summary != null &&
        getValues(summary).some((v) => (v?.length ?? 0) > 0);

      if (!enableChecking) return;
      $seedCheckStatusData.set({
        status: "READY",
        seedDataType: "CUSTOM",
      });
    });
});
