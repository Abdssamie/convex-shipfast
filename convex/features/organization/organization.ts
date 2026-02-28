import { query } from "../../_generated/server";
import { authComponent, createAuth } from "../auth/auth";

/**
 * Returns the active organization for the current user's session.
 * Mirrors the user.ts pattern using authComponent.getAuth.
 */
export const getCurrentOrganization = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    return await auth.api.getFullOrganization({ headers }).catch(() => null);
  },
});

/**
 * Returns whether the current user belongs to at least one organization.
 * Used by middleware guards and onboarding checks.
 */
export const hasOrganization = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    const orgs = await auth.api.listOrganizations({ headers }).catch(() => null);
    return Array.isArray(orgs) && orgs.length > 0;
  },
});

/**
 * Returns all organizations the current user is a member of,
 * including the user's role in each.
 */
export const listUserOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    return await auth.api.listOrganizations({ headers }).catch(() => []);
  },
});
