import { v } from "convex/values";
import { query } from "./_generated/server";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    
    // Get all tasks for the user
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get all events for the user
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Calculate task statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in progress").length;
    const pendingTasks = tasks.filter((t) => t.status === "pending").length;
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 
      ? ((completedTasks / totalTasks) * 100).toFixed(1)
      : "0.0";

    // Calculate high priority tasks
    const highPriorityTasks = tasks.filter((t) => t.priority === "high").length;

    // Calculate upcoming events (next 7 days)
    const now = Date.now();
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
    const upcomingEvents = events.filter(
      (e) => e.date >= now && e.date <= sevenDaysFromNow
    ).length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate,
      highPriorityTasks,
      upcomingEvents,
      totalEvents: events.length,
    };
  },
});

export const getRecentTasks = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const limit = args.limit ?? 10;

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return tasks
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },
});

export const getUpcomingEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const limit = args.limit ?? 10;
    const now = Date.now();

    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return events
      .filter((e) => e.date >= now)
      .sort((a, b) => a.date - b.date)
      .slice(0, limit);
  },
});

export const getTasksOverTime = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const days = args.days ?? 90;

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Create a map of dates to task counts
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;
    
    // Initialize data structure for each day
    const dateMap: Record<string, { completed: number; pending: number; inProgress: number }> = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = { completed: 0, pending: 0, inProgress: 0 };
    }

    // Count tasks by date and status
    tasks.forEach((task) => {
      const taskDate = new Date(task.createdAt);
      const dateStr = taskDate.toISOString().split('T')[0];
      
      if (dateMap[dateStr]) {
        if (task.status === "completed") {
          dateMap[dateStr].completed++;
        } else if (task.status === "pending") {
          dateMap[dateStr].pending++;
        } else if (task.status === "in progress") {
          dateMap[dateStr].inProgress++;
        }
      }
    });

    // Convert to array format for charts
    return Object.entries(dateMap).map(([date, counts]) => ({
      date,
      completed: counts.completed,
      pending: counts.pending,
      inProgress: counts.inProgress,
      total: counts.completed + counts.pending + counts.inProgress,
    }));
  },
});
