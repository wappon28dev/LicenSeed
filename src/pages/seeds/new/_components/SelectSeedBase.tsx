import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { css } from "panda/css";
import { HStack, styled as p, VStack } from "panda/jsx";
import { vstack } from "panda/patterns/vstack";
import {
  type ComponentProps,
  useEffect,
  useState,
  type ReactElement,
} from "react";
import { Resplit } from "react-resplit";
import useSWRImmutable from "swr/immutable";
import { match, P } from "ts-pattern";
import { Dialog } from "@/components/Dialog";
import { ErrorScreen } from "@/components/ErrorScreen";
import { PickerCard } from "@/components/PickerCard";
import { Splitter } from "@/components/Splitter";
import { SeedSummary } from "@/components/seed/Summary";
import { S } from "@/lib/consts";
import { $seedBaseGroupCache, $seedDefWizard } from "@/lib/stores/seed-def";
import { fetchGroups } from "@/lib/utils/seed-base";
import {
  type SeedBaseGroupManifest,
  type SeedBase,
  type SeedBaseGroup,
  type Summary,
} from "@/types/bindings";
import { type Nullable } from "@/types/utils";

export function DisplaySummary({
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
            <p.pre color="gray" fontSize="sm">
              {base.id}
            </p.pre>
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
  const [query, setQuery] = useState("");

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
      <VStack alignItems="start" w="100%">
        <p.div bg="white" p="1" position="sticky" top="0" w="100%">
          <p.h2 fontSize="2xl" fontWeight="bold">
            {manifest.name}
          </p.h2>
          <p.p color="gray" fontSize="md">
            {manifest.description}
          </p.p>
          <p.div position="relative">
            <p.input
              border="1px solid"
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              p="1"
              placeholder="検索"
              px="2"
              rounded="md"
              value={query}
              w="100%"
            />
            <p.div
              position="absolute"
              right="2"
              top="50%"
              transform="translateY(-50%)"
            >
              <Icon icon="mdi:magnify" />
            </p.div>
          </p.div>
        </p.div>
        <VStack gap="0" w="100%">
          {bases
            .filter(
              ({ id, name }) =>
                id.toLowerCase().includes(query.toLowerCase()) ||
                name.toLowerCase().includes(query.toLowerCase()),
            )
            .map((base) => (
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
  setSelectedId,
  setSummary,
}: {
  groups: SeedBaseGroup[];
  setSelectedId: (id: string) => void;
  setSummary: (summary: Summary) => void;
}): ReactElement {
  const seedBaseGroupCache = useStore($seedBaseGroupCache);

  const [selectedGroup, setSelectedGroup] =
    useState<Nullable<SeedBaseGroup>>(seedBaseGroupCache);
  const [selectedBase, setSelectedBase] = useState<SeedBase>();
  const [hoveredBase, setHoveredBase] = useState<SeedBase>();

  const displayBase = selectedBase ?? hoveredBase;

  useEffect(() => {
    setSelectedBase(undefined);
    setHoveredBase(undefined);

    if (selectedGroup == null) return;

    $seedDefWizard.set({
      ...$seedDefWizard.get(),
      group: selectedGroup.manifest.group,
    });
    $seedBaseGroupCache.set(selectedGroup);
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedBase == null) return;
    setSelectedId(selectedBase.id);
  }, [selectedBase]);

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
            setSummary(base.summary);
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

export function SelectSeedBase({
  setSelectedId,
  setSummary,
}: {
  setSelectedId: (id: string) => void;
  setSummary: (summary: Summary) => void;
}): ReactElement {
  const swrGroups = useSWRImmutable("groups", fetchGroups);

  return match(swrGroups)
    .with(S.Loading, () => (
      <p.div display="grid" h="100%" placeItems="center" w="100%">
        <VStack>
          <Icon height="2em" icon="svg-spinners:ring-resize" />
          ベースシードを読み込み中...
        </VStack>
      </p.div>
    ))
    .with(S.Success, ({ data }) => (
      <SeedBaseGroupSelector
        groups={data}
        setSelectedId={setSelectedId}
        setSummary={setSummary}
      />
    ))
    .otherwise(({ error }) => (
      <ErrorScreen error={error} title="ベースシードの読み込み" />
    ));
}

export function SelectSeedBaseDialog(
  props: ComponentProps<typeof SelectSeedBase>,
): ReactElement {
  return (
    <Dialog
      content={(setIsOpened) => (
        <VStack bg="white" h="100%" p="2" rounded="md" w="100%">
          <AlertDialog.Title>
            <p.p fontSize="xl" fontWeight="bold">
              ベースシードを選択
            </p.p>
          </AlertDialog.Title>
          <AlertDialog.Description />
          <p.div flex="1" maxH="calc(100vh - 280px)" overflow="auto" w="100%">
            <SelectSeedBase {...props} />
          </p.div>
          <p.button
            bg="blue.500"
            color="white"
            onClick={() => {
              setIsOpened(false);
            }}
            p="2"
            px="5"
            rounded="md"
          >
            <HStack>
              <Icon icon="mdi:check" />
              <p.p>確定</p.p>
            </HStack>
          </p.button>
        </VStack>
      )}
    >
      <p.button bg="blue.100" p="2" rounded="md">
        選択
      </p.button>
    </Dialog>
  );
}
