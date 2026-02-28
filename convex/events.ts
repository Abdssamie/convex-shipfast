import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Retrieves all events for the authenticated user, sorted by date.
 * 
 * @returns Array of events sorted chronologically by date
 * @throws Error if user is not authenticated
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return events.sort((a, b) => a.date - b.date);
  },
});

export const get = query({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.userId !== identity.subject) {
      throw new Error("Not authorized to view this event");
    }

    return event;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    date: v.number(),
    time: v.string(),
    duration: v.string(),
    type: v.union(
      v.literal("meeting"),
      v.literal("event"),
      v.literal("personal"),
      v.literal("task"),
      v.literal("reminder")
    ),
    attendees: v.array(v.string()),
    location: v.string(),
    color: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const eventId = await ctx.db.insert("events", {
      title: args.title,
      date: args.date,
      time: args.time,
      duration: args.duration,
      type: args.type,
      attendees: args.attendees,
      location: args.location,
      color: args.color,
      description: args.description,
      userId: identity.subject,
      createdAt: now,
      updatedAt: now,
    });

    return eventId;
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    date: v.optional(v.number()),
    time: v.optional(v.string()),
    duration: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("meeting"),
        v.literal("event"),
        v.literal("personal"),
        v.literal("task"),
        v.literal("reminder")
      )
    ),
    attendees: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    color: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.userId !== identity.subject) {
      throw new Error("Not authorized to update this event");
    }

    await ctx.db.patch(args.id, {
      ...(args.title !== undefined && { title: args.title }),
      ...(args.date !== undefined && { date: args.date }),
      ...(args.time !== undefined && { time: args.time }),
      ...(args.duration !== undefined && { duration: args.duration }),
      ...(args.type !== undefined && { type: args.type }),
      ...(args.attendees !== undefined && { attendees: args.attendees }),
      ...(args.location !== undefined && { location: args.location }),
      ...(args.color !== undefined && { color: args.color }),
      ...(args.description !== undefined && { description: args.description }),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const remove = mutation({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.userId !== identity.subject) {
      throw new Error("Not authorized to delete this event");
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});


