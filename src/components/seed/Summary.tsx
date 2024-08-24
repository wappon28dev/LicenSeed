/* eslint-disable react/no-array-index-key */

import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";
import MDEditor from "@uiw/react-md-editor";
import { css } from "panda/css";
import { HStack, styled as p, VStack } from "panda/jsx";
import { token } from "panda/tokens";
import { useState, type ReactElement } from "react";
import rehypeSanitize from "rehype-sanitize";
import { match } from "ts-pattern";
import { DisplaySummaryEntry } from "./SummaryEntry";
import { ErrorScreen } from "@/components/ErrorScreen";
import { $seedBaseGroupCache } from "@/lib/stores/seed-def";
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
    color: "green.700",
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

function SeedSummaryEditableTerm({
  idx,
  entries,
  summaryKey,
  setEntries,
}: {
  idx: number;
  entries: SummaryEntry[];
  summaryKey: keyof Summary;
  setEntries: (newEntries: SummaryEntry[]) => void;
}): ReactElement {
  const entry = entries[idx] as Extract<SummaryEntry, { type: "TERM" }>;

  const seedBaseGroupCache = useStore($seedBaseGroupCache);
  const [query, setQuery] = useState("");

  if (seedBaseGroupCache == null) {
    return (
      <ErrorScreen
        error="`seedBaseGroupCache` is null!"
        title="定義済み用語のロード"
      />
    );
  }

  const terms = seedBaseGroupCache.manifest.terms[summaryKey];

  if (terms == null) {
    return <ErrorScreen error="`term` is null!" title="定義済み用語のロード" />;
  }

  const filteredTerms =
    query === ""
      ? getEntries(terms)
      : getEntries(terms).filter(
          ([key, { label, description }]) =>
            key.includes(query) ||
            label.includes(query) ||
            description.includes(query),
        );

  return (
    <HStack w="100%">
      <Combobox
        immediate
        onChange={(k) => {
          if (k == null) return;

          const next = [...entries];
          next[idx] = {
            ...entry,
            type: "TERM",
            key: k,
          };

          setEntries(next);
        }}
        onClose={() => {
          setQuery("");
        }}
        value={entry.key}
      >
        <ComboboxInput
          aria-label="Assignee"
          className={css({
            w: "100%",
            border: "1px solid",
            rounded: "md",
            bg: "white",
            p: "1",
          })}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          value={entry.key}
        />
        <ComboboxOptions
          anchor="bottom start"
          className={css({
            border: "1px solid",
            rounded: "md",
            position: "absolute",
            left: "0",
            bg: "white",
            p: "2",
            textAlign: "left",
          })}
        >
          {filteredTerms.map(([key, { label, description }], termIdx) => (
            <ComboboxOption
              key={key}
              className={css({
                w: "100%",
                px: "3",
                _hover: {
                  bg: "gray.100",
                },
                cursor: "pointer",
              })}
              value={key}
            >
              <p.p
                overflow="hidden"
                textOverflow="ellipsis"
                w="50vw"
                whiteSpace="nowrap"
              >
                <p.code color="gray">{termIdx + 1}. </p.code>
                {label} <p.span color="gray"> — </p.span>
                <p.code>{key}</p.code>
                <p.span color="gray"> — {description}</p.span>
              </p.p>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
      <p.button
        onClick={() => {
          setEntries(entries.filter((_, i) => i !== idx));
        }}
      >
        <Icon height="1.5em" icon="mdi:delete-forever-outline" />
      </p.button>
    </HStack>
  );
}

function SeedSummaryEditableMarkdown({
  idx,
  entries,
  setEntries,
}: {
  idx: number;
  entries: SummaryEntry[];
  setEntries: (newEntries: SummaryEntry[]) => void;
}): ReactElement {
  const entry = entries[idx] as Extract<SummaryEntry, { type: "MARKDOWN" }>;

  return (
    <VStack w="100%">
      <HStack justifyContent="space-between" w="100%">
        <p.input
          bg="white"
          border="1px solid"
          onChange={(e) => {
            const next = [...entries];
            next[idx] = {
              ...entry,
              type: "MARKDOWN",
              title: e.target.value,
            };

            setEntries(next);
          }}
          p="1"
          placeholder="タイトルを入力"
          rounded="md"
          value={entry.title}
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
        textareaProps={{
          placeholder: "説明を入力",
        }}
        value={entry.body}
      />
    </VStack>
  );
}

export function SeedSummaryEditable({
  summaryKey,
  entries,
  setEntries,
}: {
  summaryKey: keyof Summary;
  entries: SummaryEntry[];
  setEntries: (newEntries: SummaryEntry[]) => void;
}): ReactElement {
  const { bgColor, color, title, icon } = summaryEntry[summaryKey];
  const seedBaseGroupCache = useStore($seedBaseGroupCache);

  return (
    <VStack
      p="3"
      rounded="md"
      style={{
        background: token(`colors.${bgColor}`),
      }}
      w="100%"
    >
      <IconText
        style={{
          color: token(`colors.${color}`),
        }}
        textAlign="start"
        w="100%"
      >
        <Icon icon={icon} />
        {title}
      </IconText>
      <p.ul w="100%">
        {entries.map((entry, idx) => (
          <p.li key={idx} mb="3">
            {match(entry)
              .with({ type: "TERM" }, () => (
                <SeedSummaryEditableTerm
                  entries={entries}
                  idx={idx}
                  setEntries={setEntries}
                  summaryKey={summaryKey}
                />
              ))
              .with({ type: "MARKDOWN" }, () => (
                <SeedSummaryEditableMarkdown
                  entries={entries}
                  idx={idx}
                  setEntries={setEntries}
                />
              ))
              .exhaustive()}
          </p.li>
        ))}
      </p.ul>
      <HStack>
        <p.button
          _hover={{
            bg: "var(--hover-color)",
          }}
          disabled={seedBaseGroupCache?.manifest.terms[summaryKey] == null}
          onClick={() => {
            setEntries([
              ...entries,
              {
                type: "TERM",
                key: "",
              },
            ]);
          }}
          p="2"
          rounded="md"
          style={{
            color: token(`colors.${color}`),
            // @ts-expect-error: `--hover-color` is a custom property
            "--hover-color": token(`colors.${bgColor.replace(".100", ".200")}`),
          }}
        >
          <IconText>
            <Icon icon="mdi:plus" />
            <p.p fontSize="sm" fontWeight="medium">
              定義済み用語
            </p.p>
          </IconText>
        </p.button>
        <p.button
          _hover={{
            bg: "var(--hover-color)",
          }}
          onClick={() => {
            setEntries([
              ...entries,
              {
                type: "MARKDOWN",
                title: "",
                body: "",
              },
            ]);
          }}
          p="2"
          rounded="md"
          style={{
            color: token(`colors.${color}`),
            // @ts-expect-error: `--hover-color` is a custom property
            "--hover-color": token(`colors.${bgColor.replace(".100", ".200")}`),
          }}
        >
          <IconText>
            <Icon icon="mdi:plus" />
            <p.p fontSize="sm" fontWeight="medium">
              テキスト
            </p.p>
          </IconText>
        </p.button>
      </HStack>
    </VStack>
  );
}
