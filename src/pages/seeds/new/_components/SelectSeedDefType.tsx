import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import { Flex, HStack, styled as p, VStack } from "panda/jsx";
import { token } from "panda/tokens";
import { type ReactElement } from "react";
import { $seedDefWizard } from "@/lib/stores/seed-def";
import { getEntries } from "@/lib/utils";
import { type SeedDefWizard } from "@/types/seed-def";

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
      <Flex alignItems="center" justifyContent="space-between" w="100%">
        <HStack flex="1" w="100%">
          <Icon height="2em" icon={icon} />
          <p.p fontSize="md" fontWeight="bold">
            {title}
          </p.p>
        </HStack>
        <Icon height="1.5em" icon="mdi:arrow-right" />
      </Flex>
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
    description: "事前に定義されたシードからライセンス文を生成します.",
  },
  CROSSBREED: {
    icon: "mdi:merge",
    title: "ベースシードを交雑",
    description:
      "事前に定義されたシードを組み合わて, デュアルライセンスを生成します.",
  },
  FORK: {
    icon: "mdi:invoice-text-edit",
    title: "ベースシードをフォーク",
    description:
      "事前に定義されたシードに変更を加えて, 新しいライセンス文を生成します.",
  },
  CUSTOM: {
    icon: "mdi:creation",
    title: "カスタム",
    description:
      "自分でダイジェストとライセンス文を定義して, ライセンス文を生成します.",
  },
} as const satisfies Record<
  SeedDefWizard["type"],
  {
    icon: string;
    title: string;
    description: string;
  }
>;

export function SelectSeedDefType(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);

  return (
    <p.div
      alignItems="start"
      display="grid"
      gap="2"
      gridTemplateColumns="repeat(auto-fit, minmax(400pt, 1fr))"
      w="100%"
    >
      {getEntries(selection).map(([type, { icon, title, description }]) => {
        const isSelected = type === seedDefWizard.type;
        return (
          <SeedDefTypeCard
            key={type}
            description={description}
            icon={icon}
            isSelected={type === seedDefWizard.type}
            onClick={() => {
              $seedDefWizard.set({
                ...seedDefWizard,
                type: isSelected ? undefined : type,
              });
            }}
            title={title}
          />
        );
      })}
    </p.div>
  );
}