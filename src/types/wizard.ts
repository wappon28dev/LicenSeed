import { err, ok, type Result } from "neverthrow";
import { match } from "ts-pattern";
import { z, type ZodError } from "zod";
import { type SeedDef, type SeedData, type SeedDefFileKit } from "./bindings";
import { zSeedData, zSeedDef } from "./bindings.schema";
import { type OmitStrict, type Override } from "./utils";

export type SeedDef4overview = SeedDef &
  (
    | {
        isRoot: true;
      }
    | {
        isRoot: false;
        basePath: string;
      }
  );

export type SeedDefFileKit4overview = Override<
  SeedDefFileKit,
  {
    seeds: SeedDef4overview[];
  }
>;

export type SeedDefWizardPartial = Override<
  Partial<SeedDef4overview>,
  {
    data?: Partial<SeedData>;
  }
>;

export type SeedDefWizardWith<T extends SeedData["type"]> = OmitStrict<
  SeedDef4overview,
  "data"
> & {
  data: Extract<SeedDef4overview["data"], { type: T }>;
};

export type SeedDefWizardPartialWith<T extends SeedData["type"]> = OmitStrict<
  SeedDefWizardPartial,
  "data"
> & {
  data?: Partial<Extract<SeedDef4overview["data"], { type: T }>>;
};

export type SeedCheckData = {
  FORK: {
    isContradiction: boolean;
    advice: string;
  };
  CUSTOM: {
    isContradiction: boolean;
    advice: string;
    recommendedBaseSeedIds: string[];
  };
};

// overload
export function zSeedDefWizardParse(
  seedDefWizard: SeedDefWizardPartial,
): Result<SeedDef, ZodError>;
export function zSeedDefWizardParse<T extends SeedData["type"]>(
  seedDefWizard: SeedDefWizardPartial,
): Result<SeedDefWizardWith<T>, ZodError>;

// implementation
export function zSeedDefWizardParse<T extends SeedData["type"]>(
  seedDefWizard: SeedDefWizardPartial,
): Result<SeedDef | SeedDefWizardWith<T>, ZodError> {
  return match(
    z
      .object({
        ...zSeedDef.shape,
        data: zSeedData,
      })
      .safeParse(seedDefWizard),
  )
    .with({ success: true }, ({ data }) => ok(data as SeedDefWizardWith<T>))
    .with({ success: false }, ({ error }) => err(error))
    .exhaustive();
}
