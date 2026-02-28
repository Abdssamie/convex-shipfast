import { err, ok, type Result } from "neverthrow";

export type EmailFlow =
  | "email_verification"
  | "password_reset"
  | "magic_link"
  | "invitation"
  | "welcome";

export type EmailConfigError =
  | { code: "missing_env"; field: string; value: string; }
  | { code: "invalid_template_id"; field: string; value: string };

export type EmailSendError =
  | (EmailConfigError & { flow: EmailFlow })
  | {
    code: "brevo_request_failed";
    flow: EmailFlow;
    status?: number;
    reason?: string;
    templateId?: number;
  };

export type BrevoConfig = {
  apiKey: string;
  sender: { name: string; email: string };
  replyTo?: { name?: string; email: string };
};

const requiredEnv = (field: string): Result<string, EmailConfigError> => {
  const value = process.env[field];
  if (!value) {
    return err({ code: "missing_env", field, value: '' });
  }
  return ok(value);
};

export const getBrevoConfig = (): Result<BrevoConfig, EmailConfigError> => {
  const apiKeyResult = requiredEnv("BREVO_API_KEY");
  if (apiKeyResult.isErr()) {
    return err(apiKeyResult.error);
  }

  const senderNameResult = requiredEnv("BREVO_SENDER_NAME");
  if (senderNameResult.isErr()) {
    return err(senderNameResult.error);
  }

  const senderEmailResult = requiredEnv("BREVO_SENDER_EMAIL");
  if (senderEmailResult.isErr()) {
    return err(senderEmailResult.error);
  }

  const replyToEmail = process.env.BREVO_REPLY_TO_EMAIL;
  const replyToName = process.env.BREVO_REPLY_TO_NAME;
  const replyTo = replyToEmail
    ? {
      email: replyToEmail,
      name: replyToName,
    }
    : undefined;

  return ok({
    apiKey: apiKeyResult.value,
    sender: {
      name: senderNameResult.value,
      email: senderEmailResult.value,
    },
    replyTo,
  });
};

const templateEnvByFlow: Record<EmailFlow, string> = {
  email_verification: "BREVO_TEMPLATE_EMAIL_VERIFICATION",
  password_reset: "BREVO_TEMPLATE_PASSWORD_RESET",
  magic_link: "BREVO_TEMPLATE_MAGIC_LINK",
  invitation: "BREVO_TEMPLATE_INVITE",
  welcome: "BREVO_TEMPLATE_WELCOME",
};

export const getBrevoTemplateId = (
  flow: EmailFlow,
): Result<number, EmailConfigError> => {
  const field = templateEnvByFlow[flow];
  const value = process.env[field];
  if (!value) {
    return err({ code: "missing_env", field, value: "" });
  }

  const templateId = Number(value);
  if (!Number.isInteger(templateId)) {
    return err({ code: "invalid_template_id", field, value });
  }

  return ok(templateId);
};
