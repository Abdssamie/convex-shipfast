"use client"

import { useState } from "react"
import type { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useMutation } from "convex/react"
import { toast } from "sonner"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { taskSchema } from "../data/schema"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const task = taskSchema.parse(row.original)
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteTask = useMutation(api.tasks.remove)
  const updateTask = useMutation(api.tasks.update)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return
    }

    try {
      setIsDeleting(true)
      
      // Validate task ID format before casting
      if (!task.id || typeof task.id !== 'string') {
        throw new Error("Invalid task ID")
      }
      
      await deleteTask({ id: task.id as Id<"tasks"> })
      toast.success("Task deleted successfully")
    } catch (error) {
      toast.error("Failed to delete task")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleMarkComplete = async () => {
    try {
      // Validate task ID format before casting
      if (!task.id || typeof task.id !== 'string') {
        throw new Error("Invalid task ID")
      }
      
      await updateTask({ 
        id: task.id as Id<"tasks">,
        status: "completed"
      })
      toast.success("Task marked as completed")
    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem className="cursor-pointer" onClick={handleMarkComplete}>
          Mark Complete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:text-destructive" 
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
          <DropdownMenuShortcut className="text-destructive">⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
