import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import * as emailModule from "./index";
import { logger } from "../../lib/logger";
import { sendWelcomeEmail } from "./betterAuth";

describe("Better Auth Email Handlers", () => {
  let sendEmailSpy: ReturnType<typeof spyOn>;
  let loggerWarnSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    sendEmailSpy = spyOn(emailModule, "sendEmail");
    loggerWarnSpy = spyOn(logger, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    mock.restore();
  });

  test("failed sends log warning with original error payload", async () => {
    const errorPayload = { code: "brevo_request_failed", flow: "welcome" };
    sendEmailSpy.mockRejectedValue(errorPayload);

    await sendWelcomeEmail({ email: "test@test.com" });

    expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
    expect(loggerWarnSpy).toHaveBeenCalledWith("brevo_email_failed", errorPayload);
  });

  test("non-object errors log with undefined payload", async () => {
    sendEmailSpy.mockRejectedValue("brevo_failed");

    await sendWelcomeEmail({ email: "test@test.com" });

    expect(loggerWarnSpy).toHaveBeenCalledTimes(1);
    expect(loggerWarnSpy).toHaveBeenCalledWith("brevo_email_failed", undefined);
  });
});
