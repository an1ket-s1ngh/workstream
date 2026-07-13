import type { Adapter } from "./types.js";
import type { GenerateRequest, GenerateResponse } from "../types.js";

/**
 * Deterministic offline adapter for tests and demos.
 * Echoes a structured reply so CLI flows work without network.
 */
export class MockAdapter implements Adapter {
  readonly kind = "mock";

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const { session, message, history } = request;
    const turnCount = history.length + 1;
    const preview = message.length > 120 ? `${message.slice(0, 117)}...` : message;

    const content = [
      `[mock/${session.role}] session=${session.name} turn=${turnCount}`,
      `Acknowledged: ${preview}`,
      session.role === "fast"
        ? "Plan: execute mechanically, report artifacts, mark criteria when done."
        : "Plan: apply judgment, surface tradeoffs, confirm delivery contract before closing.",
    ].join("\n");

    return {
      content,
      model: "mock-v1",
    };
  }
}
