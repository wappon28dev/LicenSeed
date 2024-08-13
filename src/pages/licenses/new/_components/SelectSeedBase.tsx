import { Icon } from "@iconify/react";
import { css } from "panda/css";
import { styled as p, VStack } from "panda/jsx";
import { vstack } from "panda/patterns/vstack";
import { useEffect, useState, type ReactElement } from "react";
import { Resplit } from "react-resplit";
import useSWRImmutable from "swr/immutable";
import { match, P } from "ts-pattern";
import { ErrorScreen } from "@/components/ErrorScreen";
import { PickerCard } from "@/components/PickerCard";
import { Splitter } from "@/components/Splitter";
import { SeedSummary } from "@/components/seed/Summary";
import { S, T } from "@/lib/consts";
import { api } from "@/lib/services/api";
import {
  type SeedBaseGroupManifest,
  type SeedBase,
  type SeedBaseGroup,
} from "@/types/bindings";
import { type Nullable } from "@/types/utils";

function DisplaySummary({
  groupManifest,
  seedBase,
}: {
  groupManifest: SeedBaseGroupManifest;
  seedBase: Nullable<SeedBase>;
}): ReactElement {
  return match(seedBase)
    .with(P.nullish, () => <p.div />)
    .otherwise((base) => (
      <VStack
        alignItems="start"
        h="99%"
        justifyContent="space-between"
        w="100%"
      >
        <VStack w="100%">
          <p.h2
            bg="white"
            fontSize="2xl"
            fontWeight="bold"
            p="1"
            position="sticky"
            top="0"
            w="100%"
          >
            {base.name}
          </p.h2>
          <p.div w="100%">
            <SeedSummary groupManifest={groupManifest} summary={base.summary} />
          </p.div>
        </VStack>
        <p.div w="100%">
          <p.p color="gray" fontSize="md">
            {base.description}
          </p.p>
        </p.div>
      </VStack>
    ));
}

function SeedBaseSelector({
  group,
  selectedBase,
  onClick,
  onMouseEnter,
}: {
  onClick: (currentBase: SeedBase) => void;
  onMouseEnter: (currentBase: SeedBase) => void;
  group: Nullable<SeedBaseGroup>;
  selectedBase: Nullable<SeedBase>;
}): ReactElement {
  return match(group)
    .with(P.nullish, () => (
      <p.div display="grid" h="100%" placeItems="center" w="100%">
        <VStack>
          <Icon height="1.5rem" icon="mdi:arrow-top-left-thick" />
          <p.p>まずは選択してみましょう！</p.p>
        </VStack>
      </p.div>
    ))
    .otherwise(({ manifest, bases }) => (
      <VStack alignItems="start">
        <p.div bg="white" p="1" position="sticky" top="0" w="100%">
          <p.h2 fontSize="2xl" fontWeight="bold">
            {manifest.name}
          </p.h2>
          <p.p color="gray" fontSize="md">
            {manifest.description}
          </p.p>
        </p.div>
        <VStack gap="0">
          {bases.map((base) => (
            <PickerCard
              key={base.id}
              isSelected={selectedBase === base}
              onClick={() => {
                onClick(base);
              }}
              onMouseEnter={() => {
                onMouseEnter(base);
              }}
              tail={<Icon icon="mdi:chevron-right" />}
            >
              <p.p>{base.name}</p.p>
            </PickerCard>
          ))}
        </VStack>
      </VStack>
    ));
}

function SeedBaseGroupSelector({
  groups,
}: {
  groups: SeedBaseGroup[];
}): ReactElement {
  const [selectedGroup, setSelectedGroup] = useState<SeedBaseGroup>();
  const [selectedBase, setSelectedBase] = useState<SeedBase>();
  const [hoveredBase, setHoveredBase] = useState<SeedBase>();

  const displayBase = hoveredBase ?? selectedBase;

  useEffect(() => {
    setSelectedBase(undefined);
    setHoveredBase(undefined);
  }, [selectedGroup]);

  return (
    <Resplit.Root
      className={css({ w: "100%", h: "100%" })}
      direction="horizontal"
    >
      <Resplit.Pane
        className={vstack({ w: "100%", h: "100%" })}
        initialSize="1fr"
        order={0}
      >
        {groups.map((group) => (
          <PickerCard
            key={group.manifest.group}
            isSelected={selectedGroup === group}
            onClick={() => {
              if (selectedGroup === group) {
                setSelectedGroup(undefined);
              } else {
                setSelectedGroup(group);
              }
            }}
            tail={<Icon icon="mdi:chevron-right" />}
          >
            <p.p>{group.manifest.name}</p.p>
          </PickerCard>
        ))}
      </Resplit.Pane>
      <Splitter />
      <Resplit.Pane
        className={css({
          overflowY: "auto",
        })}
        initialSize="2fr"
        order={2}
      >
        <SeedBaseSelector
          group={selectedGroup}
          onClick={(base) => {
            setSelectedBase(selectedBase === base ? undefined : base);
          }}
          onMouseEnter={(base) => {
            setHoveredBase(base);
          }}
          selectedBase={selectedBase}
        />
      </Resplit.Pane>
      <Splitter order={3} />
      <Resplit.Pane
        className={css({
          overflowY: "auto",
        })}
        initialSize="3fr"
        order={4}
      >
        {selectedGroup != null && (
          <DisplaySummary
            groupManifest={selectedGroup?.manifest}
            seedBase={displayBase}
          />
        )}
      </Resplit.Pane>
    </Resplit.Root>
  );
}

export function SelectSeedBase(): ReactElement {
  const swrGroups = useSWRImmutable("groups", fetchGroups);

  async function fetchGroups(): Promise<SeedBaseGroup[]> {
    return match(await api.collectSeedBaseGroups())
      .with(T.Ok, ({ data }) => data)
      .with({ ...T.Error, ...{ error: { type: "NOT_FOUND" } } }, () => {
        throw new Error("SeedBaseGroup not found");
      })
      .with(
        { ...T.Error, ...{ error: { type: "READING_ERROR" } } },
        ({ error }) => {
          throw new Error(`SeedBaseGroup reading error: ${error.error}`);
        },
      )
      .exhaustive();
  }

  return match(swrGroups)
    .with(S.Loading, () => (
      <p.div display="grid" h="100%" placeItems="center" w="100%">
        <VStack>
          <Icon height="2em" icon="svg-spinners:ring-resize" />
          ベースシードを読み込み中...
        </VStack>
      </p.div>
    ))
    .with(S.Success, ({ data }) => <SeedBaseGroupSelector groups={data} />)
    .otherwise(({ error }) => (
      <ErrorScreen error={error} title="ベースシードの読み込み" />
    ));
}
