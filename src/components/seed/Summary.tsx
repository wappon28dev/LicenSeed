import { Icon } from "@iconify/react";
import { styled as p, VStack } from "panda/jsx";
import { type ReactElement } from "react";
import { RenderedSummaryEntry } from "./SummaryEntry";
import { type SeedBaseGroupManifest, type Summary } from "@/types/bindings";

const Card = p("div", {
  base: {
    rounded: "lg",
    p: "3",
    bg: "gray.100",
    h: "100%",
    w: "100%",
  },
});

const IconText = p("div", {
  base: {
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "lg",
    gap: "1",
    "& > svg": {
      fontSize: "xl",
    },
  },
});

export function SeedSummary({
  groupManifest,
  summary,
}: {
  groupManifest: SeedBaseGroupManifest;
  summary: Summary;
}): ReactElement {
  const { conditions, limitations, permissions } = summary;

  return (
    <VStack flex="1" gap="3" w="100%">
      <p.div
        alignItems="start"
        display="grid"
        gap="3"
        gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
        justifyContent="start"
        w="100%"
      >
        <Card bg="green.100">
          <IconText color="green.500">
            <Icon icon="mdi:check" /> 許可されていること
          </IconText>
          <p.ul>
            {permissions.map((entry) => (
              <RenderedSummaryEntry
                key={entry.value}
                entry={entry}
                entryKey="permissions"
                groupManifest={groupManifest}
              />
            ))}
          </p.ul>
        </Card>
        <Card bg="red.100">
          <IconText color="red.500">
            <Icon icon="mdi:close" />
            制限されていること
          </IconText>
          <p.ul>
            {limitations.map((entry) => (
              <RenderedSummaryEntry
                key={entry.value}
                entry={entry}
                entryKey="limitations"
                groupManifest={groupManifest}
              />
            ))}
          </p.ul>
        </Card>
      </p.div>
      <Card bg="yellow.100" h="fit-content">
        <IconText color="yellow.800">
          <Icon icon="mdi:alert" />
          条件
        </IconText>
        <p.ul>
          {conditions.map((entry) => (
            <RenderedSummaryEntry
              key={entry.value}
              entry={entry}
              entryKey="conditions"
              groupManifest={groupManifest}
            />
          ))}
        </p.ul>
      </Card>
    </VStack>
  );
}
