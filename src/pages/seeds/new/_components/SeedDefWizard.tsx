import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { HStack, VStack, styled as p } from "panda/jsx";
import { useEffect, type ReactElement } from "react";
import { FilePatternsInput } from "./FileSelect";
import { SelectSeedBase } from "./SelectSeedBase";
import { SelectSeedDefType } from "./SelectSeedDefType";
import { Dialog } from "@/components/Dialog";
import { $seedDefWizard } from "@/lib/stores/seed-def";

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
      <VStack alignItems="start" w="100%">
        <p.p>シード名を入力</p.p>
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

      <SelectSeedDefType />
      <FilePatternsInput
        patterns={seedDefWizard.territory ?? []}
        setPatterns={(newPattern) => {
          $seedDefWizard.set({
            ...seedDefWizard,
            territory: newPattern,
          });
        }}
      />
      <VStack alignItems="start" h="100%" p="2" w="100%">
        <p.p>ベースシード</p.p>
        <HStack h="100%" w="100%">
          <Dialog
            content={(setIsOpened) => (
              <VStack bg="white" h="100%" p="2" rounded="md" w="100%">
                <AlertDialog.Title>
                  <p.p fontSize="xl" fontWeight="bold">
                    ベースシードを選択
                  </p.p>
                </AlertDialog.Title>
                <AlertDialog.Description />
                <p.div
                  flex="1"
                  maxH="calc(100vh - 280px)"
                  overflow="auto"
                  w="100%"
                >
                  <SelectSeedBase
                    setSelectedId={(id) => {
                      if (
                        !(
                          seedDefWizard.data?.type === "REUSE" ||
                          seedDefWizard.data?.type === "FORK"
                        )
                      ) {
                        return;
                      }

                      $seedDefWizard.set({
                        ...seedDefWizard,
                        data: {
                          id,
                        },
                      });
                    }}
                  />
                </p.div>
                <p.button
                  bg="blue.500"
                  color="white"
                  onClick={() => {
                    setIsOpened(false);
                  }}
                  p="2"
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
            <p.button bg="blue.500" color="white" p="2" rounded="md">
              ベースシードを選択
            </p.button>
          </Dialog>
        </HStack>
      </VStack>
    </VStack>
  );
}
