import {
  type EmailFlow,
  getBrevoTemplateId,
  getEmailProvider,
} from "./config";
import { sendBrevoTemplate } from "./brevo";
import { sendResendEmail } from "./resend";

export type EmailRequest = {
  flow: EmailFlow;
  to: { email: string; name?: string };
  params: Record<string, string>;
  tags?: string[];
  sandbox?: boolean;
};

export const sendEmail = async (
  request: EmailRequest,
) => {
  const provider = getEmailProvider();

  if (provider === "resend") {
    return sendResendEmail(request);
  }

  const templateId = getBrevoTemplateId(request.flow);

  return await sendBrevoTemplate({
    flow: request.flow,
    to: request.to,
    templateId,
    params: request.params,
    tags: request.tags,
    sandbox: request.sandbox,
  });
};
