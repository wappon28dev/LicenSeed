import { Icon } from "@iconify/react";
import { getCurrent } from "@tauri-apps/api/webview";
import { LoremIpsum } from "lorem-ipsum";
import { css } from "panda/css";
import { HStack, VStack, styled as p } from "panda/jsx";
import { vstack } from "panda/patterns/vstack";
import { type ReactElement, useEffect, useState } from "react";
import { Resplit } from "react-resplit";
import { CopyWrapper } from "@/components/CopyWrapper";
import { FileTree } from "@/components/FileTree";
import { Splitter } from "@/components/Splitter";
import { api } from "@/lib/services/api";
import type { FileEntry } from "@/types/bindings";

function Main(): ReactElement {
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

  return (
    <VStack gap="3" h="100%" p="3" pl="1">
      <HStack justifyContent="space-between" w="100%">
        <p.h1 fontSize="2xl" fontWeight="black">
          付与されているライセンス
        </p.h1>
        <p.button>原文を表示</p.button>
      </HStack>

      <Resplit.Root className={css({ w: "100%", h: "100%" })}>
        <Resplit.Pane
          className={vstack({ w: "100%", h: "100%" })}
          initialSize="1fr"
          order={0}
        >
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
                  <p.li>商用での利用</p.li>
                  <p.li>修正</p.li>
                  <p.li>私的利用</p.li>
                </p.ul>
              </Card>
              <Card bg="red.100">
                <IconText color="red.500">
                  <Icon icon="mdi:close" />
                  制限されていること
                </IconText>
                <p.ul>
                  <p.li>責任</p.li>
                  <p.li>保証</p.li>
                </p.ul>
              </Card>
            </p.div>
            <Card bg="yellow.100" h="fit-content">
              <IconText color="yellow.800">
                <Icon icon="mdi:alert" />
                条件
              </IconText>
              <p.ul>
                <p.li>
                  ライセンスと著作権表示
                  <p.div
                    bg="gray.100"
                    border="1px solid"
                    borderColor="gray.400"
                    p="2"
                    rounded="md"
                    w="100%"
                  >
                    <CopyWrapper
                      copyText="Copyright 2024 © wappoon28dev"
                      spaceExpanded
                    >
                      <p.code>Copyright 2024 © wappoon28dev</p.code>
                    </CopyWrapper>
                  </p.div>
                </p.li>
              </p.ul>
            </Card>
          </VStack>
          <p.p w="100%">
            このサマリー表示は法的なアドバイスではありませんが,
            ライセンス付与者が承認したものです.
          </p.p>
        </Resplit.Pane>
        <Splitter />
        <Resplit.Pane
          className={css({
            bg: "gray.100",
            rounded: "lg",
            border: "1px solid",
            borderColor: "gray.400",
            h: "100%",
            p: "3",
            overflowY: "auto",
          })}
          initialSize="1fr"
          order={2}
        >
          <p.p>{new LoremIpsum().generateParagraphs(5)}</p.p>
        </Resplit.Pane>
      </Resplit.Root>
    </VStack>
  );
}

export default function Page(): ReactElement {
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);

  useEffect(() => {
    const unListen = getCurrent().onDragDropEvent((ev) => {
      if (ev.payload.type !== "dropped") {
        return;
      }
      void api.showFiles(ev.payload.paths[0]).then((result) => {
        setFileEntries(result);
      });
    });

    return () => {
      void unListen.then((fn) => {
        fn();
      });
    };
  }, []);

  return (
    <p.div display="flex" h="100%" w="100%">
      <Resplit.Root
        className={css({
          display: "flex",
          h: "100%",
          w: "100%",
        })}
        direction="horizontal"
      >
        <Resplit.Pane
          className={css({
            h: "100%",
            w: "100%",
            bg: "blue.100",
          })}
          initialSize="1fr"
          order={0}
        >
          <VStack justifyContent="space-between" w="100%">
            <p.div
              className={css({
                "& .FolderTree": {
                  h: "50vh",
                  w: "100%",
                  overflow: "scroll",
                },
              })}
              w="100%"
            >
              <FileTree fileEntries={fileEntries} />
            </p.div>
            <p.div h="50%" w="100%">
              metadata
            </p.div>
          </VStack>
        </Resplit.Pane>
        <Splitter />
        <Resplit.Pane
          className={css({
            h: "100%",
            overflowY: "auto",
          })}
          initialSize="5fr"
          order={2}
        >
          <Main />
        </Resplit.Pane>
      </Resplit.Root>
    </p.div>
  );
}
