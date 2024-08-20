import { useStore } from "@nanostores/react";
import MDEditor from "@uiw/react-md-editor";
import { css } from "panda/css";
import { HStack, styled as p, VStack } from "panda/jsx";
import { useMemo, useState, type ReactElement } from "react";
import rehypeSanitize from "rehype-sanitize";
import { match, P } from "ts-pattern";
import { SelectSeedBaseDialog } from "./SelectSeedBase";
import { ErrorScreen } from "@/components/ErrorScreen";
import { SeedSummaryNoteEditable } from "@/components/seed/Summary";
import { $seedBaseGroupCache, $seedDefWizard } from "@/lib/stores/seed-def";
import {
  checkSeedContradictionFork,
  type SeedContradiction,
} from "@/lib/utils/seed";

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
  const groupCache = useStore($seedBaseGroupCache);
  const [seedCheckStatus, setSeedCheckStatus] = useState<
    "LOADING" | "ERROR" | SeedContradiction
  >();

  if (seedDefWizard.data?.type !== "FORK") {
    return (
      <ErrorScreen error={`Invalid seed type: ${seedDefWizard.data?.type}`} />
    );
  }

  const { data: seedData, summary } = seedDefWizard;

  return (
    <VStack alignItems="start" w="100%">
      <BaseSeedSelectorField />
      <VStack alignItems="start" w="100%">
        <p.p>特記事項</p.p>
        <SeedSummaryNoteEditable
          entries={seedDefWizard.summary?.notes ?? []}
          setEntries={(entries) => {
            $seedDefWizard.set({
              ...seedDefWizard,
              summary: {
                ...(seedDefWizard.summary ?? {
                  permissions: [],
                  limitations: [],
                  conditions: [],
                  notes: [],
                }),
                notes: entries,
              },
            });
          }}
        />
      </VStack>
      <p.div
        onClick={() => {
          if (seedData.base == null || summary == null || groupCache == null)
            return;

          const seedBase = groupCache.bases.find(
            (base) => base.id === seedData.base?.id,
          );

          if (seedBase == null) {
            setSeedCheckStatus("ERROR");
            return;
          }

          setSeedCheckStatus("LOADING");
          void checkSeedContradictionFork(seedBase, summary.notes).match(
            (contradiction) => {
              setSeedCheckStatus(contradiction);
            },
            (error) => {
              console.error(error);
              setSeedCheckStatus("ERROR");
            },
          );
        }}
      >
        {match(seedCheckStatus)
          .with(P.nullish, () => "READY")
          .with("LOADING", () => "LOADING")
          .with("ERROR", () => "ERROR")
          .otherwise((data) => (
            <>
              <p.p>矛盾しているか: {String(data.isContradiction)}</p.p>
              <p.p>アドバイス:</p.p>
              <MDEditor.Markdown
                className={css({
                  w: "100%",
                })}
                rehypePlugins={[[rehypeSanitize]]}
                source={data.advice}
              />
            </>
          ))}
      </p.div>
    </VStack>
  );
}

function SeedConfigCustom(): ReactElement {
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
    .with({ type: "CUSTOM" }, () => <SeedConfigCustom />)
    .otherwise(() => <p.div />);
}
