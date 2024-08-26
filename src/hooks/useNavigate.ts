import { useCallback } from "react";
import { useNavigate as _useNavigate } from "@/router";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useNavigate = () => {
  const _navigate = _useNavigate();
  const navigate = useCallback(
    (...params: Parameters<typeof _navigate>) => {
      if (document.startViewTransition == null) {
        // @ts-expect-error なんかダメらしい
        _navigate(...params);
        return;
      }

      const transition = document.startViewTransition(() => {
        // @ts-expect-error なんかダメらしい
        _navigate(...params);
      });

      try {
        void transition.finished;
      } catch {}
    },
    [_navigate],
  );

  return navigate;
};
