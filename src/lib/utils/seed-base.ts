import { type SeedBase, type SeedBaseGroup } from "@/types/bindings";
import { type Nullable } from "@/types/utils";

export function findBaseGroupAndBasesFromId(
  groups: SeedBaseGroup[],
  id: string,
): Nullable<{
  group: SeedBaseGroup;
  base: SeedBase;
}> {
  const group = groups.find((g) => g.bases.some((b) => b.id === id));
  if (group == null) return;

  const base = group.bases.find((b) => b.id === id);
  if (base == null) return;

  // eslint-disable-next-line consistent-return
  return { group, base };
}
