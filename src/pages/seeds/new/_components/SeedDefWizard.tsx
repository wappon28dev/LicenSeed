import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import * as HoverCard from "@radix-ui/react-hover-card";
import MDEditor from "@uiw/react-md-editor";
import { css } from "panda/css";
import { Divider, HStack, VStack, styled as p } from "panda/jsx";
import { vstack } from "panda/patterns/vstack";
import { token } from "panda/tokens";
import { useEffect, type ReactElement } from "react";
import { Resplit } from "react-resplit";
import rehypeSanitize from "rehype-sanitize";
import { match, P } from "ts-pattern";
import { FilePatternsInput } from "./FileSelect";
import { SeedConfig } from "./SeedConfig";
import { SeedGroupSelector } from "./SeedGroupSelector";
import { SeedPreview } from "./SeedPreview";
import { SelectSeedDefType } from "./SelectSeedDefType";
import { Button } from "@/components/Button";
import { Splitter } from "@/components/Splitter";
import { Hint } from "@/components/seed/SummaryEntry";
import {
  $seedBaseGroupCache,
  $seedCheckStatusData,
  $seedDefWizard,
} from "@/lib/stores/seed-def";
import { checkSeedContradictionFork } from "@/lib/utils/seed";
import {
  type SeedBaseGroup,
  type SeedData,
  type Summary,
} from "@/types/bindings";

type PartialData<T extends SeedData["type"]> = Partial<
  Extract<SeedData, { type: T }>
>;

const whatToCheck = {
  FORK: "特記事項の矛盾",
} as const;

async function fork(
  seedData: PartialData<"FORK">,
  summary: Summary,
  groupCache: SeedBaseGroup,
): Promise<void> {
  if (seedData.base == null || summary == null || groupCache == null) {
    $seedCheckStatusData.set({
      status: "ERROR",
      error: "`seedData`, `summary` or `groupCache` is null",
    });

    return;
  }

  const seedBase = groupCache.bases.find(
    (base) => base.id === seedData.base?.id,
  );

  if (seedBase == null) {
    $seedCheckStatusData.set({
      status: "ERROR",
      error: "`seedBase` is null",
    });
    return;
  }

  $seedCheckStatusData.set({
    status: "CHECKING",
  });
  await checkSeedContradictionFork(seedBase, summary.notes).match(
    (data) => {
      $seedCheckStatusData.set({
        status: "DONE",
        seedDataType: "FORK",
        data,
      });
    },
    (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      $seedCheckStatusData.set({
        status: "ERROR",
        title: "特記事項の矛盾",
        error,
      });
    },
  );
}

export function SeedDefWizard(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);
  const groupCache = useStore($seedBaseGroupCache);
  const checkStatusData = useStore($seedCheckStatusData);

  useEffect(() => {
    $seedDefWizard.set({});
  }, []);

  function clickHandler(): void {
    const { data: seedData, summary } = seedDefWizard;
    if (seedData == null || summary == null || groupCache == null) {
      $seedCheckStatusData.set({
        status: "ERROR",
        seedDataType: seedData?.type,
        error: "`seedData`, `summary` or `groupCache` is null",
      });
      return;
    }

    match(seedData)
      .with({ type: "FORK" }, (data) => {
        if (data == null) {
          $seedCheckStatusData.set({
            status: "ERROR",
            seedDataType: "FORK",
            error: "`data` is null",
          });
          return;
        }
        void fork(data, summary, groupCache);
      })
      .otherwise(() => {
        throw new Error(`Not implemented: ${seedData.type}`);
      });
  }

  return (
    <VStack alignItems="start" gap="3" h="100%" p="3" w="100%">
      <p.p fontSize="2xl" fontWeight="bold">
        新しいシードを定義
      </p.p>
      <Divider />
      <Resplit.Root
        className={css({ w: "100%", h: "100%", flex: 1 })}
        direction="horizontal"
      >
        <Resplit.Pane
          className={vstack({ w: "100%", h: "100%", overflowY: "auto" })}
          initialSize="1fr"
          order={0}
        >
          <VStack alignItems="start" gap="3" h="100%" w="100%">
            <VStack alignItems="start" w="100%">
              <p.p>シード名</p.p>
              <p.input
                border="1px solid"
                onChange={(e) => {
                  $seedDefWizard.set({
                    ...seedDefWizard,
                    title: e.target.value,
                  });
                }}
                p="1"
                rounded="md"
                type="text"
                w="100%"
              />
            </VStack>
            <VStack alignItems="start" w="100%">
              <p.p>シードのグループを選択</p.p>
              <SeedGroupSelector />
            </VStack>
            <VStack
              alignItems="start"
              style={{
                opacity: seedDefWizard.group == null ? 0.4 : 1,
                userSelect: seedDefWizard.group == null ? "none" : undefined,
                cursor: seedDefWizard.group == null ? "not-allowed" : undefined,
              }}
              w="100%"
            >
              <p.p>シードの種類を選択</p.p>
              <SelectSeedDefType />
            </VStack>
            <FilePatternsInput
              patterns={seedDefWizard.territory ?? []}
              setPatterns={(newPattern) => {
                $seedDefWizard.set({
                  ...seedDefWizard,
                  territory: newPattern,
                });
              }}
            />
            <SeedConfig />
          </VStack>
        </Resplit.Pane>
        <Splitter
          style={{
            borderLeft: "1.5px dashed",
          }}
        />
        <Resplit.Pane
          className={vstack({
            h: "100%",
            w: "100%",
            alignItems: "start",
            overflowY: "auto",
          })}
          order={2}
        >
          <p.p bg="white" position="sticky" top="0">
            プレビュー
          </p.p>
          <SeedPreview />
        </Resplit.Pane>
      </Resplit.Root>
      <Divider />
      <HStack justifyContent="space-between" w="100%">
        <Button icon="mdi:cancel" type="outline">
          <p.p>キャンセル</p.p>
        </Button>
        <p.button disabled={checkStatusData == null}>
          {match(checkStatusData)
            .with(P.nullish, () => (
              <HStack
                cursor="not-allowed"
                opacity="0.3"
                px="3"
                py="2"
                rounded="md"
              >
                <Icon icon="logos:google-bard-icon" />
                <p.p>Gemini でシードのチェック</p.p>
              </HStack>
            ))
            .with({ status: "ERROR" }, ({ title, error }) => (
              <HoverCard.Root closeDelay={0} openDelay={0}>
                <HoverCard.Trigger asChild>
                  <HStack
                    bgColor="red.50"
                    color="red.500"
                    px="3"
                    py="2"
                    rounded="md"
                  >
                    <Icon icon="mdi:robot-dead" />
                    <p.p>
                      {title != null ? `${title}中に` : "予期せぬ"}
                      エラーが発生しました
                    </p.p>
                  </HStack>
                </HoverCard.Trigger>
                <HoverCard.Portal>
                  <HoverCard.Content
                    className={css({
                      zIndex: "modalContent",
                    })}
                    side="top"
                    sideOffset={3}
                  >
                    <Hint>
                      <p.code>{String(error)}</p.code>
                    </Hint>
                  </HoverCard.Content>
                </HoverCard.Portal>
              </HoverCard.Root>
            ))
            .with({ status: "READY", seedDataType: "FORK" }, () => (
              <HStack
                _hover={{
                  bg: "gray.100",
                }}
                cursor="pointer"
                onClick={() => {
                  clickHandler();
                }}
                px="3"
                py="2"
                rounded="md"
              >
                <Icon icon="logos:google-bard-icon" />
                <p.p>Gemini で{whatToCheck.FORK}チェック</p.p>
              </HStack>
            ))
            .with({ status: "DONE", seedDataType: "FORK" }, ({ data }) => (
              <HoverCard.Root closeDelay={0} openDelay={0}>
                <HoverCard.Trigger asChild>
                  <HStack
                    px="3"
                    py="2"
                    rounded="md"
                    style={{
                      color: token(
                        `colors.${data.isContradiction ? "red" : "green"}.600`,
                      ),
                      fontWeight: data.isContradiction ? "bold" : undefined,
                      background: data.isContradiction
                        ? token("colors.red.50")
                        : undefined,
                    }}
                  >
                    <Icon
                      icon={data.isContradiction ? "mdi:close" : "mdi:check"}
                    />
                    <p.p>
                      {whatToCheck.FORK}チェック:{" "}
                      {data.isContradiction ? "NG" : "OK"}
                    </p.p>
                    <p.button onClick={clickHandler}>
                      <Icon icon="mdi:refresh" />
                    </p.button>
                  </HStack>
                </HoverCard.Trigger>
                <HoverCard.Portal>
                  <HoverCard.Content
                    className={css({
                      zIndex: "modalContent",
                    })}
                    side="top"
                    sideOffset={3}
                  >
                    <Hint>
                      <MDEditor.Markdown
                        className={css({
                          w: "100%",
                        })}
                        rehypePlugins={[[rehypeSanitize]]}
                        source={data.advice}
                      />
                    </Hint>
                  </HoverCard.Content>
                </HoverCard.Portal>
              </HoverCard.Root>
            ))
            .with({ status: "CHECKING" }, () => (
              <HStack cursor="progress">
                <Icon icon="svg-spinners:ring-resize" />
                <p.p>Gemini と通信中...</p.p>
              </HStack>
            ))
            .otherwise(() => {
              throw new Error(`Not implemented: ${checkStatusData?.status}`);
            })}
        </p.button>
        <Button icon="mdi:plus">
          <p.p>追加</p.p>
        </Button>
      </HStack>
    </VStack>
  );
}
