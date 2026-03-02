"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type TasksOverTimeData = {
  date: string
  completed: number
  pending: number
  inProgress: number
  total: number
}

type SalesChartProps = {
  tasksOverTime?: TasksOverTimeData[]
  isLoading: boolean
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "var(--primary)",
  },
  inProgress: {
    label: "In Progress",
    color: "var(--primary)",
  },
  pending: {
    label: "Pending",
    color: "var(--primary)",
  },
}

export function SalesChart({ tasksOverTime, isLoading }: SalesChartProps) {
  const [timeRange, setTimeRange] = useState("90d")

  if (isLoading) {
    return (
      <Card className="cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Tasks Over Time</CardTitle>
            <CardDescription>Task completion trends</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <div className="px-6 pb-6">
            <Skeleton className="h-[350px] w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = tasksOverTime || []

  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Tasks Over Time</CardTitle>
          <CardDescription>Task completion trends</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d" className="cursor-pointer">Last 30 days</SelectItem>
              <SelectItem value="90d" className="cursor-pointer">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="cursor-pointer">
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <div className="px-6 pb-6">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-completed)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-completed)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-inProgress)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-inProgress)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-pending)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-pending)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="1"
                stroke="var(--color-completed)"
                fill="url(#colorCompleted)"
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="inProgress"
                stackId="1"
                stroke="var(--color-inProgress)"
                fill="url(#colorInProgress)"
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="pending"
                stackId="1"
                stroke="var(--color-pending)"
                fill="url(#colorPending)"
                strokeWidth={1}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
