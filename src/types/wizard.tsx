import { type SeedDef, type SeedData } from "./bindings";
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

export type SeedDefWizardPartialWith<T extends SeedData["type"]> = OmitStrict<
  SeedDefWizardPartial,
  "data"
> & {
  data?: Partial<Extract<SeedDefWizard["data"], { type: T }>>;
};

export type SeedCheckData = {
  fork: {
    isContradiction: boolean;
    advice: string;
  };
};
