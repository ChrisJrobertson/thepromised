import { SpanType } from "opik";

import { getOpikClient } from "./opik";

export interface TraceAICallOptions {
  /** Human-readable name: 'draft-letter', 'case-analysis', 'summarise', etc. */
  name: string;
  /** The model ID string being used */
  model: string;
  /** Input sent to Claude */
  input: {
    systemPrompt?: string;
    messages: Array<{ role: string; content: string }>;
  };
  /** Arbitrary metadata — case ID, letter type, user tier, etc. */
  metadata?: Record<string, unknown>;
  /** Tags for filtering in the Opik dashboard */
  tags?: string[];
}

export interface TraceAICallResult {
  /** Call this with the Claude response when the LLM call succeeds */
  success: (output: {
    content: string;
    inputTokens: number;
    outputTokens: number;
    stopReason: string | null;
  }) => void;
  /** Call this if the LLM call fails */
  error: (err: Error) => void;
}

/**
 * PII redactor — strips emails and phone numbers before sending to Opik.
 */
function redactPII(text: string): string {
  return text
    .replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      "[EMAIL_REDACTED]"
    )
    .replace(
      /(\+?\d{1,4}[\s-]?)?(\(?\d{2,5}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g,
      "[PHONE_REDACTED]"
    );
}

/**
 * Wraps an AI call with Opik tracing.
 * Returns { success, error } callbacks — call one when the LLM responds.
 * If Opik is unavailable, returns no-op callbacks.
 *
 * CRITICAL: Never throws — tracing must never break AI features.
 */
export function traceAICall(options: TraceAICallOptions): TraceAICallResult {
  const noop: TraceAICallResult = {
    success: () => {},
    error: () => {},
  };

  try {
    const client = getOpikClient();
    if (!client) return noop;

    // Redact PII from message content before logging
    const safeInput = {
      ...(options.input.systemPrompt !== undefined
        ? { systemPrompt: redactPII(options.input.systemPrompt) }
        : {}),
      messages: options.input.messages.map((m) => ({
        ...m,
        content: redactPII(m.content),
      })),
    };

    const trace = client.trace({
      name: options.name,
      input: safeInput,
      metadata: {
        ...options.metadata,
        model: options.model,
      },
      tags: options.tags,
      startTime: new Date(),
    });

    const span = trace.span({
      name: `${options.name}:llm`,
      type: SpanType.Llm,
      input: safeInput,
      metadata: { model: options.model },
      startTime: new Date(),
    });

    const startTime = Date.now();

    return {
      success: (output) => {
        try {
          const duration = Date.now() - startTime;
          span.update({
            output: { response: output.content },
            metadata: {
              model: options.model,
              input_tokens: output.inputTokens,
              output_tokens: output.outputTokens,
              stop_reason: output.stopReason,
              duration_ms: duration,
            },
            endTime: new Date(),
          });
          span.end();
          trace.update({
            output: { response: output.content },
            metadata: {
              total_tokens: output.inputTokens + output.outputTokens,
              duration_ms: duration,
            },
            endTime: new Date(),
          });
          trace.end();
          void client.flush().catch(() => {});
        } catch {
          // Tracing must never break the feature
        }
      },
      error: (err) => {
        try {
          const errorInfo = {
            exceptionType: err.name,
            message: err.message,
            traceback: err.stack ?? "",
          };
          span.update({
            output: { error: err.message },
            metadata: { error: true },
            endTime: new Date(),
            errorInfo,
          });
          span.end();
          trace.update({
            output: { error: err.message },
            metadata: { error: true },
            endTime: new Date(),
            errorInfo,
          });
          trace.end();
          void client.flush().catch(() => {});
        } catch {
          // Tracing must never break the feature
        }
      },
    };
  } catch {
    return noop;
  }
}
