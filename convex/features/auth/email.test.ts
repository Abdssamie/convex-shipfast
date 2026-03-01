import { describe, expect, test, beforeEach, afterEach, mock, spyOn } from "bun:test";
import * as emailModule from "../email";
import { ok, err } from "../shared/result";
import {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendMagicLinkEmail,
    sendInvitationEmail,
    sendWelcomeEmail
} from "./email";

describe("Auth Email Handlers", () => {
    let sendEmailSpy: ReturnType<typeof spyOn>;
    let consoleWarnSpy: ReturnType<typeof spyOn>;

    beforeEach(() => {
        sendEmailSpy = spyOn(emailModule, "sendEmail").mockResolvedValue(ok({ messageIds: ["mock_id"] }));
        consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => { });
    });

    afterEach(() => {
        mock.restore();
    });

    test("sendVerificationEmail maps correctly", async () => {
        await sendVerificationEmail({ email: "test@test.com", url: "http://verify", name: "Test User" });

        expect(sendEmailSpy).toHaveBeenCalledTimes(1);
        expect(sendEmailSpy).toHaveBeenCalledWith({
            flow: "email_verification",
            to: { email: "test@test.com", name: "Test User" },
            params: { url: "http://verify", email: "test@test.com", name: "Test User" },
            tags: ["better-auth", "email-verification"],
        });
    });

    test("sendPasswordResetEmail maps correctly", async () => {
        await sendPasswordResetEmail({ email: "test@test.com", url: "http://reset" });

        expect(sendEmailSpy).toHaveBeenCalledTimes(1);
        expect(sendEmailSpy).toHaveBeenCalledWith({
            flow: "password_reset",
            to: { email: "test@test.com", name: undefined },
            params: { url: "http://reset", email: "test@test.com", name: "" },
            tags: ["better-auth", "password-reset"],
        });
    });

    test("sendMagicLinkEmail maps correctly", async () => {
        await sendMagicLinkEmail({ email: "test@test.com", url: "http://magic" });

        expect(sendEmailSpy).toHaveBeenCalledTimes(1);
        expect(sendEmailSpy).toHaveBeenCalledWith({
            flow: "magic_link",
            to: { email: "test@test.com" },
            params: { url: "http://magic", email: "test@test.com" },
            tags: ["better-auth", "magic-link"],
        });
    });

    test("sendInvitationEmail maps correctly", async () => {
        await sendInvitationEmail({
            email: "test@test.com",
            inviteLink: "http://invite",
            invitedByEmail: "admin@test.com",
            organizationName: "Test Org"
        });

        expect(sendEmailSpy).toHaveBeenCalledTimes(1);
        expect(sendEmailSpy).toHaveBeenCalledWith({
            flow: "invitation",
            to: { email: "test@test.com" },
            params: {
                inviteLink: "http://invite",
                email: "test@test.com",
                invitedByEmail: "admin@test.com",
                invitedByName: "",
                organizationName: "Test Org"
            },
            tags: ["better-auth", "invitation"],
        });
    });

    test("sendWelcomeEmail maps correctly", async () => {
        await sendWelcomeEmail({ email: "test@test.com", name: "Test User" });

        expect(sendEmailSpy).toHaveBeenCalledTimes(1);
        expect(sendEmailSpy).toHaveBeenCalledWith({
            flow: "welcome",
            to: { email: "test@test.com", name: "Test User" },
            params: { appName: "FastShip", userName: "Test User" },
            tags: ["better-auth", "welcome"],
        });
    });

    test("failed sends log a warning without throwing", async () => {
        sendEmailSpy.mockResolvedValue(err({ code: "brevo_request_failed", flow: "welcome" }));

        await sendWelcomeEmail({ email: "test@test.com" });

        expect(sendEmailSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledWith("brevo_email_failed", { code: "brevo_request_failed", flow: "welcome" });
    });
});
