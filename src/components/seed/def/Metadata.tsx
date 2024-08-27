import { css } from "panda/css";
import { HStack, styled as p, VStack } from "panda/jsx";
import { type ReactElement } from "react";
import { $seedDefFileUserMetadata } from "@/lib/stores/seed-def";
import { type SeedDefFileMetadata } from "@/types/bindings";

export function SeedDefFileMetadataInput({
  metadata,
  isEditable = false,
}: {
  metadata: Partial<SeedDefFileMetadata>;
  isEditable?: boolean;
}): ReactElement {
  return (
    <VStack
      alignItems="start"
      className={css({
        "& input": {
          fontFamily: "udev",
          border: "1px solid",
          p: "1",
          rounded: "md",
          w: "100%",
          _readOnly: {
            cursor: "not-allowed",
            color: "gray",
          },
        },
      })}
      py="1"
      w="100%"
    >
      <p.p fontWeight="bold">メタデータ</p.p>
      <VStack alignItems="start" gap="0" w="100%">
        <p.p>タイトル</p.p>
        <p.input
          border="1px solid"
          onChange={(e) => {
            $seedDefFileUserMetadata.set({
              ...metadata,
              title: e.target.value,
            });
          }}
          p="1"
          readOnly={!isEditable}
          rounded="md"
          value={metadata?.title}
          w="100%"
        />
      </VStack>
      <HStack justifyContent="space-between">
        <VStack alignItems="start" flex="1" gap="0" w="100%">
          <p.p>バージョン</p.p>
          <p.input readOnly value={`v${metadata.version}`} />
        </VStack>
        <VStack alignItems="start" gap="0" w="100%">
          <p.p>付与日時</p.p>
          <p.input readOnly value={metadata.sow_date} />
        </VStack>
      </HStack>
    </VStack>
  );
}
