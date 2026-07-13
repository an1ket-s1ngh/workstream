import type { AdapterKind } from "../types.js";
import type { Adapter, AdapterFactoryOptions } from "./types.js";
import { MockAdapter } from "./mock.js";
import { OpenAIAdapter } from "./openai.js";

export type { Adapter, AdapterFactoryOptions } from "./types.js";
export { MockAdapter } from "./mock.js";
export { OpenAIAdapter } from "./openai.js";

export function createAdapter(
  kind: AdapterKind,
  options: AdapterFactoryOptions = {},
): Adapter {
  switch (kind) {
    case "mock":
      return new MockAdapter();
    case "openai":
      return new OpenAIAdapter(options);
    default: {
      const _exhaustive: never = kind;
      throw new Error(`Unknown adapter: ${String(_exhaustive)}`);
    }
  }
}
