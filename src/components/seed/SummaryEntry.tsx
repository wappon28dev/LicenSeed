import { Icon } from "@iconify/react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { css } from "panda/css";
import { HStack, styled as p, VStack } from "panda/jsx";
import { type ReactNode, type ReactElement } from "react";
import { MDPreview } from "../MDPreview";
import { searchTermEntryFromKey } from "@/lib/utils/seed-base";
import {
  type SummaryEntry,
  type Terms,
  type TermEntry,
} from "@/types/bindings";

export function Hint({ children }: { children: ReactNode }): ReactElement {
  return (
    <VStack
      bg="white"
      maxH="300pt"
      maxW="500pt"
      overflow="auto"
      p="3"
      rounded="md"
      shadow="md"
    >
      <HoverCard.Arrow
        className={css({
          fill: "white",
          scale: 2,
        })}
      />
      <p.div color="gray.500" fontSize="xs">
        {children}
      </p.div>
    </VStack>
  );
}

function DisplaySummaryEntryTerm({
  termEntry,
}: {
  termEntry: TermEntry;
}): ReactElement {
  return (
    <p.li>
      <HStack alignItems="center" justifyContent="space-between">
        <p.p>{termEntry.label}</p.p>
        <HStack alignItems="center">
          <HoverCard.Root closeDelay={0} openDelay={0}>
            <HoverCard.Trigger asChild>
              <p.p
                bg="white"
                color="gray.500"
                cursor="help"
                fontSize="2xs"
                p="0.5"
                px="1"
                rounded="sm"
                textTransform="uppercase"
              >
                term
              </p.p>
            </HoverCard.Trigger>
            <HoverCard.Portal>
              <HoverCard.Content
                className={css({
                  zIndex: "modalContent",
                })}
                side="right"
                sideOffset={3}
              >
                <Hint>シードグループで定義済みの用語です.</Hint>
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root>

          <HoverCard.Root closeDelay={0} openDelay={0}>
            <HoverCard.Trigger asChild>
              <Icon cursor="help" icon="mdi:help-circle-outline" />
            </HoverCard.Trigger>
            <HoverCard.Portal>
              <HoverCard.Content
                className={css({
                  zIndex: "modalContent",
                })}
                side="right"
                sideOffset={3}
              >
                <Hint>{termEntry.description}</Hint>
              </HoverCard.Content>
            </HoverCard.Portal>
          </HoverCard.Root>
        </HStack>
      </HStack>
    </p.li>
  );
}

function DisplaySummaryEntryMarkdown({
  mdEntry,
}: {
  mdEntry: Extract<SummaryEntry, { type: "MARKDOWN" }>;
}): ReactElement {
  return (
    <p.li>
      <HStack alignItems="center" justifyContent="space-between">
        <p.p>{mdEntry.title}</p.p>
        <HoverCard.Root closeDelay={0} openDelay={0}>
          <HoverCard.Trigger asChild>
            <Icon cursor="pointer" icon="mdi:help-circle-outline" />
          </HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content
              className={css({
                zIndex: "modalContent",
              })}
              side="right"
              sideOffset={3}
            >
              <Hint>
                <MDPreview source={mdEntry.body} />
              </Hint>
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      </HStack>
    </p.li>
  );
}

export function DisplaySummaryEntry({
  summaryEntry,
  termsEntryKey,
  terms,
}: {
  summaryEntry: SummaryEntry;
  termsEntryKey: keyof Terms;
  terms: Terms;
}): ReactElement {
  if (summaryEntry.type === "MARKDOWN") {
    return <DisplaySummaryEntryMarkdown mdEntry={summaryEntry} />;
  }

  const termEntry = searchTermEntryFromKey(
    summaryEntry.key,
    termsEntryKey,
    terms,
  );

  if (termEntry == null) {
    return <p.li>?</p.li>;
  }

  return <DisplaySummaryEntryTerm termEntry={termEntry} />;
}
