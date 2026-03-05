// Pure data-transformation utilities for the billing page.
// No React or UI dependencies — safe to unit-test with Bun.

export interface CurrentPlan {
  planName: string
  price: string
  nextBilling: string
  status: "Active" | "Trial"
  needsAttention: boolean
  attentionMessage: string
  trial?: {
    daysUsed: number
    totalDays: number
    progressPercentage: number
    remainingDays: number
  }
}

export interface BillingHistoryItem {
  id: string
  period: string
  plan: string
  amount: string
  status: "Active" | "Canceled" | "Trial" | (string & {})
}

// Minimal shape required by the utility functions below.
// The full Convex subscription record (returned by listAllSubscriptions)
// is a superset of this type and is structurally assignable to it.
export type SubscriptionRecord = {
  id: string
  status: string
  product?: { name: string } | null
  amount: number | null
  currency: string | null
  currentPeriodStart: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  trialStart?: string | null
  trialEnd?: string | null
}

export function formatPrice(amountInCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amountInCents / 100)
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function daysBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)))
}

// Accepts an optional `now` for deterministic testing (defaults to current time).
export function buildPlanData(sub: SubscriptionRecord, now: Date = new Date()): CurrentPlan {
  const isTrialing = sub.status === "trialing"
  const trialStart = sub.trialStart ?? null
  const trialEnd = sub.trialEnd ?? null

  let trial: CurrentPlan["trial"]
  if (isTrialing && trialStart && trialEnd) {
    const daysUsed = daysBetween(trialStart, now.toISOString())
    const totalDays = daysBetween(trialStart, trialEnd)
    const remainingDays = Math.max(0, totalDays - daysUsed)
    const progressPercentage = totalDays > 0 ? Math.min(100, Math.round((daysUsed / totalDays) * 100)) : 0
    trial = { daysUsed, totalDays, progressPercentage, remainingDays }
  }

  return {
    planName: sub.product?.name ?? "Paid Plan",
    price: sub.amount != null && sub.currency ? formatPrice(sub.amount, sub.currency) : "N/A",
    nextBilling: sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "N/A",
    status: isTrialing ? "Trial" : "Active",
    needsAttention: sub.cancelAtPeriodEnd,
    attentionMessage: sub.cancelAtPeriodEnd
      ? "Your subscription will cancel at the end of the current billing period."
      : "",
    trial,
  }
}

export function buildBillingHistory(subscriptions: SubscriptionRecord[]): BillingHistoryItem[] {
  return subscriptions
    .slice()
    .sort((a, b) => new Date(b.currentPeriodStart).getTime() - new Date(a.currentPeriodStart).getTime())
    .map((sub) => ({
      id: sub.id,
      period: formatDate(sub.currentPeriodStart),
      plan: sub.product?.name ?? "Paid Plan",
      amount: sub.amount != null && sub.currency ? formatPrice(sub.amount, sub.currency) : "N/A",
      status:
        sub.status === "active" ? "Active" :
        sub.status === "canceled" ? "Canceled" :
        sub.status === "trialing" ? "Trial" :
        sub.status,
    }))
}
