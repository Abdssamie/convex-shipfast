import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { authComponent, createAuth } from "../auth/auth";

/**
 * Create a new organization
 */
export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    
    const organization = await auth.api.createOrganization({
      body: {
        name: args.name,
        slug: args.slug || args.name.toLowerCase().replace(/\s+/g, "-"),
        metadata: args.description ? { description: args.description } : undefined,
      },
      headers,
    });

    return organization;
  },
});

/**
 * Invite a member to the organization
 */
export const inviteMember = mutation({
  args: {
    email: v.string(),
    role: v.optional(v.union(v.literal("owner"), v.literal("admin"), v.literal("member"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    
    const invitation = await auth.api.createInvitation({
      body: {
        email: args.email,
        role: args.role || "member",
      },
      headers,
    });

    return invitation;
  },
});

/**
 * Remove a member from the organization
 */
export const removeMember = mutation({
  args: {
    memberIdOrEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    
    await auth.api.removeMember({
      body: {
        memberIdOrEmail: args.memberIdOrEmail,
      },
      headers,
    });

    return { success: true };
  },
});

/**
 * Leave the current organization
 */
export const leaveOrganization = mutation({
  args: {
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    
    // Get current organization if not provided
    let orgId = args.organizationId;
    if (!orgId) {
      const currentOrg = await auth.api.getFullOrganization({ headers }).catch(() => null);
      if (!currentOrg) {
        throw new Error("No active organization");
      }
      orgId = currentOrg.id;
    }
    
    await auth.api.leaveOrganization({
      body: {
        organizationId: orgId,
      },
      headers,
    });

    return { success: true };
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
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    
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

    return organization;
  },
});

/**
 * Set the active organization for the current session
 */
export const setActiveOrganization = mutation({
  args: {
    organizationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    
    await auth.api.setActiveOrganization({
      body: {
        organizationId: args.organizationId,
      },
      headers,
    });

    return { success: true };
  },
});
