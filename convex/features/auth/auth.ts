import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { magicLink, organization } from "better-auth/plugins";
import { authEmailHandlers } from "./email";
import { components } from "../../_generated/api";
import type { DataModel } from "../../_generated/dataModel";
import authConfig from "./config";
import schema from "./schema";

// Better Auth Component
export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  },
);

// Better Auth Options
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    appName: "FastShip",
    baseURL: process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        authEmailHandlers.sendPasswordResetEmail({
          email: user.email,
          name: user.name,
          url,
        });
      },
    },
    user: {
      deleteUser: {
        enabled: true,
        // TODO: Add delete verification if needed
        // sendDeleteAccountVerification: () => {},
      },
      additionalFields: {
        bio: { type: "string", required: false },
        description: { type: "string", required: false },
        preferences: { type: "json", required: false },
        hasCompletedOnboarding: { type: "boolean", required: false },
      },
    },
    emailVerification: {
      expiresIn: 7200, // 2 hours
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        authEmailHandlers.sendVerificationEmail({
          email: user.email,
          name: user.name,
          url,
        });
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            authEmailHandlers.sendWelcomeEmail({
              email: user.email,
              name: user.name,
            });
          },
        },
      },
      session: {
        create: {
          /**
           * Auto-set the active organization when a new session is created.
           * Looks up the user's earliest org membership so they land in their
           * workspace immediately without a manual "set active org" step.
           * Uses ctx.runQuery with the betterAuth component adapter directly.
           */
          before: async (session) => {
            const result = await ctx.runQuery(
              components.betterAuth.adapter.findMany,
              {
                model: "member",
                where: [{ field: "userId", value: session.userId }],
                sortBy: { field: "createdAt", direction: "asc" },
                paginationOpts: { cursor: null, numItems: 1 },
              },
            );
            const firstOrg = result?.page?.[0] ?? result?.[0] ?? null;
            return {
              data: {
                ...session,
                activeOrganizationId: firstOrg?.organizationId ?? null,
              },
            };
          },
        },
      },
    },
    plugins: [
      convex({ authConfig }),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          authEmailHandlers.sendMagicLinkEmail({ email, url });
        },
      }),
      organization({
        async sendInvitationEmail(data) {
          const siteUrl =
            process.env.SITE_URL ??
            process.env.NEXT_PUBLIC_SITE_URL ??
            "http://localhost:3000";
          const inviteLink = `${siteUrl}/invite/${data.id}`;
          authEmailHandlers.sendInvitationEmail({
            email: data.email,
            invitedByEmail: data.inviter?.user?.email ?? null,
            invitedByName: data.inviter?.user?.name ?? null,
            organizationName: data.organization?.name ?? null,
            inviteLink,
          });
        },
      }),
    ],
  } satisfies BetterAuthOptions;
};



// For `@better-auth/cli`
export const options = createAuthOptions({} as GenericCtx<DataModel>);

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
