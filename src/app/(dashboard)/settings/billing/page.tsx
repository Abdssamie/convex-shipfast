"use client"

import { useState } from "react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PricingPlans } from "@/components/pricing-plans"
import { CurrentPlanCard } from "./components/current-plan-card"
import { BillingHistoryCard } from "./components/billing-history-card"

// Import data
import currentPlanData from "./data/current-plan.json"
import billingHistoryData from "./data/billing-history.json"

// Map plan IDs to Polar product IDs
const PLAN_TO_PRODUCT_MAP: Record<string, string> = {
  basic: "premium_monthly_placeholder",
  professional: "premium_monthly_placeholder",
  enterprise: "premium_yearly_placeholder",
}

export default function BillingSettings() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const generateCheckoutLink = useAction(api.polar.generateCheckoutLink)

  const handlePlanSelect = async (planId: string) => {
    // Don't process if already on this plan
    if (planId === "professional") {
      return
    }

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
        // Redirect to Polar checkout
        window.location.href = result.url
      } else {
        toast.error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to start checkout. Please try again."
      )
    } finally {
      setLoadingPlanId(null)
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
          <CurrentPlanCard plan={currentPlanData} />
          <BillingHistoryCard history={billingHistoryData} />
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
                currentPlanId="professional"
                onPlanSelect={handlePlanSelect}
                loadingPlanId={loadingPlanId}
              />
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
