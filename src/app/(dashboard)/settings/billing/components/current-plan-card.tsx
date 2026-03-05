import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Crown, AlertTriangle, ExternalLink } from "lucide-react"
import type { CurrentPlan } from "../utils"

export type { CurrentPlan }

interface CurrentPlanCardProps {
  plan: CurrentPlan | null | undefined
  onManageSubscription?: () => void
  manageLoading?: boolean
}

export function CurrentPlanCard({ plan, onManageSubscription, manageLoading }: CurrentPlanCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            {plan === undefined
              ? "Loading your plan..."
              : plan === null
                ? "You are not on a paid plan."
                : `You are currently on the ${plan.planName}.`}
          </CardDescription>
        </div>
        {plan != null && onManageSubscription && (
          <Button
            variant="outline"
            size="sm"
            onClick={onManageSubscription}
            disabled={manageLoading}
          >
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            {manageLoading ? "Opening..." : "Manage"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {plan === undefined ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : plan === null ? (
          <p className="text-sm text-muted-foreground">
            Select a plan below to get started.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">{plan.planName}</span>
                <Badge variant="secondary">{plan.status}</Badge>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{plan.price}</div>
                <div className="text-sm text-muted-foreground">Next billing: {plan.nextBilling}</div>
              </div>
            </div>

            {plan.needsAttention && (
              <Card className="border-neutral-200 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800">
                <CardContent>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-neutral-600 mt-0.5 dark:text-neutral-400" />
                    <div className="space-y-1">
                      <p className="font-medium text-neutral-800 dark:text-neutral-400">We need your attention!</p>
                      <p className="text-sm text-neutral-700 dark:text-neutral-400">{plan.attentionMessage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {plan.trial && plan.trial.totalDays > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground font-medium">Days</span>
                  <span className="text-sm text-muted-foreground font-medium">{plan.trial.daysUsed} of {plan.trial.totalDays} Days</span>
                </div>
                <Progress value={plan.trial.progressPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">{plan.trial.remainingDays} days remaining until your plan requires update</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
