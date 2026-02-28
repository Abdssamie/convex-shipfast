import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    content: v.optional(v.string()),
    text: v.optional(v.string()),
    role: v.string(),
    createdAt: v.optional(v.number()),
    userId: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    chatId: v.optional(v.string()),
    complete: v.optional(v.boolean()),
    parentId: v.optional(v.string()),
    modelPreference: v.optional(v.string()),
  })
    .index("by_created_at", ["createdAt"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"])
    .index("by_chat", ["chatId"]),

  modelPreferences: defineTable({
    chatId: v.string(),
    model: v.string(),
    lastUpdated: v.number(),
  }).index("by_chat_id", ["chatId"]),

  // New table for archiving chat history
  chat_history: defineTable({
    // Fields copied from the original message
    originalMessageId: v.id("messages"), // Store the original ID for reference
    content: v.optional(v.string()),
    text: v.optional(v.string()),
    role: v.string(),
    originalCreatedAt: v.optional(v.number()), // Original creation time
    userId: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    chatId: v.optional(v.string()),
    parentId: v.optional(v.string()),
    modelPreference: v.optional(v.string()),
    // Archiving specific fields
    archiveSessionId: v.string(), // Groups messages from the same archive operation
    archivedAt: v.number(), // Timestamp when this archive happened
  }).index("by_archive_session", ["archiveSessionId"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("in progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    category: v.string(),
    userId: v.string(),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_category", ["category"]),

  events: defineTable({
    title: v.string(),
    date: v.number(), // timestamp
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
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"])
    .index("by_type", ["type"]),

});
