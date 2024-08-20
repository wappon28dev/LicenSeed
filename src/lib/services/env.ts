import { str, envsafe } from "envsafe";

export const env = envsafe(
  {
    VITE_GEMINI_API_KEY: str(),
  },
  {
    env: import.meta.env,
  },
);
