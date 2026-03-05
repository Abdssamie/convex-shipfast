import type { EmailFlow } from "../email/config";
import { sendEmail } from "../email";
import { logger } from "../../lib/logger";

type BetterAuthEmailPayload = {
  to: { email: string; name?: string };
  params: Record<string, string>;
  tags?: string[];
};

const internalSendEmail = async (flow: EmailFlow, payload: BetterAuthEmailPayload) => {
  const result = await sendEmail({
    flow,
    to: payload.to,
    params: payload.params,
    tags: payload.tags,
  });

  if (!result.ok) {
    logger.warn("brevo_email_failed", result.error);
  }
};



export const sendVerificationEmail = async (params: {
  email: string;
  name?: string | null;
  url: string;
}) => {
  await internalSendEmail("email_verification", {
    to: { email: params.email, name: params.name ?? undefined },
    params: {
      verificationUrl: params.url,
      email: params.email,
      name: params.name ?? "",
    },
    tags: ["better-auth", "email-verification"],
  });
};

export const sendPasswordResetEmail = async (params: {
  email: string;
  name?: string | null;
  url: string;
}) => {
  await internalSendEmail("password_reset", {
    to: { email: params.email, name: params.name ?? undefined },
    params: {
      resetUrl: params.url,
      email: params.email,
      name: params.name ?? "",
    },
    tags: ["better-auth", "password-reset"],
  });
};

export const sendMagicLinkEmail = async (params: {
  email: string;
  url: string;
}) => {
  await internalSendEmail("magic_link", {
    to: { email: params.email },
    params: {
      magicLink: params.url,
      email: params.email,
    },
    tags: ["better-auth", "magic-link"],
  });
};

export const sendInvitationEmail = async (params: {
  email: string;
  invitedByEmail?: string | null;
  invitedByName?: string | null;
  organizationName?: string | null;
  inviteLink: string;
}) => {
  await internalSendEmail("invitation", {
    to: { email: params.email },
    params: {
      inviteUrl: params.inviteLink,
      inviterName: params.invitedByName ?? "",
      appName: "FastShip",
    },
    tags: ["better-auth", "invitation"],
  });
};

export const sendWelcomeEmail = async (params: {
  email: string;
  name?: string | null;
}) => {
  await internalSendEmail("welcome", {
    to: { email: params.email, name: params.name ?? undefined },
    params: {
      appName: "FastShip",
      userName: params.name ?? "",
    },
    tags: ["better-auth", "welcome"],
  });
};

export const authEmailHandlers = {
  sendInvitationEmail,
  sendMagicLinkEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
};
