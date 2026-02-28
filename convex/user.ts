import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent, createAuth } from "./features/auth/auth";

export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await authComponent.safeGetAuthUser(ctx);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    bio: v.optional(v.string()),
    description: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        theme: v.optional(v.string()),
        language: v.optional(v.string()),
        notifications: v.optional(v.boolean()),
        emailUpdates: v.optional(v.boolean()),
      }),),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    await auth.api.updateUser({
      headers,
      body: {
        ...(args.name !== undefined && { name: args.name }),
        ...(args.image !== undefined && { image: args.image }),
        ...(args.bio !== undefined && { bio: args.bio }),
        ...(args.description !== undefined && { description: args.description }),
        ...(args.preferences !== undefined && { preferences: args.preferences }),
      },
    });

    return { success: true };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateAvatar = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Avatar upload failed");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.updateUser({
      headers,
      body: { image: url },
    });

    return { success: true };
  },
});

export const getAvatarUrl = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await authComponent.safeGetAuthUser(ctx);
    return user?.image ?? null;
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
    await auth.api.deleteUser({
      headers,
      body: {},
    });

    return { success: true };
  },
});

export const completeOnboarding = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        theme: v.optional(v.string()),
        notifications: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

    await auth.api.updateUser({
      headers,
      body: {
        ...(args.name !== undefined && { name: args.name }),
        ...(args.image !== undefined && { image: args.image }),
        ...(args.preferences !== undefined && { preferences: args.preferences }),
        hasCompletedOnboarding: true,
      },
    });

    return { success: true };
  },
});
