import type { EmailFlow } from "../email/config";
import { sendEmail } from "../email";

type BetterAuthEmailPayload = {
  to: { email: string; name?: string };
  params: Record<string, string>;
  tags?: string[];
};

const sendBetterAuthEmail = (flow: EmailFlow, payload: BetterAuthEmailPayload) => {
  void sendEmail({
    flow,
    to: payload.to,
    params: payload.params,
    tags: payload.tags,
  }).catch((error) => {
    console.warn("brevo_email_failed", error);
  });
};

export const sendVerificationEmail = (params: {
  email: string;
  name?: string | null;
  url: string;
}) => {
  sendBetterAuthEmail("email_verification", {
    to: { email: params.email, name: params.name ?? undefined },
    params: {
      url: params.url,
      email: params.email,
      name: params.name ?? "",
    },
    tags: ["better-auth", "email-verification"],
  });
};

export const sendPasswordResetEmail = (params: {
  email: string;
  name?: string | null;
  url: string;
}) => {
  sendBetterAuthEmail("password_reset", {
    to: { email: params.email, name: params.name ?? undefined },
    params: {
      url: params.url,
      email: params.email,
      name: params.name ?? "",
    },
    tags: ["better-auth", "password-reset"],
  });
};

export const sendMagicLinkEmail = (params: {
  email: string;
  url: string;
}) => {
  sendBetterAuthEmail("magic_link", {
    to: { email: params.email },
    params: {
      url: params.url,
      email: params.email,
    },
    tags: ["better-auth", "magic-link"],
  });
};

export const sendInvitationEmail = (params: {
  email: string;
  invitedByEmail?: string | null;
  invitedByName?: string | null;
  organizationName?: string | null;
  inviteLink: string;
}) => {
  sendBetterAuthEmail("invitation", {
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

export const sendWelcomeEmail = (params: {
  email: string;
  name?: string | null;
}) => {
  sendBetterAuthEmail("welcome", {
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
