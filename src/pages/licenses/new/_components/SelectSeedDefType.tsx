import { Icon } from "@iconify/react/dist/iconify.js";
import { Flex, HStack, styled as p, VStack } from "panda/jsx";
import { type ReactElement } from "react";

function SeedDefTypeCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}): ReactElement {
  return (
    <VStack
      alignItems="start"
      bg={{ base: "blue.100", _hover: "blue.200" }}
      cursor="pointer"
      p="3"
      rounded="lg"
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
      <HStack bg="white" p="2" rounded="md" w="100%">
        <Icon icon="mdi:information-outline" />
        <p.p fontSize="xs">{description}</p.p>
      </HStack>
    </VStack>
  );
}

export function SelectSeedDefType(): ReactElement {
  return (
    <p.div
      alignItems="start"
      display="grid"
      gap="2"
      gridTemplateColumns="repeat(auto-fit, minmax(400pt, 1fr))"
      w="100%"
    >
      <SeedDefTypeCard
        description="事前に定義されたシードからライセンス文を生成します."
        icon="mdi:sync"
        title="ベースシードを再利用"
      />
      <SeedDefTypeCard
        description="事前に定義されたシードを組み合わて, デュアルライセンスを生成します."
        icon="mdi:merge"
        title="ベースシードを交雑"
      />
      <SeedDefTypeCard
        description="事前に定義されたシードに変更を加えて, 新しいライセンス文を生成します."
        icon="mdi:invoice-text-edit"
        title="ベースシードをフォーク"
      />
      <SeedDefTypeCard
        description="自分でダイジェストとライセンス文を定義して, ライセンス文を生成します."
        icon="mdi:creation"
        title="カスタム"
      />
    </p.div>
  );
}
