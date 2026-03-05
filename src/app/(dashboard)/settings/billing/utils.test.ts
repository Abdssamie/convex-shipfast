// Tests run with TZ=UTC (set in the "test" npm script) to ensure
// deterministic date formatting regardless of local system timezone.

import { describe, expect, test } from "bun:test";
import {
    formatPrice,
    formatDate,
    daysBetween,
    buildPlanData,
    buildBillingHistory,
    type SubscriptionRecord,
} from "./utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeActiveSub(overrides: Partial<SubscriptionRecord> = {}): SubscriptionRecord {
    return {
        id: "sub_1",
        status: "active",
        product: { name: "Pro Plan" },
        amount: 1999,
        currency: "usd",
        currentPeriodStart: "2025-01-01T00:00:00Z",
        currentPeriodEnd: "2025-02-01T12:00:00Z",
        cancelAtPeriodEnd: false,
        ...overrides,
    };
}

// ─── formatPrice ──────────────────────────────────────────────────────────────

describe("formatPrice", () => {
    test("formats whole-dollar amounts without decimals", () => {
        expect(formatPrice(1000, "usd")).toBe("$10");
    });

    test("formats sub-dollar amounts with two decimal places", () => {
        expect(formatPrice(999, "usd")).toBe("$9.99");
    });

    test("formats zero as $0", () => {
        expect(formatPrice(0, "usd")).toBe("$0");
    });

    test("accepts lowercase currency codes", () => {
        expect(formatPrice(2999, "usd")).toBe("$29.99");
    });

    test("accepts uppercase currency codes", () => {
        expect(formatPrice(2999, "USD")).toBe("$29.99");
    });

    test("formats large amounts correctly", () => {
        expect(formatPrice(99900, "usd")).toBe("$999");
    });

    test("formats EUR currency using the EUR symbol", () => {
        const result = formatPrice(1000, "eur");
        // The exact symbol varies by Node/Bun locale, but the number must be present
        expect(result).toContain("10");
        expect(result.toUpperCase()).toMatch(/€|EUR/);
    });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe("formatDate", () => {
    // Using noon-UTC timestamps so the calendar day is unambiguous in any timezone
    // within ±11 h of UTC. The npm test script sets TZ=UTC for full determinism.

    test("formats a mid-month date", () => {
        expect(formatDate("2025-01-15T12:00:00.000Z")).toBe("Jan 15, 2025");
    });

    test("formats a first-of-month date", () => {
        expect(formatDate("2025-06-01T12:00:00.000Z")).toBe("Jun 1, 2025");
    });

    test("formats end-of-year date correctly", () => {
        expect(formatDate("2025-12-31T12:00:00.000Z")).toBe("Dec 31, 2025");
    });

    test("formats a date in a different year", () => {
        expect(formatDate("2024-03-20T12:00:00.000Z")).toBe("Mar 20, 2024");
    });
});

// ─── daysBetween ──────────────────────────────────────────────────────────────

describe("daysBetween", () => {
    test("returns 7 for a one-week span", () => {
        expect(daysBetween("2025-01-01T00:00:00Z", "2025-01-08T00:00:00Z")).toBe(7);
    });

    test("returns 0 for identical timestamps", () => {
        expect(daysBetween("2025-01-01T00:00:00Z", "2025-01-01T00:00:00Z")).toBe(0);
    });

    test("clamps negative intervals to 0 when end is before start", () => {
        expect(daysBetween("2025-01-08T00:00:00Z", "2025-01-01T00:00:00Z")).toBe(0);
    });

    test("rounds a 1.5-day span to 2", () => {
        expect(daysBetween("2025-01-01T00:00:00Z", "2025-01-02T12:00:00Z")).toBe(2);
    });

    test("handles a 31-day January span", () => {
        expect(daysBetween("2025-01-01T00:00:00Z", "2025-02-01T00:00:00Z")).toBe(31);
    });

    test("handles a 14-day trial span", () => {
        expect(daysBetween("2025-01-01T00:00:00Z", "2025-01-15T00:00:00Z")).toBe(14);
    });
});

// ─── buildPlanData ────────────────────────────────────────────────────────────

describe("buildPlanData", () => {
    test("returns status 'Active' for an active subscription", () => {
        expect(buildPlanData(makeActiveSub()).status).toBe("Active");
    });

    test("uses product.name as planName", () => {
        const plan = buildPlanData(makeActiveSub({ product: { name: "Enterprise Plan" } }));
        expect(plan.planName).toBe("Enterprise Plan");
    });

    test("falls back to 'Paid Plan' when product is null", () => {
        expect(buildPlanData(makeActiveSub({ product: null })).planName).toBe("Paid Plan");
    });

    test("falls back to 'Paid Plan' when product is undefined", () => {
        expect(buildPlanData(makeActiveSub({ product: undefined })).planName).toBe("Paid Plan");
    });

    test("formats the price from amount + currency", () => {
        expect(buildPlanData(makeActiveSub({ amount: 2999, currency: "usd" })).price).toBe("$29.99");
    });

    test("returns 'N/A' for price when amount is null", () => {
        expect(buildPlanData(makeActiveSub({ amount: null })).price).toBe("N/A");
    });

    test("returns 'N/A' for price when currency is null", () => {
        expect(buildPlanData(makeActiveSub({ currency: null })).price).toBe("N/A");
    });

    test("formats nextBilling from currentPeriodEnd", () => {
        const plan = buildPlanData(makeActiveSub({ currentPeriodEnd: "2025-06-15T12:00:00Z" }));
        expect(plan.nextBilling).toBe("Jun 15, 2025");
    });

    test("returns 'N/A' for nextBilling when currentPeriodEnd is null", () => {
        expect(buildPlanData(makeActiveSub({ currentPeriodEnd: null })).nextBilling).toBe("N/A");
    });

    test("needsAttention is false when cancelAtPeriodEnd is false", () => {
        const plan = buildPlanData(makeActiveSub({ cancelAtPeriodEnd: false }));
        expect(plan.needsAttention).toBe(false);
        expect(plan.attentionMessage).toBe("");
    });

    test("needsAttention is true and message is set when cancelAtPeriodEnd is true", () => {
        const plan = buildPlanData(makeActiveSub({ cancelAtPeriodEnd: true }));
        expect(plan.needsAttention).toBe(true);
        expect(plan.attentionMessage).toContain("cancel at the end of the current billing period");
    });

    test("trial is undefined for a non-trialing subscription", () => {
        expect(buildPlanData(makeActiveSub()).trial).toBeUndefined();
    });

    test("returns status 'Trial' for a trialing subscription", () => {
        const plan = buildPlanData(
            makeActiveSub({
                status: "trialing",
                trialStart: "2025-01-01T00:00:00Z",
                trialEnd: "2025-01-15T00:00:00Z",
            }),
            new Date("2025-01-08T00:00:00Z"),
        );
        expect(plan.status).toBe("Trial");
    });

    test("computes trial progress correctly at the midpoint", () => {
        // Trial: Jan 1 → Jan 15 (14 days). Now = Jan 8 (7 days used).
        const plan = buildPlanData(
            makeActiveSub({
                status: "trialing",
                trialStart: "2025-01-01T00:00:00Z",
                trialEnd: "2025-01-15T00:00:00Z",
            }),
            new Date("2025-01-08T00:00:00Z"),
        );
        expect(plan.trial).toBeDefined();
        expect(plan.trial?.totalDays).toBe(14);
        expect(plan.trial?.daysUsed).toBe(7);
        expect(plan.trial?.remainingDays).toBe(7);
        expect(plan.trial?.progressPercentage).toBe(50);
    });

    test("caps progressPercentage at 100 when past trial end", () => {
        const plan = buildPlanData(
            makeActiveSub({
                status: "trialing",
                trialStart: "2025-01-01T00:00:00Z",
                trialEnd: "2025-01-15T00:00:00Z",
            }),
            new Date("2025-01-25T00:00:00Z"), // 10 days past trial end
        );
        expect(plan.trial?.progressPercentage).toBe(100);
        expect(plan.trial?.remainingDays).toBe(0);
    });

    test("trial is undefined when trialStart is null even if status is trialing", () => {
        const plan = buildPlanData(
            makeActiveSub({
                status: "trialing",
                trialStart: null,
                trialEnd: "2025-01-15T00:00:00Z",
            }),
            new Date("2025-01-08T00:00:00Z"),
        );
        expect(plan.trial).toBeUndefined();
    });

    test("trial is undefined when trialEnd is null even if status is trialing", () => {
        const plan = buildPlanData(
            makeActiveSub({
                status: "trialing",
                trialStart: "2025-01-01T00:00:00Z",
                trialEnd: null,
            }),
            new Date("2025-01-08T00:00:00Z"),
        );
        expect(plan.trial).toBeUndefined();
    });
});

// ─── buildBillingHistory ──────────────────────────────────────────────────────

describe("buildBillingHistory", () => {
    test("returns an empty array for empty input", () => {
        expect(buildBillingHistory([])).toEqual([]);
    });

    test("maps a single subscription to the correct BillingHistoryItem shape", () => {
        const [item] = buildBillingHistory([
            makeActiveSub({
                id: "sub_1",
                currentPeriodStart: "2025-01-01T12:00:00Z",
                product: { name: "Pro Plan" },
                amount: 1999,
                currency: "usd",
                status: "active",
            }),
        ]);
        expect(item.id).toBe("sub_1");
        expect(item.plan).toBe("Pro Plan");
        expect(item.amount).toBe("$19.99");
        expect(item.status).toBe("Active");
        expect(item.period).toBe("Jan 1, 2025");
    });

    test("maps 'active' status to 'Active'", () => {
        const [item] = buildBillingHistory([makeActiveSub({ id: "s1", status: "active" })]);
        expect(item.status).toBe("Active");
    });

    test("maps 'canceled' status to 'Canceled'", () => {
        const [item] = buildBillingHistory([makeActiveSub({ id: "s1", status: "canceled" })]);
        expect(item.status).toBe("Canceled");
    });

    test("maps 'trialing' status to 'Trial'", () => {
        const [item] = buildBillingHistory([makeActiveSub({ id: "s1", status: "trialing" })]);
        expect(item.status).toBe("Trial");
    });

    test("passes unknown statuses through unchanged", () => {
        const [item] = buildBillingHistory([makeActiveSub({ id: "s1", status: "paused" })]);
        expect(item.status).toBe("paused");
    });

    test("falls back plan name to 'Paid Plan' when product is null", () => {
        const [item] = buildBillingHistory([makeActiveSub({ id: "s1", product: null })]);
        expect(item.plan).toBe("Paid Plan");
    });

    test("shows 'N/A' for amount when amount is null", () => {
        const [item] = buildBillingHistory([makeActiveSub({ id: "s1", amount: null })]);
        expect(item.amount).toBe("N/A");
    });

    test("sorts subscriptions by currentPeriodStart descending (newest first)", () => {
        const subs: SubscriptionRecord[] = [
            makeActiveSub({ id: "old", currentPeriodStart: "2025-01-01T00:00:00Z" }),
            makeActiveSub({ id: "new", currentPeriodStart: "2025-03-01T00:00:00Z" }),
            makeActiveSub({ id: "mid", currentPeriodStart: "2025-02-01T00:00:00Z" }),
        ];
        const result = buildBillingHistory(subs);
        expect(result.map((i) => i.id)).toEqual(["new", "mid", "old"]);
    });

    test("does not mutate the input array order", () => {
        const subs: SubscriptionRecord[] = [
            makeActiveSub({ id: "old", currentPeriodStart: "2025-01-01T00:00:00Z" }),
            makeActiveSub({ id: "new", currentPeriodStart: "2025-03-01T00:00:00Z" }),
        ];
        const originalOrder = subs.map((s) => s.id);
        buildBillingHistory(subs);
        expect(subs.map((s) => s.id)).toEqual(originalOrder);
    });
});
