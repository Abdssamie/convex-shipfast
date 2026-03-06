import { Resend } from "resend";
import { render } from "@react-email/render";
import { type EmailFlow, type EmailSendError, getResendConfig } from "./config";
import { type Result, ok, err } from "../shared/result";
import type { EmailRequest } from ".";

import VerificationEmail, {
    subject as verificationSubject,
} from "./templates/verification";
import PasswordResetEmail, {
    subject as passwordResetSubject,
} from "./templates/password_reset";
import MagicLinkEmail, {
    subject as magicLinkSubject,
} from "./templates/magic_link";
import InvitationEmail, {
    subject as invitationSubject,
} from "./templates/invitation";
import WelcomeEmail, {
    subject as welcomeSubject,
} from "./templates/welcome";

type TemplateResult = {
    subject: string;
    component: React.ReactElement;
};

const buildTemplate = (request: EmailRequest): TemplateResult => {
    const { flow, params } = request;

    switch (flow) {
        case "email_verification":
            return {
                subject: verificationSubject,
                component: (
                    <VerificationEmail
                        verificationUrl={params.verificationUrl ?? ""}
                        email={params.email ?? ""}
                        name={params.name ?? ""}
                    />
                ),
            };
        case "password_reset":
            return {
                subject: passwordResetSubject,
                component: (
                    <PasswordResetEmail
                        resetUrl={params.resetUrl ?? ""}
                        email={params.email ?? ""}
                        name={params.name ?? ""}
                    />
                ),
            };
        case "magic_link":
            return {
                subject: magicLinkSubject,
                component: (
                    <MagicLinkEmail
                        magicLink={params.magicLink ?? ""}
                        email={params.email ?? ""}
                    />
                ),
            };
        case "invitation":
            return {
                subject: invitationSubject,
                component: (
                    <InvitationEmail
                        inviteUrl={params.inviteUrl ?? ""}
                        inviterName={params.inviterName ?? ""}
                        appName={params.appName ?? "FluxKit"}
                    />
                ),
            };
        case "welcome":
            return {
                subject: welcomeSubject,
                component: (
                    <WelcomeEmail
                        appName={params.appName ?? "FluxKit"}
                        userName={params.userName ?? ""}
                    />
                ),
            };
    }
};

const makeResendError = (
    flow: EmailFlow,
    reason?: string,
): EmailSendError => ({
    code: "email_send_failed",
    flow,
    reason,
});

export const sendResendEmail = async (
    request: EmailRequest,
): Promise<Result<void, EmailSendError>> => {
    const config = getResendConfig();
    const resend = new Resend(config.apiKey);

    const template = buildTemplate(request);
    const html = await render(template.component);

    try {
        const { error } = await resend.emails.send({
            from: config.from,
            to: request.to.email,
            subject: template.subject,
            html,
        });

        if (error) {
            return err(makeResendError(request.flow, error.message));
        }

        return ok(undefined);
    } catch (e) {
        const reason = e instanceof Error ? e.message : "unknown_error";
        return err(makeResendError(request.flow, reason));
    }
};
