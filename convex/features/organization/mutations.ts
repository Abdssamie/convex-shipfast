import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { authComponent, createAuth } from "../auth/auth";

type OrgData = {
  id: string;
  name: string;
  slug: string;
  logo: string | null | undefined;
  metadata: string | null | undefined;
  createdAt: number | undefined;
};

type MutationResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Create a new organization
 */
export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<MutationResult<OrgData>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { ok: false, error: "Not authenticated" };

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    try {
      const organization = await auth.api.createOrganization({
        body: {
          name: args.name,
          slug: args.slug || args.name.toLowerCase().replace(/\s+/g, "-"),
          metadata: args.description ? { description: args.description } : undefined,
        },
        headers,
      });

      if (!organization) return { ok: false, error: "Failed to create organization" };

      return {
        ok: true,
        data: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          metadata: organization.metadata,
          createdAt: organization.createdAt?.getTime(),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, error: message };
    }
  },
});

/**
 * Remove a member from the organization
 */
export const removeMember = mutation({
  args: {
    memberIdOrEmail: v.string(),
  },
  handler: async (ctx, args): Promise<MutationResult<{ success: boolean }>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { ok: false, error: "Not authenticated" };

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    try {
      await auth.api.removeMember({
        body: { memberIdOrEmail: args.memberIdOrEmail },
        headers,
      });
      return { ok: true, data: { success: true } };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, error: message };
    }
  },
});

/**
 * Leave the current organization
 */
export const leaveOrganization = mutation({
  args: {
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<MutationResult<{ success: boolean }>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { ok: false, error: "Not authenticated" };

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    try {
      let orgId = args.organizationId;
      if (!orgId) {
        const currentOrg = await auth.api.getFullOrganization({ headers }).catch(() => null);
        if (!currentOrg) return { ok: false, error: "No active organization" };
        orgId = currentOrg.id;
      }

      await auth.api.leaveOrganization({
        body: { organizationId: orgId },
        headers,
      });
      return { ok: true, data: { success: true } };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, error: message };
    }
  },
});

/**
 * Update organization details
 */
export const updateOrganization = mutation({
  args: {
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<MutationResult<OrgData>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { ok: false, error: "Not authenticated" };

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    try {
      const organization = await auth.api.updateOrganization({
        body: {
          data: {
            name: args.name,
            slug: args.slug,
            metadata: args.description ? { description: args.description } : undefined,
          },
          organizationId: args.organizationId,
        },
        headers,
      });

      if (!organization) return { ok: false, error: "Failed to update organization" };

      return {
        ok: true,
        data: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          metadata: organization.metadata,
          createdAt: organization.createdAt?.getTime(),
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, error: message };
    }
  },
});

/**
 * Set the active organization for the current session
 */
export const setActiveOrganization = mutation({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args): Promise<MutationResult<{ success: boolean }>> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { ok: false, error: "Not authenticated" };

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    try {
      await auth.api.setActiveOrganization({
        body: { organizationId: args.organizationId },
        headers,
      });
      return { ok: true, data: { success: true } };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, error: message };
    }
  },
});
