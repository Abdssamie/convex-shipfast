import { z } from "zod"
import { Id } from "@/convex/_generated/dataModel"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.custom<Id<"tasks">>((val) => typeof val === "string"),
  title: z.string(),
  status: z.string(),
  category: z.string(),
  priority: z.string(),
})

export type Task = z.infer<typeof taskSchema>
