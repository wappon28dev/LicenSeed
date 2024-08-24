import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { css } from "panda/css";
import { Divider, HStack, VStack, styled as p } from "panda/jsx";
import { vstack } from "panda/patterns/vstack";
import { token } from "panda/tokens";
import { useEffect, type ReactElement } from "react";
import { Resplit } from "react-resplit";
import { match, P } from "ts-pattern";
import { FilePatternsInput } from "./FileSelect";
import { SeedConfig } from "./SeedConfig";
import { SeedGroupSelector } from "./SeedGroupSelector";
import { SeedPreview } from "./SeedPreview";
import { SelectSeedDefType } from "./SelectSeedDefType";
import { Button } from "@/components/Button";
import { MDPreview } from "@/components/MDPreview";
import { Splitter } from "@/components/Splitter";
import { Hint } from "@/components/seed/SummaryEntry";
import {
  $seedBaseGroupCache,
  $seedCheckStatusData,
  $seedDefWizard,
} from "@/lib/stores/seed-def";
import {
  askSeedAdviceWithCustom,
  askSeedAdviceWithFork,
  summary2text,
} from "@/lib/utils/seed";
import { type SeedBaseGroup } from "@/types/bindings";
import { zSeedBaseGroup } from "@/types/bindings.schema";
import {
  type SeedCheckData,
  type SeedDefWizardWith,
  zSeedDefWizardParseWith,
} from "@/types/wizard";

const whatToCheck = {
  FORK: "特記事項の矛盾",
  CUSTOM: "サマリー同士の矛盾と代替ベースシード",
} as const satisfies Record<keyof SeedCheckData, string>;

function Caution(): ReactElement {
  return (
    <VStack gap="0">
      <Divider color="gray" />
      <p.p fontSize="sm">
        これは Gemini (生成系 AI) によるアドバイスを含みます！
        間違いを含む可能性があるので, アドバイスは常に自身で再確認してください.
      </p.p>
    </VStack>
  );
}

async function fork(
  seedDefWizard: SeedDefWizardWith<"FORK">,
  groupCache: SeedBaseGroup,
): Promise<void> {
  $seedCheckStatusData.set({
    status: "CHECKING",
  });

  await askSeedAdviceWithFork(seedDefWizard, groupCache).match(
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
        seedDataType: "FORK",
        title: "特記事項の矛盾",
        error,
      });
    },
  );
}

async function custom(
  seedDefWizard: SeedDefWizardWith<"CUSTOM">,
  groupCache: SeedBaseGroup,
): Promise<void> {
  $seedCheckStatusData.set({
    status: "CHECKING",
  });

  await askSeedAdviceWithCustom(seedDefWizard, groupCache).match(
    (data) => {
      $seedCheckStatusData.set({
        status: "DONE",
        seedDataType: "CUSTOM",
        data,
      });
    },
    (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      $seedCheckStatusData.set({
        status: "ERROR",
        seedDataType: "CUSTOM",
        title: "サマリー同士の矛盾と代替ベースシード",
        error,
      });
    },
  );
}

function SeedCheckButton(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);
  const groupCache = useStore($seedBaseGroupCache);
  const checkStatusData = useStore($seedCheckStatusData);

  function clickHandler(): void {
    match(seedDefWizard)
      .with({ data: { type: "FORK" } }, (wizard) => {
        const terms = groupCache?.manifest.terms;
        if (terms == null) {
          $seedCheckStatusData.set({
            status: "ERROR",
            seedDataType: "FORK",
            error: new Error("terms is null"),
          });
          return;
        }

        if (wizard.summary == null) {
          $seedCheckStatusData.set({
            status: "ERROR",
            seedDataType: "FORK",
            error: new Error("summary is null"),
          });
          return;
        }

        const text = summary2text(wizard.summary, terms);

        $seedDefWizard.set({
          ...seedDefWizard,
          data: {
            ...wizard.data,
            notes: text,
          },
        });

        zSeedDefWizardParseWith<"FORK">($seedDefWizard.get()).match(
          (d) => {
            void fork(d, zSeedBaseGroup.parse(groupCache));
          },
          (e) => {
            $seedCheckStatusData.set({
              status: "ERROR",
              seedDataType: "FORK",
              error: e,
            });
          },
        );
      })
      .with({ data: { type: "CUSTOM" } }, (wizard) => {
        zSeedDefWizardParseWith<"CUSTOM">(wizard).match(
          (d) => {
            void custom(d, zSeedBaseGroup.parse(groupCache));
          },
          (e) => {
            $seedCheckStatusData.set({
              status: "ERROR",
              seedDataType: "CUSTOM",
              error: e,
            });
          },
        );
      })
      .otherwise(() => {
        throw new Error(`Not implemented`);
      });
  }

  return (
    <p.button disabled={checkStatusData == null}>
      {match(checkStatusData)
        .with(P.nullish, () => (
          <HStack cursor="not-allowed" opacity="0.3" px="3" py="2" rounded="md">
            <Icon icon="logos:google-bard-icon" />
            <p.p>Gemini でシードのチェック</p.p>
          </HStack>
        ))
        .with({ status: "ERROR" }, ({ error, seedDataType }) => (
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
                  {seedDataType != null
                    ? `${whatToCheck[seedDataType]}チェック中に`
                    : "予期せぬ"}
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
        .with({ status: "READY" }, ({ seedDataType }) => (
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
            <p.p>Gemini で{whatToCheck[seedDataType]}チェック</p.p>
          </HStack>
        ))
        .with({ status: "CHECKING" }, () => (
          <HStack cursor="progress">
            <Icon icon="svg-spinners:ring-resize" />
            <p.p>Gemini と通信中...</p.p>
          </HStack>
        ))
        .with(
          { status: "DONE", seedDataType: "FORK" },
          ({ data, seedDataType }) => (
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
                    {whatToCheck[seedDataType]}チェック:{" "}
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
                    <MDPreview source={data.advice} />
                    <Caution />
                  </Hint>
                </HoverCard.Content>
              </HoverCard.Portal>
            </HoverCard.Root>
          ),
        )
        .with(
          { status: "DONE", seedDataType: "CUSTOM" },
          ({ data, seedDataType }) => (
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
                    {whatToCheck[seedDataType]}チェック:{" "}
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
                    w: "100%",
                  })}
                  side="top"
                  sideOffset={3}
                >
                  <Hint>
                    <MDPreview source={data.advice} />
                    {data.recommendedBaseSeedIds.length > 0 && (
                      <VStack justifyContent="start" pb="2" w="100%">
                        <Divider color="gray" />
                        <HStack w="100%">
                          <p.p color="blue.500" fontWeight="bold">
                            代替ベースシード
                          </p.p>
                          {data.recommendedBaseSeedIds.map((id) => (
                            <p.code key={id}>{id}</p.code>
                          ))}
                        </HStack>
                      </VStack>
                    )}
                    <Caution />
                  </Hint>
                </HoverCard.Content>
              </HoverCard.Portal>
            </HoverCard.Root>
          ),
        )
        .exhaustive()}
    </p.button>
  );
}

export function SeedDefWizard(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);

  useEffect(() => {
    $seedDefWizard.set({});
  }, []);

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
            <HStack justifyContent="space-between" w="100%">
              <VStack alignItems="start" flex="1" w="100%">
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
                  value={seedDefWizard.title ?? ""}
                  w="100%"
                />
              </VStack>
              <VStack alignItems="start">
                <p.p>付与ユーザー名</p.p>
                <p.input
                  border="1px solid"
                  onChange={(e) => {
                    $seedDefWizard.set({
                      ...seedDefWizard,
                      sower: {
                        name: e.target.value,
                      },
                    });
                  }}
                  p="1"
                  rounded="md"
                  type="text"
                  value={seedDefWizard.sower?.name ?? ""}
                  w="100%"
                />
              </VStack>
            </HStack>
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
        <SeedCheckButton />
        <Button icon="mdi:plus">
          <p.p>追加</p.p>
        </Button>
      </HStack>
    </VStack>
  );
}
