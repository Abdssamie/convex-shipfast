"use client"

import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar 
} from "lucide-react"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type Stats = {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  completionRate: string
  highPriorityTasks: number
  upcomingEvents: number
  totalEvents: number
}

type MetricsOverviewProps = {
  stats?: Stats
  isLoading: boolean
}

export function MetricsOverview({ stats, isLoading }: MetricsOverviewProps) {
  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const completionRateNum = parseFloat(stats.completionRate)
  const isCompletionUp = completionRateNum >= 50

  const metrics = [
    {
      title: "Total Tasks",
      value: stats.totalTasks.toString(),
      description: "All tasks",
      change: `${stats.completedTasks} completed`,
      trend: "up" as const,
      icon: CheckCircle2,
      footer: `${stats.inProgressTasks} in progress`,
      subfooter: "Track your task completion"
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks.toString(),
      description: "Awaiting action",
      change: `${stats.highPriorityTasks} high priority`, 
      trend: stats.pendingTasks > 0 ? "down" as const : "up" as const,
      icon: Clock,
      footer: "Needs attention",
      subfooter: "Focus on pending items"
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents.toString(),
      description: "Next 7 days",
      change: `${stats.totalEvents} total`,
      trend: "up" as const, 
      icon: Calendar,
      footer: "Stay on schedule",
      subfooter: "Events coming up"
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      description: "Task completion",
      change: isCompletionUp ? "Strong" : "Needs work",
      trend: isCompletionUp ? "up" as const : "down" as const,
      icon: AlertCircle,
      footer: isCompletionUp ? "Strong performance" : "Needs improvement",
      subfooter: "Overall task completion"
    },
  ]

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {metrics.map((metric) => {
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
        
        return (
          <Card key={metric.title} className="cursor-pointer">
            <CardHeader>
              <CardDescription>{metric.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {metric.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon className="h-4 w-4" />
                  {metric.change}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {metric.footer} <TrendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                {metric.subfooter}
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
