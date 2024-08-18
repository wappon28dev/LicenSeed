import {
  type Terms,
  type SeedBase,
  type SeedBaseGroup,
  type TermEntry,
} from "@/types/bindings";
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

export function searchTermEntryFromKey(
  key: string,
  entryKey: keyof Terms,
  terms: Terms,
): Nullable<TermEntry> {
  const termText = terms[entryKey]?.[key];

  if (termText == null) {
    return undefined;
  }

  return termText;
}
