import { action } from "../../_generated/server";
import { v } from "convex/values";
import { authComponent, createAuth } from "../auth/auth";

/**
 * Invite a member to the organization.
 */
export const inviteMember = action({
    args: {
        email: v.string(),
        role: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("member"))),
    },
    handler: async (ctx, args): Promise<
        | { ok: true; data: { id: string; email: string; role: string | null; status: string; expiresAt?: number; createdAt?: number } }
        | { ok: false; error: string }
    > => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return { ok: false, error: "Not authenticated" };
        }

        const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

        try {
            const invitation = await auth.api.createInvitation({
                body: {
                    email: args.email,
                    role: args.role ?? "member",
                },
                headers,
            });

            if (!invitation) {
                return { ok: false, error: "Failed to create invitation" };
            }

            return {
                ok: true,
                data: {
                    id: invitation.id,
                    email: invitation.email,
                    role: invitation.role,
                    status: invitation.status,
                    expiresAt: invitation.expiresAt?.getTime(),
                    createdAt: invitation.createdAt?.getTime(),
                },
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.toLowerCase().includes("already invited")) {
                return { ok: false, error: `${args.email} has already been invited to this organization` };
            }
            if (message.toLowerCase().includes("failed to send invitation email")) {
                return { ok: false, error: "Invitation created but the email could not be delivered. Please try again or check your email configuration." };
            }
            return { ok: false, error: "Failed to send invitation" };
        }
    },
});

/**
 * Resend an invitation email to a previously invited member.
 * Uses better-auth's native resend:true flag — no cancel+create needed.
 */
export const resendInvitation = action({
    args: {
        email: v.string(),
        role: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("member"))),
    },
    handler: async (ctx, args): Promise<{ ok: true } | { ok: false; error: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return { ok: false, error: "Not authenticated" };
        }

        const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

        try {
            await auth.api.createInvitation({
                body: {
                    email: args.email,
                    role: args.role ?? "member",
                    resend: true,
                },
                headers,
            });
            return { ok: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.toLowerCase().includes("failed to send invitation email")) {
                return { ok: false, error: "Could not resend invitation email. Please check your email configuration." };
            }
            return { ok: false, error: "Failed to resend invitation" };
        }
    },
});

/**
 * Cancel a pending invitation.
 */
export const cancelInvitation = action({
    args: {
        invitationId: v.string(),
    },
    handler: async (ctx, args): Promise<{ ok: true } | { ok: false; error: string }> => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return { ok: false, error: "Not authenticated" };
        }

        const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

        try {
            await auth.api.cancelInvitation({
                body: { invitationId: args.invitationId },
                headers,
            });
            return { ok: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return { ok: false, error: message || "Failed to cancel invitation" };
        }
    },
});
