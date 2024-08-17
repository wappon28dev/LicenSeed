import { type SeedDef, type SeedData } from "./bindings";
import { type Override } from "./utils";

export type SeedDefWizard = SeedDef & {
  data: SeedData;
};

export type SeedDefWizardPartial = Override<
  Partial<SeedDefWizard>,
  {
    data?: Partial<SeedData>;
  }
>;
