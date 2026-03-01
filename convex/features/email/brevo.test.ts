import { describe, expect, test, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { sendBrevoTemplate } from "./brevo";
import * as configModule from "./config";

describe("Brevo Sender", () => {
    const originalFetch = global.fetch;
    let fetchMock: ReturnType<typeof mock>;

    beforeEach(() => {
        // Mock the config module to avoid hitting process.env requirements
        spyOn(configModule, "getBrevoConfig").mockReturnValue({
            apiKey: "test-key",
            sender: { name: "Test Server", email: "server@test.com" }
        });

        fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify({ messageIds: ["123"] }), { status: 201 })));
        global.fetch = fetchMock as any;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        mock.restore();
    });

    test("successfully sends email and maps to Result ok", async () => {
        const result = await sendBrevoTemplate({
            flow: "welcome",
            to: { email: "user@test.com", name: "User" },
            templateId: 10,
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.value.messageIds).toEqual(["123"]);
        }

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const fetchArgs = fetchMock.mock.calls[0];
        expect(fetchArgs[0]).toBe("https://api.brevo.com/v3/smtp/email");
        expect(fetchArgs[1].method).toBe("POST");
        expect(fetchArgs[1].headers).not.toHaveProperty("X-Sib-Sandbox");
    });

    test("injects sandbox header when sandbox option is true", async () => {
        const result = await sendBrevoTemplate({
            flow: "welcome",
            to: { email: "user@test.com" },
            templateId: 10,
            sandbox: true,
        });

        expect(result.ok).toBe(true);
        const fetchArgs = fetchMock.mock.calls[0];
        expect(fetchArgs[1].headers).toHaveProperty("X-Sib-Sandbox", "drop");
    });

    test("returns Result err on 400 Bad Request", async () => {
        fetchMock = mock(() => Promise.resolve(new Response(JSON.stringify({ message: "Invalid email" }), { status: 400, statusText: "Bad Request" })));
        global.fetch = fetchMock as any;

        const result = await sendBrevoTemplate({
            flow: "welcome",
            to: { email: "invalid" },
            templateId: 10,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.code).toBe("brevo_request_failed");
            expect((result.error as any).status).toBe(400);
            expect((result.error as any).reason).toBe("Invalid email");
        }
    });

});
