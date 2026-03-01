import { describe, expect, test, mock, spyOn, beforeEach, afterEach } from "bun:test";
import { createAuthOptions } from "./auth";
import { authEmailHandlers } from "./email";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { DataModel } from "../../_generated/dataModel";

describe("Better Auth Handlers", () => {
    let mockCtx: Partial<GenericCtx<DataModel>>;
    let runQueryMock: ReturnType<typeof mock>;

    beforeEach(() => {
        runQueryMock = mock(() => Promise.resolve());
        mockCtx = {
            runQuery: runQueryMock as any,
        };

        // Spy on all email handlers to verify they are called correctly
        spyOn(authEmailHandlers, "sendPasswordResetEmail").mockResolvedValue(undefined as any);
        spyOn(authEmailHandlers, "sendVerificationEmail").mockResolvedValue(undefined as any);
        spyOn(authEmailHandlers, "sendWelcomeEmail").mockResolvedValue(undefined as any);
        spyOn(authEmailHandlers, "sendMagicLinkEmail").mockResolvedValue(undefined as any);
        spyOn(authEmailHandlers, "sendInvitationEmail").mockResolvedValue(undefined as any);
    });

    afterEach(() => {
        mock.restore();
    });

    test("emailAndPassword.sendResetPassword calls sendPasswordResetEmail", async () => {
        const options = createAuthOptions(mockCtx as GenericCtx<DataModel>);

        await options.emailAndPassword!.sendResetPassword!({
            user: { email: "test@example.com", name: "Test User" } as any,
            url: "https://reset.link",
        });

        expect(authEmailHandlers.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
        expect(authEmailHandlers.sendPasswordResetEmail).toHaveBeenCalledWith({
            email: "test@example.com",
            name: "Test User",
            url: "https://reset.link"
        });
    });

    test("emailVerification.sendVerificationEmail calls sendVerificationEmail", async () => {
        const options = createAuthOptions(mockCtx as GenericCtx<DataModel>);

        await options.emailVerification!.sendVerificationEmail!({
            user: { email: "test@example.com", name: "Test User" } as any,
            url: "https://verify.link",
        });

        expect(authEmailHandlers.sendVerificationEmail).toHaveBeenCalledTimes(1);
        expect(authEmailHandlers.sendVerificationEmail).toHaveBeenCalledWith({
            email: "test@example.com",
            name: "Test User",
            url: "https://verify.link"
        });
    });

    test("databaseHooks.user.create.after calls sendWelcomeEmail", async () => {
        const options = createAuthOptions(mockCtx as GenericCtx<DataModel>);

        await (options.databaseHooks!.user!.create!.after as any)({
            email: "test@example.com", name: "Test User"
        });

        expect(authEmailHandlers.sendWelcomeEmail).toHaveBeenCalledTimes(1);
        expect(authEmailHandlers.sendWelcomeEmail).toHaveBeenCalledWith({
            email: "test@example.com",
            name: "Test User"
        });
    });

    describe("databaseHooks.session.create.before", () => {
        test("sets activeOrganizationId if user is a member of an org", async () => {
            runQueryMock.mockResolvedValueOnce({
                page: [{ organizationId: "org-123" }]
            });

            const options = createAuthOptions(mockCtx as GenericCtx<DataModel>);
            const hook = options.databaseHooks!.session!.create!.before as any;

            const result = await hook({ userId: "user-456", token: "xyz" });

            expect(runQueryMock).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                data: {
                    userId: "user-456",
                    token: "xyz",
                    activeOrganizationId: "org-123"
                }
            });
        });

        test("sets activeOrganizationId to null if user has no orgs", async () => {
            runQueryMock.mockResolvedValueOnce({ page: [] });

            const options = createAuthOptions(mockCtx as GenericCtx<DataModel>);
            const hook = options.databaseHooks!.session!.create!.before as any;

            const result = await hook({ userId: "user-456", token: "xyz" });

            expect(runQueryMock).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                data: {
                    userId: "user-456",
                    token: "xyz",
                    activeOrganizationId: null
                }
            });
        });
    });

    test("magicLink plugin sendMagicLink calls sendMagicLinkEmail", async () => {
        const options = createAuthOptions(mockCtx as GenericCtx<DataModel>);
        const magicLinkPlugin = options.plugins!.find(p => p.id === "magic-link") as any;

        await magicLinkPlugin.options.sendMagicLink({
            email: "test@example.com",
            url: "https://magic.link"
        });

        expect(authEmailHandlers.sendMagicLinkEmail).toHaveBeenCalledTimes(1);
        expect(authEmailHandlers.sendMagicLinkEmail).toHaveBeenCalledWith({
            email: "test@example.com",
            url: "https://magic.link"
        });
    });

    test("organization plugin sendInvitationEmail calls sendInvitationEmail", async () => {
        // Mock environment variable for SITE_URL
        const originalEnv = process.env;
        process.env = { ...originalEnv, SITE_URL: "https://mysite.com" };

        const options = createAuthOptions(mockCtx as GenericCtx<DataModel>);
        const orgPlugin = options.plugins!.find(p => p.id === "organization") as any;

        await orgPlugin.options.sendInvitationEmail({
            id: "invite-789",
            email: "invitee@example.com",
            inviter: { user: { email: "inviter@example.com", name: "Inviter" } },
            organization: { name: "Test Org" }
        });

        expect(authEmailHandlers.sendInvitationEmail).toHaveBeenCalledTimes(1);
        expect(authEmailHandlers.sendInvitationEmail).toHaveBeenCalledWith({
            email: "invitee@example.com",
            invitedByEmail: "inviter@example.com",
            invitedByName: "Inviter",
            organizationName: "Test Org",
            inviteLink: "https://mysite.com/invite/invite-789"
        });

        process.env = originalEnv;
    });
});
