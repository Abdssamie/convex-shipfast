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

const requiredEnv = (field: string): string => {
  const value = process.env[field];
  if (!value) {
    throw { code: "missing_env", field, value: '' } as EmailConfigError;
  }
  return value;
};

export const getBrevoConfig = (): BrevoConfig => {
  const apiKey = requiredEnv("BREVO_API_KEY");
  const senderName = requiredEnv("BREVO_SENDER_NAME");
  const senderEmail = requiredEnv("BREVO_SENDER_EMAIL");

  const replyToEmail = process.env.BREVO_REPLY_TO_EMAIL;
  const replyToName = process.env.BREVO_REPLY_TO_NAME;
  const replyTo = replyToEmail
    ? {
      email: replyToEmail,
      name: replyToName,
    }
    : undefined;

  return {
    apiKey,
    sender: {
      name: senderName,
      email: senderEmail,
    },
    replyTo,
  };
};

const templateEnvByFlow: Record<EmailFlow, string> = {
  email_verification: "BREVO_TEMPLATE_EMAIL_VERIFICATION",
  password_reset: "BREVO_TEMPLATE_PASSWORD_RESET",
  magic_link: "BREVO_TEMPLATE_MAGIC_LINK",
  invitation: "BREVO_TEMPLATE_INVITE",
  welcome: "BREVO_TEMPLATE_WELCOME",
};

export const getBrevoTemplateId = (flow: EmailFlow): number => {
  const field = templateEnvByFlow[flow];
  const value = process.env[field];
  if (!value) {
    throw { code: "missing_env", field, value: "" } as EmailConfigError;
  }

  const templateId = Number(value);
  if (!Number.isInteger(templateId)) {
    throw { code: "invalid_template_id", field, value } as EmailConfigError;
  }

  return templateId;
};
