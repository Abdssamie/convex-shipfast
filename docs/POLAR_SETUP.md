# Polar Billing Integration Setup Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Account Setup](#account-setup)
3. [Creating Products and Pricing Plans](#creating-products-and-pricing-plans)
4. [API Keys Configuration](#api-keys-configuration)
5. [Webhook Setup](#webhook-setup)
6. [Environment Variables](#environment-variables)
7. [Testing with Sandbox Mode](#testing-with-sandbox-mode)
8. [Creating Checkout Sessions](#creating-checkout-sessions)
9. [Subscription Lifecycle Management](#subscription-lifecycle-management)
10. [Customer Portal Integration](#customer-portal-integration)
11. [Troubleshooting](#troubleshooting)
12. [Production Checklist](#production-checklist)

---

## Introduction

### What is Polar?

Polar is a modern billing and subscription management platform designed for developers. It provides a simple API for handling payments, subscriptions, and customer management without the complexity of traditional payment processors.

### Why Polar for convex-shipfast?

- **Developer-First**: Clean API design that integrates seamlessly with Convex
- **Built-in Components**: The `@convex-dev/polar` package provides ready-to-use Convex components
- **Subscription Management**: Handles the full subscription lifecycle automatically
- **Sandbox Mode**: Test your integration without real payments
- **Customer Portal**: Built-in portal for customers to manage their subscriptions
- **Webhook Support**: Real-time updates for subscription events

### Architecture Overview

```
┌─────────────────┐
│   Next.js App   │
│  (Frontend UI)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Convex Backend │
│   (polar.ts)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Polar API      │
│  (Billing)      │
└─────────────────┘
```

---

## Account Setup

### Step 1: Create a Polar Account

1. Visit [polar.sh](https://polar.sh)
2. Click "Sign Up" or "Get Started"
3. Choose your signup method:
   - GitHub (recommended for developers)
   - Email and password
4. Complete the email verification process

### Step 2: Complete Your Profile

1. Navigate to your dashboard
2. Fill in your organization details:
   - Organization name
   - Business type
   - Contact information
3. Set up your payment details (required for production)

### Step 3: Enable Sandbox Mode

1. In your Polar dashboard, navigate to **Settings** → **Developer**
2. Toggle **Sandbox Mode** to ON
3. This allows you to test without processing real payments

> **Note**: Sandbox mode is perfect for development and testing. All transactions in sandbox mode are simulated.

---

## Creating Products and Pricing Plans

### Step 1: Navigate to Products

1. In your Polar dashboard, click **Products** in the sidebar
2. Click **Create Product**

### Step 2: Create Your First Product

For the convex-shipfast project, we recommend creating three products matching the pricing tiers:

#### Basic Plan
- **Name**: Basic Plan
- **Description**: Perfect for small online stores
- **Price**: $19/month
- **Billing Interval**: Monthly
- **Features**: Add your feature list in the description

#### Professional Plan (Most Popular)
- **Name**: Professional Plan
- **Description**: Ideal for growing businesses
- **Price**: $79/month
- **Billing Interval**: Monthly
- **Features**: Add your feature list in the description

#### Enterprise Plan
- **Name**: Enterprise Plan
- **Description**: For high-volume stores
- **Price**: $199/month
- **Billing Interval**: Monthly
- **Features**: Add your feature list in the description

### Step 3: Get Product IDs

After creating each product:

1. Click on the product in your dashboard
2. Copy the **Product ID** (format: `prod_xxxxxxxxxxxxx`)
3. Save these IDs - you'll need them for configuration

Example Product IDs:
```
Basic Plan:        prod_basic_xxxxxxxxxxxxx
Professional Plan: prod_professional_xxxxxxxxxxxxx
Enterprise Plan:   prod_enterprise_xxxxxxxxxxxxx
```

### Step 4: Optional - Create Yearly Plans

If you want to offer yearly billing:

1. Create additional products with yearly intervals
2. Typically offer a discount (e.g., 2 months free)
3. Example: Professional Yearly at $790/year (saves $158)

---

## API Keys Configuration

### Step 1: Access API Keys

1. Navigate to **Settings** → **Developer** → **API Keys**
2. You'll see two types of keys:
   - **Sandbox Keys**: For testing
   - **Production Keys**: For live transactions

### Step 2: Generate Sandbox API Key

1. Under **Sandbox Keys**, click **Create API Key**
2. Give it a descriptive name (e.g., `convex-shipfast-sandbox`)
3. Set permissions:
   - ✅ Read products
   - ✅ Create checkouts
   - ✅ Read subscriptions
   - ✅ Manage subscriptions
4. Click **Create**
5. **Important**: Copy the key immediately - it won't be shown again

### Step 3: Generate Production API Key (Later)

> **Warning**: Only create production keys when you're ready to go live.

Follow the same process as sandbox, but under **Production Keys**.

### Step 4: Store Keys Securely

Never commit API keys to version control. Use environment variables (covered in the next section).

---

## Webhook Setup

Webhooks allow Polar to notify your application about subscription events in real-time.

### Step 1: Understanding Webhook Events

Polar sends webhooks for these events:
- `subscription.created` - New subscription started
- `subscription.updated` - Subscription plan changed
- `subscription.canceled` - Subscription canceled
- `subscription.payment_succeeded` - Payment processed successfully
- `subscription.payment_failed` - Payment failed

### Step 2: Configure Webhook Endpoint

The `@convex-dev/polar` component automatically handles webhooks through Convex HTTP endpoints. Your webhook URL will be:
```
https://[your-convex-deployment].convex.cloud/polar/webhook
```

### Step 3: Add Webhook in Polar Dashboard

1. Navigate to **Settings** → **Developer** → **Webhooks**
2. Click **Add Endpoint**
3. Enter your webhook URL:
   - **Development**: Use your Convex dev URL
   - **Production**: Use your production Convex URL
4. Select events to listen for:
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.canceled`
   - ✅ `subscription.payment_succeeded`
   - ✅ `subscription.payment_failed`
5. Click **Create Endpoint**

### Step 4: Verify Webhook Signature (Automatic)

The `@convex-dev/polar` component automatically verifies webhook signatures for security. No additional configuration needed.

### Step 5: Test Webhooks

1. In the Polar dashboard, find your webhook endpoint
2. Click **Send Test Event**
3. Select an event type (e.g., `subscription.created`)
4. Check your Convex logs to verify receipt

---

## Environment Variables

### Step 1: Configure Convex Environment Variables

The Polar integration requires configuration in your Convex deployment:

1. Run `npx convex dashboard` to open your Convex dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```bash
# Polar Configuration
POLAR_ACCESS_TOKEN=your_sandbox_access_token_here
POLAR_ORGANIZATION_ID=your_organization_id_here
```

### Step 2: Get Your Organization ID

1. In Polar dashboard, go to **Settings** → **Organization**
2. Copy your **Organization ID** (format: `org_xxxxxxxxxxxxx`)

### Step 3: Update .env.local (Optional)

For local development, you can add to `.env.local`:

```bash
# Polar Configuration (for reference only - actual config is in Coex)
# POLAR_ACCESS_TOKEN=your_sandbox_access_token_here
# POLAR_ORGANIZATION_ID=your_organization_id_here
```

> **Note**: The Polar integration runs on Convex backend, so environment variables must be set in Convex, not Next.js.

### Step 4: Update Product IDs in Code

Edit `convex/polar.ts` to replace placeholder product IDs:

```typescript
export const polar: Polar<DataModel> = new Polar<DataModel>(components.polar, {
  getUserInfo: async (ctx): Promise<{ userId: string; email: string }> => {
    const user: UserIdentity | null = await ctx.runQuery(
      api.auth.getCurrentUser,
    );
    const userId = user?.subject ?? null;
    const email = user?.email ?? null;
    
    if (!user) {
      throw new Error("No authenticated user found");
    }
    
    if (!userId || !email) {
      throw new Error("Invalid user data: missing id or email");
    }

    return {
      userId,
      email,
    };
  },
  products: {
    premiumMonthly: "prod_professional_xxxxxxxxxxxxx", // Replace with your actual product ID
    premiumYearly: "prod_enterprise_xxxxxxxxxxxxx",    // Replace with your actual product ID
  },
  server: "sandbox", // Change to "production" when going live
});
```

Als `src/app/(dashboard)/settings/billing/page.tsx`:

```typescript
const PLAN_TO_PRODUCT_MAP: Record<string, string> = {
  basic: "prod_basic_xxxxxxxxxxxxx",           // Replace with actual ID
  professional: "prod_professional_xxxxxxxxxxxxx", // Replace with actual ID
  enterprise: "prod_enterprise_xxxxxxxxxxxxx",     // Replace with actual ID
}
```

---

## Testing with Sandbox Mode

### Step 1: Verify Sandbox Configuration

Ensure `convex/polar.ts` has `server: "sandbox"`:

```typescript
export const polar: Polar<DataModel> = new Polar<DataModel>(components.polar, {
  // ... other config
  server: "sandbox", // ✅ Sandbox mode enabled
});
```

### Step 2: Start Your Development Sen
```bash
npm run dev
# or
bun dev
```

### Step 3: Test Checkout Flow

1. Navigate to `http://localhost:3000/settings/billing`
2. Click on a plan's "Upgrade Plan" or "Get Started" button
3. You'll be redirected to Polar's checkout page
4. Use test payment details:
   - **Card Number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date
   - **CVC**: Any 3 digits
   - **ZIP**: Any valid ZIP code

### Step 4: Verify Subscription Creation

1. Complete test checkout
2. You should be redirected back to your billing page
3. Check Convex dashboard → **Data** → Look for subscription records
4. Check Polar dashboard → **Subscriptions** to see the test subscription

### Step 5: Test Webhook Events

1. In Polar dashboard, find the test subscription
2. Try actions like:
   - Updating the subscription
   - Canceling the subscription
3. Check Convex logs to verify webhook events are received

---

## Creating Checkout Sessions

### How It Works

The checkout flow in convex-shipfast:

1. User clicks "Upgrade Plan" button
2. Frontend calls `generateCheckoutLink` action
3. Convex creates a Polar checkout session
4. User is redirected to Polar's hosted checkout
5. After payment, user returns to your app
6. Webhook updates subscription status

### Implementation Details

The checkout is handled in `src/app/(dashboard)/settings/billing/page.tsx`:

```typescript
const handlePlanSelect = async (planId: string) => {
  const productId = PLAN_TO_PRODUCT_MAP[planId]
  
  setLoadingPlanId(planId)

  try {
    const result = await generateCheckoutLink({ 
      productIds: [productId],
      origin: window.location.origin,
      successUrl: window.location.href,
    })
    
    if (result?.url) {
      window.location.href = result.url
    }
  } catch (error) {
    toast.error("Failed to start checkout")
  } finally {
    setLoadingPlanId(null)
  }
}
```

### Customizing Checkout

You can customize the checkout experience by passing additional options:

```typescript
const result = await generateCheckoutLink({ 
  productIds: [productId],
  origin: window.location.origin,
  successUrl: `${window.location.origin}/settings/billing?success=true`,
  cancelUrl: `${window.location.origin}/settings/billing?canceled=true`,
  // Optional: Pre-fill customer information
  customerEmail: user.email,
  customerName: user.name,
})
```

### Handling Success/Cancel URLs

Add URL parameter handling to show appropriate messages:

```typescript
// In your billing page component
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  
  if (params.get('success') === 'true') {
    toast.success('Subscription activated successfully!')
  }
  
  if (params.get('canceled') === 'true') {
    toast.info('Checkout canceled')
  }
}, [])
```

---

## Subscription Lifecycle Management

### Understanding Subscription States

Polar subscriptions have these states:
- `active` - Subscription is active and paid
- `past_due` - Payment failed, retrying
- `canceled` - Subscription canceled
- `incomplete` - Initial payment pending
- `trialing` - In trial period (if configured)

### Querying User Subscriptions

Use the provided Convex queries:

```typescript
// In your React component
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

function MyComponent() {
  const subscriptions = useQuery(api.polar.listAllSubscriptions)
  
  // Find active subscription
  const activeSubscription = subscriptions?.find(
    sub => sub.status === 'active'
  )
  
  return (
    <div>
      {activeSubscription ? (
        <p>Plan: {activeSubscription.productName}</p>
      ) : (
        <p>No active subscription</p>
      )}
    </div>
  )
}
```

### Changing Subscriptions

Allow users to upgrade or downgrade:

```typescript
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"

function UpgradeButton() {
  const changeSubscription = useAction(api.polar.changeCurrentSubscription)
  
  const handleUpgrade = async () => {
    try {
      await changeSubscription({
        newProductId: "prod_professional_xxxxxxxxxxxxx",
      })
      toast.success("Subscription updated!")
    } catch (error) {
      toast.error("Failed to update subscription")
    }
  }
  
  return <button onClick={handleUpgrade}>Upgrade to Professional</button>
}
```

### Canceling Subscriptions

```typescript
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"

function CancelButton() {
  const cancelSubscription = useAction(api.polar.cancelCurrentSubscription)
  
  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel?")) return
    
    try {
      await cancelSubscription()
      toast.success("Subscription canceled")
    } catch (error) {
      toast.error("Failed to cancel subscription")
    }
  }
  
  return <button onClick={handleCancel}>Cancel Subscription</button>
}
```

### Handling Webhook Events

The `@convex-dev/polar` component automatically handles webhooks and updates your database. You can add custom logic by creating Convex functions that react to subscription changes:

```typescript
// convex/subscriptions.ts
import { v } from "convex/values"
import { internalMutation } from "./_generated/server"

export const onSubscriptionCreated = internalMutation({
  args: {
    userId: v.string(),
    subscriptionId: v.string(),
    productId: v.string(),
  },
  handler: async (ctx, args) => {
    // Custom logic when subscription is created
    // e.g., send welcome email, grant access, etc.
    
    console.log(`New subscription for user ${args.userId}`)
    
    // Update user record with subscription info
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first()
    
    if (user) {
      await ctx.db.patch(user._id, {
        subscriptionStatus: "active",
        subscriptionId: args.subscriptionId,
      })
    }
  },
})
```

---

## Customer Portal Integration

### What is the Customer Portal?

The Polar Customer Portal allows your users to:
- View subscription details
- Update payment methods
- View billing history
- Cancel subscriptions
- Download invoices

### Generating Portal Links

```typescript
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"

function ManageSubscriptionButton() {
  const generatePortalUrl = useAction(api.polar.generateCustomerPortalUrl)
  
  const handleManageSubscription = async () => {
    try {
      const result = await generatePortalUrl({
        returnUrl: window.location.href,
      })
      
      if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      toast.error("Failed to open customer portal")
    }
  }
  
  return (
    <button onClick={handleManageSubscription}>
      Manage Subscription
    </button>
  )
}
```

### Adding to Billing Page

Update `src/app/(dashboard)/settings/billing/page.tsx` to include a "Manage Subscription" button:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Subscription Management</CardTitle>
    <CardDescription>
      Manage your payment methods and billing information
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Button onClick={handleOpenCustomerPortal}>
      Open Customer Portal
    </Button>
  </CardContent>
</Card>
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "No authenticated user found"

**Cause**: User is not logged in or session expired

**Solution**:
1. Verify user is authenticated before accessing billing pages
2. Add authentication checks:
```typescript
const user = useQuery(api.auth.getCurrentUser)

if (!user) {
  return <div>Please log in to access billing</div>
}
```

#### Issue: "Invalid product ID"

**Cause**: Product ID doesn't exist or is incorrect

**Solution**:
1. Verify product IDs in Polar dashboard
2. Check `convex/polar.ts` configuration
3. Ensure product IDs match exactly (case-sensitive)

#### Issue: Webhooks not received

**Cause**: Webhook URL incorrect or endpoint not accessible

**Solution**:
1. Verify webhook URL in Polar dashboard
2. Check Convex logs for errors
3. Ensure webhook endpoint is deployed
4. Test with "Send Test Event" in Polar dashboard

#### Issue: "Checkout session creation failed"

**Cause**: Missing required parameters or invalid configuration

**Solution**:
1. Check Convex environment variables are set
2. Verify API s correct permissions
3. Check Convex logs for detailed error messages
4. Ensure `origin` and `successUrl` are valid URLs

#### Issue: Subscription not showing after payment

**Cause**: Webhook delay or processing error

**Solution**:
1. Wait a few seconds and refresh
2. Check Polar dashboard to verify subscription exists
3. Check Convex logs for webhook processing errors
4. Manually trigger webhook from Polar dashboard

### Debugging Tips

#### Enable Detailed Logging

Add logging to `convex/polar.ts`:

```typescript
export const polar: Polar<DataModel> = new Polar<DataModel>(components.polar, {
  getUserInfo: async (ctx) => {
    const user = await ctx.runQuery(api.auth.getCurrentUser)
    console.log("Getting user info for Polar:", user?.subject)
    // ... rest of code
  },
  // ... rest of config
})
```

#### Check Convex Logs

```bash
npx convex logs
```

Look for:
- Webhook events
- Error messages
- API call responses

#### Verify Database State

1. Open Convex dashboard
2. Navigate to **Data**
3. Check tables created by Polar component
4. Verify subscription records exist

---

## Production Checklist

Before going live with Polar billing:

### 1. Account Configuration

- [ ] Completeunt verification
- [ ] Add business information
- [ ] Set up payout methods
- [ ] Configure tax settings (if applicable)

### 2. Products and Pricing

- [ ] Create all production products
- [ ] Verify pricing is correct
- [ ] Test all product IDs
- [ ] Set up any promotional pricing

### 3. API Keys

- [ ] Generate production API keys
- [ ] Store keys securely in Convex environment variables
- [ ] Remove or disable sandbox keys
- [ ] Rotate keys if they were exposed

### 4. Code Configuration

- [ ] Update `convex/polar.ts` with production product IDs
- [ ] Change `server: "sandbox"` to `server: "production"`
- [ ] Update product mapping in billing page
- [ ] Remove any test/debug code

### 5. Webhooks

- [ ] Configure production webhook URL
- [ ] Verify webhook signature validation
- [ ] Test all webhook events in production
- [ ] Set up webhook monitoring/alerts

### 6. Testing

- [ ] Test complete checkout flow
- [ ] Test subscription upgrades
- [ ] Test subscription downgrades
- [ ] Test subscription cancellation
- [ ] Test customer portal access
- [ ] Test failed payment scenarios
- [ ] Verify email notifications work

### 7. Security

- [ ] Verify all API keys are in environment variables
- [ ] Check no sensitive data in client-side code
- [ ] Verify webhook signature validation is enabled
- [ ] Review error messages don't expose sensitive info

### 8. User Experience

- [ ] Add loading states for all billing actions
- [ ] Add error handling with user-friendly messages
- [ ] Test on mobile devices
- [ ] Verify success/cancel redirects work
- [ ] Add confirmation dialogs for destructive actions

### 9. Monitoring

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor webhook delivery
- [ ] Track subscription metrics
- [ ] Set up alerts for failed payments

### 10. Documentation

- [ ] Document your pricing plans
- [ ] Create internal runbook for billing issues
- [ ] Document refund process
- [ ] Create customer FAQ

### 11. Legal and Compliance

- [ ] Update terms of service
- [ ] Update privacy policy
- [ ] Add billing terms
- [ ] Ensure GDPR compliance (if applicable)

### 12. Deployment

- [ ] Deploy to production environment
- [ ] Verify environment variables are set
- [ ] Test with real payment (small amount)
- [ ] Monitor logs for first few transactions

---

## Additional Resources

### Documentation

- [Polar Documentation](https://docs.polar.sh)
- [@convex-dev/polar Package](https://www.npmjs.com/package/@convex-dev/polar)
- [Convex Documentation](https://docs.convex.dev)### Support

- **Polar Support**: support@polar.sh
- **Polar Discord**: [Join Community](https://discord.gg/polar)
- **Convex Discord**: [Join Community](https://discord.gg/convex)

### Example Code

Check these files in the project for reference:
- `convex/polar.ts` - Polar configuration
- `src/app/(dashboard)/settings/billing/page.tsx` - Billing page implementation
- `src/components/pricing-plans.tsx` - Pricing display component
- `convex/convex.config.ts` - Convex app configuration

---

## Next Steps

After completing this setup:

1. **Test thoroughly** in sandbox mode
2. **Customize** the pricing plans to match your business
3. **Add features** like trial periods or promotional codes
4. **Monitor** your first transactions closely
5. **Iterate** based on user feedback

Good luck with your billing integration! 🚀
