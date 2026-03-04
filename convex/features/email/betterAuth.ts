import type { EmailFlow } from "./config";
import { sendEmail } from "./index";
import { logger } from "../../lib/logger";

type BetterAuthEmailPayload = {
  to: { email: string; name?: string };
  params: Record<string, string>;
  tags?: string[];
};

const sendBetterAuthEmail = async (flow: EmailFlow, payload: BetterAuthEmailPayload) => {
  try {
    await sendEmail({
      flow,
      to: payload.to,
      params: payload.params,
      tags: payload.tags,
    });
  } catch (error) {
    logger.warn("brevo_email_failed", { error });
  }
};

export const sendVerificationEmail = async (params: {
  email: string;
  name?: string | null;
  url: string;
}) => {
  await sendBetterAuthEmail("email_verification", {
    to: { email: params.email, name: params.name ?? undefined },
    params: {
      url: params.url,
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
  await sendBetterAuthEmail("password_reset", {
    to: { email: params.email, name: params.name ?? undefined },
    params: {
      url: params.url,
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
  await sendBetterAuthEmail("magic_link", {
    to: { email: params.email },
    params: {
      url: params.url,
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
  await sendBetterAuthEmail("invitation", {
    to: { email: params.email },
    params: {
      inviteLink: params.inviteLink,
      email: params.email,
      invitedByEmail: params.invitedByEmail ?? "",
      invitedByName: params.invitedByName ?? "",
      organizationName: params.organizationName ?? "",
    },
    tags: ["better-auth", "invitation"],
  });
};

export const sendWelcomeEmail = async (params: {
  email: string;
  name?: string | null;
}) => {
  await sendBetterAuthEmail("welcome", {
    to: { email: params.email, name: params.name ?? undefined },
    params: {
      appName: "FastShip",
      userName: params.name ?? "",
    },
    tags: ["better-auth", "welcome"],
  });
};
