import { useStore } from "@nanostores/react";
import { HStack, styled as p, VStack } from "panda/jsx";
import { useMemo, type ReactElement } from "react";
import { match, P } from "ts-pattern";
import { SelectSeedBaseDialog } from "./SelectSeedBase";
import { SeedSummaryNoteEditable } from "@/components/seed/Summary";
import { $seedDefWizard } from "@/lib/stores/seed-def";

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

function SeedConfigReuse(): ReactElement {
  return <BaseSeedSelectorField />;
}

function SeedConfigFork(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);

  return (
    <VStack alignItems="start" w="100%">
      <BaseSeedSelectorField />
      <VStack alignItems="start" w="100%">
        <p.p>特記事項</p.p>
        <SeedSummaryNoteEditable
          entries={seedDefWizard.summary?.notes ?? []}
          setEntries={(summary) => {
            $seedDefWizard.set({
              ...seedDefWizard,
              summary: {
                ...(seedDefWizard.summary ?? {
                  permissions: [],
                  limitations: [],
                  conditions: [],
                  notes: [],
                }),
                notes: summary,
              },
            });
          }}
        />
      </VStack>
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
    .otherwise(() => <p.div />);
}
