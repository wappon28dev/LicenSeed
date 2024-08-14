import { type SeedDefFile } from "./bindings";

export type SeedDefWizard = (
  | {
      type: "REUSE";
      baseSeedId: string;
    }
  | {
      type: "CROSSBREED";
      baseSeedIds: string[];
    }
  | {
      type: "FORK";
      baseSeedId: string;
    }
  | {
      type: "CUSTOM";
    }
) & {
  seedDefFile: SeedDefFile;
};
