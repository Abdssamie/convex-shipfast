import { TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

type SectionCardsProps = {
  stats?: Stats
  isLoading: boolean
}

export function SectionCards({ stats, isLoading }: SectionCardsProps) {
  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Tasks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalTasks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              {stats.completedTasks} completed
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.inProgressTasks} in progress <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Track your task completion
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Tasks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.pendingTasks}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDown />
              Needs attention
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.highPriorityTasks} high priority <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Focus on pending items
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Upcoming Events</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.upcomingEvents}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              Next 7 days
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.totalEvents} total events <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Stay on schedule</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Completion Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.completionRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {isCompletionUp ? <TrendingUp /> : <TrendingDown />}
              {stats.completionRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isCompletionUp ? "Strong" : "Needs improvement"} performance {isCompletionUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">Overall task completion</div>
        </CardFooter>
      </Card>
    </div>
  )
}
