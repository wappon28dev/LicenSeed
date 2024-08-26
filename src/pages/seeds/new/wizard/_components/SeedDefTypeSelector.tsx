import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import { HStack, styled as p, VStack } from "panda/jsx";
import { token } from "panda/tokens";
import { type ReactElement } from "react";
import { $seedCheckStatusData, $seedDefWizard } from "@/lib/stores/seed-def";
import { getEntries } from "@/lib/utils";
import { seedDefTypeInfo } from "@/lib/utils/seed";

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

export function SeedDefTypeSelector(): ReactElement {
  const seedDefWizard = useStore($seedDefWizard);

  return (
    <p.div
      alignItems="start"
      display="grid"
      gap="2"
      gridTemplateColumns="repeat(auto-fit, minmax(400pt, 1fr))"
      w="100%"
    >
      {getEntries(seedDefTypeInfo).map(
        ([type, { icon, title, description }]) => {
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
        },
      )}
    </p.div>
  );
}
