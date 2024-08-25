import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import { HStack, styled as p, VStack } from "panda/jsx";
import { token } from "panda/tokens";
import { useEffect, type ReactElement } from "react";
import { $seedCheckStatusData, $seedDefWizard } from "@/lib/stores/seed-def";
import { getEntries } from "@/lib/utils";
import { type SeedDef } from "@/types/bindings";

function SeedDefTypeCard({
  icon,
  title,
  description,
  onClick,
  isSelected,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  isSelected: boolean;
}): ReactElement {
  return (
    <VStack
      alignItems="start"
      bg={{ base: "blue.100", _hover: "blue.200" }}
      cursor="pointer"
      onClick={onClick}
      p="3"
      rounded="lg"
      style={{
        background: isSelected ? token("colors.blue.500") : undefined,
        color: isSelected ? "white" : undefined,
      }}
      w="100%"
    >
      <HStack flex="1" w="100%">
        <Icon height="2em" icon={icon} />
        <p.p fontSize="md" fontWeight="bold">
          {title}
        </p.p>
      </HStack>
      <HStack bg="white" color="black" p="2" rounded="md" w="100%">
        <Icon icon="mdi:information-outline" />
        <p.p fontSize="xs">{description}</p.p>
      </HStack>
    </VStack>
  );
}

const selection = {
  REUSE: {
    icon: "mdi:sync",
    title: "ベースシードを再利用",
    description: "事前に定義されたシードからライセンス文を生成します",
  },
  FORK: {
    icon: "mdi:invoice-text-edit",
    title: "ベースシードをフォーク",
    description:
      "事前に定義されたシードに特記事項を加えて, 新しいライセンス文を生成します",
  },
  CUSTOM: {
    icon: "mdi:creation",
    title: "カスタム",
    description:
      "自分でダイジェストとライセンス文を定義して, ライセンス文を生成します",
  },
} as const satisfies Record<
  SeedDef["data"]["type"],
  {
    icon: string;
    title: string;
    description: string;
  }
>;

export function SeedDefTypeSelector(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);

  useEffect(() => {
    $seedDefWizard.set({
      ...seedDefWizard,
      summary: undefined,
    });
    $seedCheckStatusData.set(undefined);
  }, [seedDefWizard.data?.type]);

  return (
    <p.div
      alignItems="start"
      display="grid"
      gap="2"
      gridTemplateColumns="repeat(auto-fit, minmax(400pt, 1fr))"
      w="100%"
    >
      {getEntries(selection).map(([type, { icon, title, description }]) => {
        const isSelected = seedDefWizard.data?.type === type;

        return (
          <SeedDefTypeCard
            key={type}
            description={description}
            icon={icon}
            isSelected={isSelected}
            onClick={() => {
              $seedDefWizard.set({
                ...seedDefWizard,
                data: isSelected ? undefined : { type },
                summary: undefined,
              });
              $seedCheckStatusData.set(undefined);
            }}
            title={title}
          />
        );
      })}
    </p.div>
  );
}
