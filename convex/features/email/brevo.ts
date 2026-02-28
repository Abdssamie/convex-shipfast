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

export const sendBrevoTemplate = async (params: {
  flow: EmailFlow;
  to: { email: string; name?: string };
  templateId: number;
  params?: Record<string, string>;
  tags?: string[];
}): Promise<BrevoResponseSuccess> => {
  const config = getBrevoConfig();

  const payload: BrevoEmailPayload = {
    sender: config.sender,
    replyTo: config.replyTo,
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

  try {
    const response = await createBrevoRequest(config, payload);
    
    let body: any = {};
    try {
      body = await response.json();
    } catch (jsonError) {
      // Log JSON parse errors for debugging
      console.error("Failed to parse Brevo response:", jsonError);
    }

    if (response.ok) {
      const messageIds =
        body && typeof body === "object" && "messageIds" in body
          ? ((body as { messageIds?: string[] }).messageIds ?? [])
          : [];
      return { messageIds };
    }

    const reason =
      body && typeof body === "object" && "message" in body
        ? String((body as { message?: string }).message)
        : response.statusText;

    throw errorBody(response.status, reason);
  } catch (error) {
    // Re-throw structured errors
    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }
    // Log unexpected errors before throwing
    console.error("Brevo email send error:", error);
    throw errorBody(undefined, "network_error");
  }
};
