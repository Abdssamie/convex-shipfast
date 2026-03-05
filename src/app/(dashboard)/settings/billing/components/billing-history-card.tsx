import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import type { BillingHistoryItem } from "../utils"

export type { BillingHistoryItem }

interface BillingHistoryCardProps {
  history: BillingHistoryItem[] | undefined
}

export function BillingHistoryCard({ history }: BillingHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>
          Your past and current subscription periods.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history === undefined ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No billing history yet.</p>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={item.id}>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">{item.period}</div>
                    <div className="text-sm text-muted-foreground">{item.plan}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{item.amount}</div>
                    <Badge variant="secondary">{item.status}</Badge>
                  </div>
                </div>
                {index < history.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
