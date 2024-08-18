/* eslint-disable react/no-array-index-key */

import { Icon } from "@iconify/react";
import MDEditor from "@uiw/react-md-editor";
import { css } from "panda/css";
import { HStack, styled as p, VStack } from "panda/jsx";
import { token } from "panda/tokens";
import { type ReactElement } from "react";
import rehypeSanitize from "rehype-sanitize";
import { DisplaySummaryEntry } from "./SummaryEntry";
import { Button } from "@/components/Button";
import { getEntries } from "@/lib/utils";
import {
  type SummaryEntry,
  type SeedBaseGroupManifest,
  type Summary,
} from "@/types/bindings";

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

const summaryEntry = {
  permissions: {
    id: 0,
    title: "許可されていること",
    color: "green.500",
    bgColor: "green.100",
    icon: "mdi:check",
  },
  limitations: {
    id: 1,
    title: "制限されていること",
    color: "red.500",
    bgColor: "red.100",
    icon: "mdi:close",
  },
  conditions: {
    id: 2,
    title: "条件",
    color: "yellow.800",
    bgColor: "yellow.100",
    icon: "mdi:alert",
  },
  notes: {
    id: 3,
    title: "特記事項",
    color: "orange.800",
    bgColor: "orange.100",
    icon: "mdi:information",
  },
} as const satisfies Record<
  keyof Summary,
  {
    id: number;
    title: string;
    bgColor: string;
    color: string;
    icon: string;
  }
>;

export function SeedSummary({
  groupManifest,
  summary,
}: {
  groupManifest: SeedBaseGroupManifest;
  summary: Summary;
}): ReactElement {
  return (
    <VStack flex="1" gap="3" w="100%">
      <p.div
        alignItems="start"
        display="grid"
        gap="3"
        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
        justifyContent="start"
        w="100%"
      >
        {getEntries(summary)
          .sort(
            ([k1, _], [k2, __]) => summaryEntry[k1].id - summaryEntry[k2].id,
          )
          .map(([k, v]) => {
            if (v == null || v.length === 0) return undefined;
            const { title, bgColor, color, icon } = summaryEntry[k];

            return (
              <Card
                key={k}
                style={{
                  background: token(`colors.${bgColor}`),
                }}
              >
                <IconText
                  style={{
                    color: token(`colors.${color}`),
                  }}
                >
                  <Icon icon={icon} />
                  {title}
                </IconText>
                <p.ul>
                  {v.map((entry, idx) => (
                    <DisplaySummaryEntry
                      key={idx}
                      summaryEntry={entry}
                      terms={groupManifest.terms}
                      termsEntryKey={k}
                    />
                  ))}
                </p.ul>
              </Card>
            );
          })}
      </p.div>
    </VStack>
  );
}

export function SeedSummaryNoteEditable({
  entries,
  setEntries,
}: {
  entries: SummaryEntry[];
  setEntries: (newEntries: SummaryEntry[]) => void;
}): ReactElement {
  const { bgColor } = summaryEntry.notes;

  return (
    <VStack
      p="3"
      rounded="md"
      style={{
        background: token(`colors.${bgColor}`),
      }}
      w="100%"
    >
      <p.ul w="100%">
        {entries.map((entry, idx) => (
          <p.li key={idx} mb="3">
            <VStack w="100%">
              <HStack justifyContent="space-between" w="100%">
                <p.input
                  bg="white"
                  border="1px solid"
                  onChange={(e) => {
                    const next = [...entries];
                    next[idx] = {
                      type: "MARKDOWN",
                      body: "",
                      title: e.target.value,
                    };

                    setEntries(next);
                  }}
                  p="1"
                  placeholder="タイトル"
                  rounded="md"
                  value={entry.type === "MARKDOWN" ? entry.title : ""}
                  w="100%"
                />
                <p.button
                  onClick={() => {
                    setEntries(entries.filter((_, i) => i !== idx));
                  }}
                >
                  <Icon height="1.5em" icon="mdi:delete-forever-outline" />
                </p.button>
              </HStack>
              <MDEditor
                className={css({
                  w: "100%",
                })}
                onChange={(value) => {
                  setEntries(
                    entries.map((e, i) =>
                      i === idx ? { ...e, body: value ?? "" } : e,
                    ),
                  );
                }}
                previewOptions={{
                  rehypePlugins: [[rehypeSanitize]],
                }}
                value={entry.type === "MARKDOWN" ? entry.body : ""}
              />
            </VStack>
          </p.li>
        ))}
      </p.ul>
      <Button
        icon="mdi:plus"
        props={{
          onClick: () => {
            setEntries([
              ...entries,
              {
                type: "MARKDOWN",
                title: "",
                body: "",
              },
            ]);
          },
        }}
        type="outline"
      >
        <p.p>追加</p.p>
      </Button>
    </VStack>
  );
}
