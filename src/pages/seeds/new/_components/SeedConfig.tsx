import { useStore } from "@nanostores/react";
import { HStack, styled as p, VStack } from "panda/jsx";
import { useEffect, useMemo, type ReactElement } from "react";
import { match, P } from "ts-pattern";
import { SelectSeedBaseDialog } from "./SelectSeedBase";
import { ErrorScreen } from "@/components/ErrorScreen";

import { SeedSummaryEditable } from "@/components/seed/Summary";
import { $seedCheckStatusData, $seedDefWizard } from "@/lib/stores/seed-def";
import { getKeys } from "@/lib/utils";

function BaseSeedSelector(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);
  return (
    <HStack alignItems="start">
      <SelectSeedBaseDialog
        setSelectedId={(id) => {
          match(seedDefWizard.data)
            .with({ type: P.union("FORK", "REUSE") }, (data) => {
              $seedDefWizard.set({
                ...seedDefWizard,
                data: {
                  ...data,
                  base: { id },
                },
              });
            })
            .with({ type: "CROSSBREED" }, (data) => {
              $seedDefWizard.set({
                ...seedDefWizard,
                data: {
                  ...data,
                  bases: [...(data.bases ?? []), { id }],
                },
              });
            });
        }}
        setSummary={(summary) => {
          $seedDefWizard.set({
            ...seedDefWizard,
            summary,
          });
        }}
      />
    </HStack>
  );
}

function BaseSeedSelectorField(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);
  const baseId = useMemo(
    () =>
      match(seedDefWizard.data)
        .with({ type: "CROSSBREED" }, ({ bases }) => bases?.join(", ") ?? "")
        .with({ type: P.union("FORK", "REUSE") }, ({ base }) => base?.id ?? "")
        .otherwise(() => ""),
    [seedDefWizard.data],
  );

  return (
    <VStack alignItems="start" w="100%">
      <p.p>ベースシード</p.p>
      <p.div position="relative" w="100%">
        <p.input
          border="1px solid"
          disabled
          fontFamily="udev"
          p="3"
          rounded="md"
          type="text"
          value={baseId}
          w="100%"
        />
        <p.div
          position="absolute"
          right="1"
          top="50%"
          transform="translateY(-50%)"
        >
          <BaseSeedSelector />
        </p.div>
      </p.div>
    </VStack>
  );
}

const defaultSummary = {
  permissions: [],
  limitations: [],
  conditions: [],
  notes: [],
};

function SeedConfigReuse(): ReactElement {
  return <BaseSeedSelectorField />;
}

function SeedConfigFork(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);

  if (seedDefWizard.data?.type !== "FORK") {
    return (
      <ErrorScreen error={`Invalid seed type: ${seedDefWizard.data?.type}`} />
    );
  }

  useEffect(() => {
    const enableChecking =
      seedDefWizard.data != null &&
      (seedDefWizard.summary?.notes?.length ?? 0) > 0;

    $seedCheckStatusData.set(
      enableChecking
        ? {
            status: "READY",
            seedDataType: "FORK",
          }
        : undefined,
    );
  }, [seedDefWizard.data, seedDefWizard.summary?.notes]);

  return (
    <VStack alignItems="start" w="100%">
      <BaseSeedSelectorField />
      <VStack
        alignItems="start"
        style={{
          userSelect: seedDefWizard.data.base != null ? "auto" : "none",
          cursor: seedDefWizard.data.base != null ? "auto" : "not-allowed",
          opacity: seedDefWizard.data.base != null ? 1 : 0.4,
        }}
        w="100%"
      >
        <p.p>特記事項</p.p>
        <SeedSummaryEditable
          entries={seedDefWizard.summary?.notes ?? []}
          setEntries={(entries) => {
            $seedDefWizard.set({
              ...seedDefWizard,
              summary: {
                ...(seedDefWizard.summary ?? defaultSummary),
                notes: entries,
              },
            });
          }}
          type="notes"
        />
      </VStack>
    </VStack>
  );
}

function SeedConfigCustom(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);

  const summary = seedDefWizard.summary ?? defaultSummary;

  return (
    <VStack alignItems="start" w="100%">
      <p.p>サマリー</p.p>
      {getKeys(summary).map((type) => (
        <SeedSummaryEditable
          key={type}
          entries={seedDefWizard.summary?.[type] ?? []}
          setEntries={(newEntry) => {
            $seedDefWizard.set({
              ...seedDefWizard,
              summary: {
                ...(summary ?? defaultSummary),
                [type]: newEntry,
              },
            });
          }}
          type={type}
        />
      ))}
    </VStack>
  );
}

export function SeedConfig(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);

  return match(seedDefWizard.data)
    .with({ type: "REUSE" }, () => <SeedConfigReuse />)
    .with({ type: "FORK" }, () => <SeedConfigFork />)
    .with({ type: "CROSSBREED" }, ({ bases }) => (
      <VStack alignItems="start" h="100%" w="100%">
        <p.p>ベースシード (複数)</p.p>
        <p.div position="relative" w="100%">
          <p.input
            border="1px solid"
            disabled
            fontFamily="udev"
            p="3"
            rounded="md"
            type="text"
            w="100%"
          />
          <p.div
            position="absolute"
            right="1"
            top="50%"
            transform="translateY(-50%)"
          >
            <BaseSeedSelector />
          </p.div>
        </p.div>
      </VStack>
    ))
    .with({ type: "CUSTOM" }, () => <SeedConfigCustom />)
    .otherwise(() => <p.div />);
}
