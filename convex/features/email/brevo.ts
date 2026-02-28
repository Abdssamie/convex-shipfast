import { errAsync, okAsync, ResultAsync } from "neverthrow";
import {
  type BrevoConfig,
  type EmailFlow,
  type EmailSendError,
  getBrevoConfig,
} from "./config";

type BrevoEmailPayload = {
  sender: { name: string; email: string };
  replyTo?: { name?: string; email: string };
  templateId: number;
  params?: Record<string, string>;
  tags?: string[];
  messageVersions: {
    to: { email: string; name?: string }[];
    params?: Record<string, string>;
  }[];
};

type BrevoResponseSuccess = {
  messageIds: string[];
};
const createBrevoRequest = async (
  config: BrevoConfig,
  payload: BrevoEmailPayload,
  maxRetries = 3
): Promise<Response> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": config.apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      // If successful or client error (4xx), return immediately
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // For 5xx errors, we throw to trigger a retry
      throw new Error(`Server error: ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;

      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

export const sendBrevoTemplate = (params: {
  flow: EmailFlow;
  to: { email: string; name?: string };
  templateId: number;
  params?: Record<string, string>;
  tags?: string[];
}): ResultAsync<BrevoResponseSuccess, EmailSendError> => {
  const configResult = getBrevoConfig();

  if (configResult.isErr()) {
    return errAsync({ ...configResult.error, flow: params.flow });
  }

  const payload: BrevoEmailPayload = {
    sender: configResult.value.sender,
    replyTo: configResult.value.replyTo,
    templateId: params.templateId,
    params: params.params,
    tags: params.tags,
    messageVersions: [
      {
        to: [params.to],
        params: params.params,
      },
    ],
  };

  const errorBody = (status?: number, reason?: string): EmailSendError => ({
    code: "brevo_request_failed",
    flow: params.flow,
    status,
    reason,
    templateId: params.templateId,
  });

  return ResultAsync.fromPromise(
    createBrevoRequest(configResult.value, payload),

    // Error
    () => errorBody(undefined, "network_error"),
  ).andThen((response) =>
    ResultAsync.fromPromise(
      response.json().catch(() => ({})),

      // Error
      () => errorBody(response.status, response.statusText),
    ).andThen((body) => {
      if (response.ok) {
        const messageIds =
          body && typeof body === "object" && "messageIds" in body
            ? ((body as { messageIds?: string[] }).messageIds ?? [])
            : [];
        return okAsync({ messageIds });
      }

      const reason =
        body && typeof body === "object" && "message" in body
          ? String((body as { message?: string }).message)
          : response.statusText;

      // Error
      return errAsync(errorBody(response.status, reason));
    }),
  );
};
