"use client"

import { ArrowUp, BarChart3, CheckCircle2, Clock, ListTodo } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import type { Task } from "./data/schema"

// Map backend priority to frontend priority
const mapPriority = (backendPriority: "low" | "medium" | "high"): string => {
  const priorityMap = {
    low: "minor",
    medium: "normal",
    high: "important",
  }
  return priorityMap[backendPriority] || "normal"
}

export default function TaskPage() {
  const backendTasks = useQuery(api.tasks.list, {})
  const stats = useQuery(api.tasks.getStats, {})

  const loading = backendTasks === undefined || stats === undefined

  // Map backend tasks to frontend Task type
  const tasks: Task[] = backendTasks?.map(task => ({
    id: task._id,
    title: task.title,
    status: task.status === "cancelled" ? "pending" : task.status,
    category: task.category,
    priority: mapPriority(task.priority),
  })) ?? []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">
          A powerful task and issue tracker built with Tanstack Table.
        </p>
      </div>

      {/* Mobile view placeholder - shows message instead of images */}
      <div className="md:hidden px-4 md:px-6">
        <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/20">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Tasks Dashboard</h3>
            <p className="text-muted-foreground">
              Please use a larger screen to view the full tasks interface.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden h-full flex-1 flex-col space-y-6 px-4 md:px-6 md:flex">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Tasks</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats?.total ?? 0}</span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <ListTodo className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Completed</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats?.completed ?? 0}</span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <CheckCircle2 className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">In Progress</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats?.inProgress ?? 0}</span>
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {stats && stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <Clock className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Pending</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats?.pending ?? 0}</span>
                    <span className="flex items-center gap-0.5 text-sm text-orange-500">
                      <ArrowUp className="size-3.5" />
                      {stats && stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg p-3">
                  <BarChart3 className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Task Management</CardTitle>
            <CardDescription>
              View, filter, and manage all your project tasks in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={tasks} columns={columns} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
