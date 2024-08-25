import { useStore } from "@nanostores/react";
import { styled as p, VStack } from "panda/jsx";
import { type ReactElement } from "react";
import { match } from "ts-pattern";
import { SeedBaseSelectorDialog } from "./SeedBaseSelectorDialog";
import { SeedSummaryEditable } from "@/components/seed/Summary";
import { $seedDefWizard } from "@/lib/stores/seed-def";
import { getKeys } from "@/lib/utils";
import { type Summary } from "@/types/bindings";
import {
  type SeedDefWizardPartial,
  type SeedDefWizardPartialWith,
} from "@/types/wizard";

function BaseSeedSelectorField({
  seedDefWizard,
  setSelectedId,
  setSummary,
}: {
  seedDefWizard: SeedDefWizardPartialWith<"FORK" | "REUSE">;
  setSelectedId: (id: string) => void;
  setSummary: (summary: Summary) => void;
}): ReactElement {
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
          value={seedDefWizard.data?.base?.id ?? ""}
          w="100%"
        />
        <p.div
          position="absolute"
          right="1"
          top="50%"
          transform="translateY(-50%)"
        >
          <SeedBaseSelectorDialog
            setSelectedId={setSelectedId}
            setSummary={setSummary}
          />
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

function SeedConfigReuse({
  seedDefWizard,
  setSeedDefWizard,
}: {
  seedDefWizard: SeedDefWizardPartialWith<"REUSE">;
  setSeedDefWizard: (seedDefWizard: SeedDefWizardPartialWith<"REUSE">) => void;
}): ReactElement {
  return (
    <BaseSeedSelectorField
      seedDefWizard={seedDefWizard}
      setSelectedId={(id) => {
        setSeedDefWizard({
          ...seedDefWizard,
          data: {
            ...seedDefWizard.data,
            base: { id },
          },
        });
      }}
      setSummary={(summary) => {
        setSeedDefWizard({
          ...seedDefWizard,
          summary,
        });
      }}
    />
  );
}

function SeedConfigFork({
  seedDefWizard,
  setSeedDefWizard,
}: {
  seedDefWizard: SeedDefWizardPartialWith<"FORK">;
  setSeedDefWizard: (seedDefWizard: SeedDefWizardPartialWith<"FORK">) => void;
}): ReactElement {
  return (
    <VStack alignItems="start" w="100%">
      <BaseSeedSelectorField
        seedDefWizard={seedDefWizard}
        setSelectedId={(id) => {
          setSeedDefWizard({
            ...seedDefWizard,
            data: {
              ...seedDefWizard.data,
              base: { id },
            },
          });
        }}
        setSummary={(summary) => {
          setSeedDefWizard({
            ...seedDefWizard,
            summary,
          });
        }}
      />
      <VStack
        alignItems="start"
        style={{
          userSelect: seedDefWizard.data?.base != null ? "auto" : "none",
          cursor: seedDefWizard.data?.base != null ? "auto" : "not-allowed",
          opacity: seedDefWizard.data?.base != null ? 1 : 0.4,
        }}
        w="100%"
      >
        <p.p>特記事項</p.p>
        <SeedSummaryEditable
          entries={seedDefWizard.summary?.notes ?? []}
          setEntries={(entries) => {
            setSeedDefWizard({
              ...seedDefWizard,
              summary: {
                ...(seedDefWizard.summary ?? defaultSummary),
                notes: entries,
              },
            });
          }}
          summaryKey="notes"
        />
      </VStack>
    </VStack>
  );
}

function SeedConfigCustom({
  seedDefWizard,
  setSeedDefWizard,
}: {
  seedDefWizard: SeedDefWizardPartialWith<"CUSTOM">;
  setSeedDefWizard: (seedDefWizard: SeedDefWizardPartialWith<"CUSTOM">) => void;
}): ReactElement {
  const summary = seedDefWizard.summary ?? defaultSummary;

  return (
    <VStack alignItems="start" w="100%">
      <p.p>サマリー</p.p>
      {getKeys(summary).map((type) => (
        <SeedSummaryEditable
          key={type}
          entries={seedDefWizard.summary?.[type] ?? []}
          setEntries={(newEntry) => {
            setSeedDefWizard({
              ...seedDefWizard,
              summary: {
                ...(summary ?? defaultSummary),
                [type]: newEntry,
              },
            });
          }}
          summaryKey={type}
        />
      ))}
      <p.p>ライセンス本文</p.p>
      <p.textarea
        border="1px solid"
        maxH="10lh"
        minH="5lh"
        onChange={(e) => {
          setSeedDefWizard({
            ...seedDefWizard,
            data: {
              ...seedDefWizard.data,
              body: e.target.value,
            },
          });
        }}
        p="1"
        rounded="md"
        style={{
          // @ts-expect-error: New CSS properties
          fieldSizing: "content",
        }}
        value={seedDefWizard.data?.body ?? ""}
        w="100%"
      />
    </VStack>
  );
}

export function SeedConfig(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);

  const setSeedDefWizard = (newSeedDefWizard: SeedDefWizardPartial): void => {
    $seedDefWizard.set(newSeedDefWizard);
  };

  return match(seedDefWizard)
    .with({ data: { type: "REUSE" } }, (w) => (
      <SeedConfigReuse seedDefWizard={w} setSeedDefWizard={setSeedDefWizard} />
    ))
    .with({ data: { type: "FORK" } }, (w) => (
      <SeedConfigFork seedDefWizard={w} setSeedDefWizard={setSeedDefWizard} />
    ))
    .with({ data: { type: "CUSTOM" } }, (w) => (
      <SeedConfigCustom seedDefWizard={w} setSeedDefWizard={setSeedDefWizard} />
    ))
    .otherwise(() => <p.div />);
}
