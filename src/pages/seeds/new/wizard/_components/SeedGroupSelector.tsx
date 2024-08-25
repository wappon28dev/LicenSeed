import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useStore } from "@nanostores/react";
import { css } from "panda/css";
import { HStack, styled as p, VStack } from "panda/jsx";
import { useState, type ReactElement } from "react";
import useSWRImmutable from "swr/immutable";
import { match } from "ts-pattern";
import { ErrorScreen } from "@/components/ErrorScreen";
import { S } from "@/lib/consts";
import { $seedBaseGroupCache, $seedDefWizard } from "@/lib/stores/seed-def";
import { fetchGroups } from "@/lib/utils/seed-base";
import { type SeedBaseGroup } from "@/types/bindings";

function Loaded({
  seedBaseGroups,
}: {
  seedBaseGroups: SeedBaseGroup[];
}): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);

  const selectedGroup = seedDefWizard.group;
  function setSelectedGroup(group: typeof selectedGroup): void {
    $seedDefWizard.set({
      ...seedDefWizard,
      group,
    });
    $seedBaseGroupCache.set(
      seedBaseGroups.find((g) => g.manifest.group === group),
    );
  }

  const [query, setQuery] = useState("");
  const filteredGroups =
    query === ""
      ? seedBaseGroups
      : seedBaseGroups.filter(
          ({ manifest: { name, description, group } }) =>
            name.includes(query) ||
            description.includes(query) ||
            group.includes(query),
        );

  return (
    <VStack alignItems="start" w="100%">
      <Combobox
        immediate
        onChange={(group) => {
          setSelectedGroup(group ?? undefined);
        }}
        onClose={() => {
          setQuery("");
        }}
        value={selectedGroup}
      >
        <ComboboxInput
          aria-label="Assignee"
          className={css({
            w: "100%",
            border: "1px solid",
            rounded: "md",
            p: "1",
          })}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          value={selectedGroup}
        />
        <ComboboxOptions
          anchor="bottom start"
          className={css({
            border: "1px solid",
            rounded: "md",
            position: "absolute",
            left: "0",
            bg: "white",
            p: "2",
            textAlign: "left",
          })}
        >
          {filteredGroups.map(
            ({ manifest: { name, description, group } }, idx) => (
              <ComboboxOption
                key={group}
                className={css({
                  w: "100%",
                  px: "3",
                  _hover: {
                    bg: "gray.100",
                  },
                  cursor: "pointer",
                })}
                value={group}
              >
                <p.p
                  overflow="hidden"
                  textOverflow="ellipsis"
                  w="50vw"
                  whiteSpace="nowrap"
                >
                  <p.code color="gray">{idx + 1}. </p.code>
                  {name} <p.span color="gray"> — </p.span>
                  <p.code>{group}</p.code>
                  <p.span color="gray"> — {description}</p.span>
                </p.p>
              </ComboboxOption>
            ),
          )}
        </ComboboxOptions>
      </Combobox>
    </VStack>
  );
}

export function SeedGroupSelector(): ReactElement {
  const swrGroups = useSWRImmutable("groups", fetchGroups);

  return match(swrGroups)
    .with(S.Loading, () => (
      <p.div display="grid" h="100%" placeItems="center" w="100%">
        <HStack>
          <Icon icon="svg-spinners:ring-resize" />
          ベースシードを読み込み中...
        </HStack>
      </p.div>
    ))
    .with(S.Success, ({ data }) => <Loaded seedBaseGroups={data} />)
    .otherwise(({ error }) => (
      <ErrorScreen error={error} title="ベースシードの読み込み" />
    ));
}
