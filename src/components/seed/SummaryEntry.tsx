import { Icon } from "@iconify/react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { css } from "panda/css";
import { HStack, styled as p, VStack } from "panda/jsx";
import { type ReactElement } from "react";
import {
  type Summary,
  type SeedBaseGroupManifest,
  type SummaryEntry,
} from "@/types/bindings";

function Hint({ description }: { description: string }): ReactElement {
  return (
    <VStack bg="white" p="3" rounded="md" shadow="md">
      <HoverCard.Arrow
        className={css({
          fill: "white",
          scale: 2,
        })}
      />
      <p.p color="gray.500" fontSize="xs">
        {description}
      </p.p>
    </VStack>
  );
}

export function RenderedSummaryEntry({
  groupManifest,
  entryKey,
  entry,
}: {
  groupManifest: SeedBaseGroupManifest;
  entryKey: keyof Summary;
  entry: SummaryEntry;
}): ReactElement {
  if (entry.type === "MARKDOWN") {
    return <p.div>...</p.div>;
  }

  const termText = groupManifest.terms[entryKey][entry.value];

  if (termText == null) {
    throw new Error(`No term found for ${entryKey} ${entry.value}`);
  }

  return (
    <p.li>
      <HStack alignItems="center" justifyContent="space-between">
        <p.p>{termText.label}</p.p>
        <HoverCard.Root closeDelay={100} openDelay={300}>
          <HoverCard.Trigger asChild>
            <Icon cursor="pointer" icon="mdi:help-circle-outline" />
          </HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content side="right" sideOffset={3}>
              <Hint description={termText.description} />
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      </HStack>
    </p.li>
  );
}
