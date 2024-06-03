import { createClient } from "@rspc/client";
import { TauriTransport } from "@rspc/tauri";
import { type Procedures } from "@/types/bindings";

export const api = createClient<Procedures>({
  transport: new TauriTransport(),
});
