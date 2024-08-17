import { useStore } from "@nanostores/react";
import { css } from "panda/css";
import { Divider, HStack, VStack, styled as p } from "panda/jsx";
import { vstack } from "panda/patterns/vstack";
import { useEffect, type ReactElement } from "react";
import { Resplit } from "react-resplit";
import { match, P } from "ts-pattern";
import { FilePatternsInput } from "./FileSelect";
import { SeedPreview } from "./SeedPreview";
import { SelectSeedBaseDialog } from "./SelectSeedBase";
import { SelectSeedDefType } from "./SelectSeedDefType";
import { Button } from "@/components/Button";
import { Splitter } from "@/components/Splitter";
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
            {match(seedDefWizard.data)
              .with({ type: P.union("FORK", "REUSE") }, ({ base }) => (
                <VStack alignItems="start" h="100%" w="100%">
                  <p.p>ベースシード</p.p>
                  <p.div position="relative" w="100%">
                    <p.input
                      border="1px solid"
                      disabled
                      fontFamily="udev"
                      p="3"
                      rounded="md"
                      type="text"
                      value={base?.id ?? ""}
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
              .otherwise(() => (
                <p.div />
              ))}
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
        <Button icon="mdi:plus">
          <p.p>追加</p.p>
        </Button>
      </HStack>
    </VStack>
  );
}
