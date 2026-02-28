import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (args.status) {
      tasks = tasks.filter((task) => task.status === args.status);
    }

    if (args.priority) {
      tasks = tasks.filter((task) => task.priority === args.priority);
    }

    if (args.category) {
      tasks = tasks.filter((task) => task.category === args.category);
    }

    return tasks.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== identity.subject) {
      throw new Error("Not authorized to view this task");
    }

    return task;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("in progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    category: v.string(),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.status,
      priority: args.priority,
      category: args.category,
      userId: identity.subject,
      assignedTo: args.assignedTo,
      dueDate: args.dueDate,
      createdAt: now,
      updatedAt: now,
    });

    return taskId;
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    category: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== identity.subject) {
      throw new Error("Not authorized to update this task");
    }

    await ctx.db.patch(args.id, {
      ...(args.title !== undefined && { title: args.title }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.status !== undefined && { status: args.status }),
      ...(args.priority !== undefined && { priority: args.priority }),
      ...(args.category !== undefined && { category: args.category }),
      ...(args.assignedTo !== undefined && { assignedTo: args.assignedTo }),
      ...(args.dueDate !== undefined && { dueDate: args.dueDate }),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== identity.subject) {
      throw new Error("Not authorized to delete this task");
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const inProgress = tasks.filter((t) => t.status === "in progress").length;
    const pending = tasks.filter((t) => t.status === "pending").length;

    return {
      total,
      completed,
      inProgress,
      pending,
    };
  },
});
