import { Polar } from "@convex-dev/polar";
import type { UserIdentity } from "convex/server";
import { api, components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";

export const polar: Polar<DataModel> = new Polar<DataModel>(components.polar, {
  getUserInfo: async (
    ctx,
  ): Promise<{ userId: string; email: string }> => {
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
    premiumMonthly: "premium_monthly_placeholder",
    premiumYearly: "premium_yearly_placeholder",
  },
  server: "sandbox",
});

export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getConfiguredProducts,
  listAllProducts,
  listAllSubscriptions,
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();
