import { Opik } from "opik";

let opikClient: Opik | null = null;

/**
 * Returns a singleton Opik client for LLM tracing & evaluation.
 * Returns null if OPIK_API_KEY is not set (graceful degradation —
 * tracing is optional, AI features must never break because of it).
 */
export function getOpikClient(): Opik | null {
  if (!process.env.OPIK_API_KEY) {
    return null;
  }

  const workspaceName =
    process.env.OPIK_WORKSPACE_NAME ?? process.env.OPIK_WORKSPACE ?? "";
  if (!workspaceName.trim()) {
    return null;
  }

  if (!opikClient) {
    opikClient = new Opik({
      apiKey: process.env.OPIK_API_KEY,
      workspaceName,
      projectName: process.env.OPIK_PROJECT_NAME || "theypromised",
    });
  }

  return opikClient;
}
