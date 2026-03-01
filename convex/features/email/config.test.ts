import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { getBrevoConfig, getBrevoTemplateId } from "./config";

describe("Brevo Config", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe("getBrevoConfig", () => {
        test("returns loaded config when env vars are present", () => {
            process.env.BREVO_API_KEY = "test-api-key";
            process.env.BREVO_SENDER_NAME = "Test Sender";
            process.env.BREVO_SENDER_EMAIL = "sender@test.com";
            process.env.BREVO_REPLY_TO_NAME = "Reply To";
            process.env.BREVO_REPLY_TO_EMAIL = "reply@test.com";

            const config = getBrevoConfig();

            expect(config).toEqual({
                apiKey: "test-api-key",
                sender: {
                    name: "Test Sender",
                    email: "sender@test.com",
                },
                replyTo: {
                    name: "Reply To",
                    email: "reply@test.com",
                },
            });
        });

        test("returns config without replyTo if omitted", () => {
            process.env.BREVO_API_KEY = "test-api-key";
            process.env.BREVO_SENDER_NAME = "Test Sender";
            process.env.BREVO_SENDER_EMAIL = "sender@test.com";
            delete process.env.BREVO_REPLY_TO_NAME;
            delete process.env.BREVO_REPLY_TO_EMAIL;

            const config = getBrevoConfig();

            expect(config.replyTo).toBeUndefined();
        });

        test("throws missing_env if API key is missing", () => {
            delete process.env.BREVO_API_KEY;
            process.env.BREVO_SENDER_NAME = "Test Sender";
            process.env.BREVO_SENDER_EMAIL = "sender@test.com";

            expect(() => getBrevoConfig()).toThrow();
            try {
                getBrevoConfig();
            } catch (e: any) {
                expect(e.code).toBe("missing_env");
                expect(e.field).toBe("BREVO_API_KEY");
            }
        });
    });

    describe("getBrevoTemplateId", () => {
        test("returns correct template integer", () => {
            process.env.BREVO_TEMPLATE_EMAIL_VERIFICATION = "123";
            expect(getBrevoTemplateId("email_verification")).toBe(123);
        });

        test("throws missing_env if template id env is missing", () => {
            delete process.env.BREVO_TEMPLATE_PASSWORD_RESET;

            expect(() => getBrevoTemplateId("password_reset")).toThrow();
            try {
                getBrevoTemplateId("password_reset");
            } catch (e: any) {
                expect(e.code).toBe("missing_env");
                expect(e.field).toBe("BREVO_TEMPLATE_PASSWORD_RESET");
            }
        });

        test("throws invalid_template_id if template id is not an integer", () => {
            process.env.BREVO_TEMPLATE_WELCOME = "not_a_number";

            expect(() => getBrevoTemplateId("welcome")).toThrow();
            try {
                getBrevoTemplateId("welcome");
            } catch (e: any) {
                expect(e.code).toBe("invalid_template_id");
                expect(e.field).toBe("BREVO_TEMPLATE_WELCOME");
            }
        });
    });
});
