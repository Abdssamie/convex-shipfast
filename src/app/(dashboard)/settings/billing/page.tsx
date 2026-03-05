"use client"

import { useState } from "react"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PricingPlans } from "@/components/pricing-plans"
import { CurrentPlanCard } from "./components/current-plan-card"
import { BillingHistoryCard } from "./components/billing-history-card"
import { buildPlanData, buildBillingHistory } from "./utils"

// Map app plan IDs to Polar product IDs — replace placeholders with real Polar product IDs.
const PLAN_TO_PRODUCT_MAP: Record<string, string> = {
  basic: "premium_monthly_placeholder",
  professional: "premium_monthly_placeholder",
  enterprise: "premium_yearly_placeholder",
}

// Reverse lookup: Polar product ID → app plan ID
const PRODUCT_TO_PLAN_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(PLAN_TO_PRODUCT_MAP).map(([planId, productId]) => [productId, planId])
)

export default function BillingSettings() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  const generateCheckoutLink = useAction(api.polar.generateCheckoutLink)
  const generateCustomerPortalUrl = useAction(api.polar.generateCustomerPortalUrl)

  // listAllSubscriptions includes active + ended + expired trials
  const subscriptions = useQuery(api.polar.listAllSubscriptions)

  // Active subscription is status active or trialing (not ended)
  const activeSubscription = subscriptions?.find(
    (sub) => sub.status === "active" || sub.status === "trialing"
  )

  // Derive which plan the user is currently on from the Polar product ID
  const currentPlanId = activeSubscription
    ? (PRODUCT_TO_PLAN_MAP[activeSubscription.productId] ?? null)
    : null

  const planData = activeSubscription ? buildPlanData(activeSubscription) : null

  // Build billing history from all subscriptions, sorted newest first
  const billingHistory = subscriptions !== undefined ? buildBillingHistory(subscriptions) : undefined

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentPlanId) return

    const productId = PLAN_TO_PRODUCT_MAP[planId]
    if (!productId) {
      toast.error("Invalid plan selected")
      return
    }

    setLoadingPlanId(planId)
    try {
      const result = await generateCheckoutLink({
        productIds: [productId],
        origin: window.location.origin,
        successUrl: window.location.href,
      })
      if (result?.url) {
        window.location.href = result.url
      } else {
        toast.error("Failed to create checkout session")
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start checkout. Please try again."
      )
    } finally {
      setLoadingPlanId(null)
    }
  }

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const result = await generateCustomerPortalUrl()
      if (result?.url) {
        window.open(result.url, "_blank")
      }
    } catch {
      toast.error("Failed to open customer portal. Please try again.")
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Plans & Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <CurrentPlanCard
          plan={subscriptions === undefined ? undefined : planData}
          onManageSubscription={handleManageSubscription}
          manageLoading={portalLoading}
        />
        <BillingHistoryCard history={billingHistory} />
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose a plan that works best for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PricingPlans
              mode="billing"
              currentPlanId={currentPlanId ?? undefined}
              onPlanSelect={handlePlanSelect}
              loadingPlanId={loadingPlanId}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
