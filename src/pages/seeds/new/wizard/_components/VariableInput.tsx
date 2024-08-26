import { styled as p, VStack, HStack } from "panda/jsx";
import { type ReactElement } from "react";
import { type SeedBase } from "@/types/bindings";
import { type SeedDefWizardPartialWith } from "@/types/wizard";

export function VariableInput<T extends "REUSE" | "FORK">({
  seedDefWizard,
  setSeedDefWizard,
  seedBase,
}: {
  seedDefWizard: SeedDefWizardPartialWith<T>;
  setSeedDefWizard: (seedDefWizard: SeedDefWizardPartialWith<T>) => void;
  seedBase: SeedBase;
}): ReactElement {
  if (seedBase.variables.length === 0) {
    return <p.div />;
  }

  return (
    <VStack alignItems="start" w="100%">
      <p.p>ライセンス文中の変数</p.p>
      {seedBase.variables.map((v, idx) => (
        <VStack key={v.key} gap="0" justifyContent="space-between" w="100%">
          <HStack alignItems="start" w="100%">
            <p.code color="gray" fontSize="sm">
              {idx + 1}. {v.key}
            </p.code>
            {v.description.length > 0 && <p.span>—— {v.description}</p.span>}
          </HStack>
          <p.input
            border="1px solid"
            onChange={(e) => {
              // @ts-expect-error: なぜか型が合わない
              const prev = seedDefWizard.data?.variables?.filter(
                // @ts-expect-error: なぜか型が合わない
                ({ key }) => key !== v.key,
              );
              setSeedDefWizard({
                ...seedDefWizard,
                // @ts-expect-error: なぜか型が合わない
                data: {
                  ...seedDefWizard.data,
                  variables: [
                    ...(prev ?? []),
                    { key: v.key, value: e.target.value },
                  ],
                },
              });
            }}
            p="1"
            rounded="md"
            value={
              // @ts-expect-error: なぜか型が合わない
              seedDefWizard.data?.variables?.find(({ key }) => key === v.key)
                ?.value
            }
            w="100%"
          />
        </VStack>
      ))}
    </VStack>
  );
}
