import { Id } from "@/convex/_generated/dataModel";

export interface CalendarEvent {
  _id: Id<"events">
  title: string
  date: Date
  time: string
  duration: string
  type: "meeting" | "event" | "personal" | "task" | "reminder"
  attendees: string[]
  location: string
  color: string
  description?: string
  userId: string
  createdAt: number
  updatedAt: number
}

export interface Calendar {
  id: string
  name: string
  color: string
  visible: boolean
  type: "personal" | "work" | "shared"
}
