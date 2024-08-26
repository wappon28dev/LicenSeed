import { err, ok, type Result } from "neverthrow";
import { match } from "ts-pattern";
import { z, type ZodError } from "zod";
import { type SeedDef, type SeedData } from "./bindings";
import { zSeedData, zSeedDef } from "./bindings.schema";
import { type OmitStrict, type Override } from "./utils";

export type SeedDefWizard = SeedDef & {
  data: SeedData;
};

export type SeedDefWizardPartial = Override<
  Partial<SeedDefWizard>,
  {
    data?: Partial<SeedData>;
  }
>;

export type SeedDefWizardWith<T extends SeedData["type"]> = OmitStrict<
  SeedDefWizard,
  "data"
> & {
  data: Extract<SeedDefWizard["data"], { type: T }>;
};

export type SeedDefWizardPartialWith<T extends SeedData["type"]> = OmitStrict<
  SeedDefWizardPartial,
  "data"
> & {
  data?: Partial<Extract<SeedDefWizard["data"], { type: T }>>;
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
): Result<SeedDefWizard, ZodError>;
export function zSeedDefWizardParse<T extends SeedData["type"]>(
  seedDefWizard: SeedDefWizardPartial,
): Result<SeedDefWizardWith<T>, ZodError>;

// implementation
export function zSeedDefWizardParse<T extends SeedData["type"]>(
  seedDefWizard: SeedDefWizardPartial,
): Result<SeedDefWizard | SeedDefWizardWith<T>, ZodError> {
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