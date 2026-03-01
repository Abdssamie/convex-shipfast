import {
  type EmailFlow,
  getBrevoTemplateId,
} from "./config";
import { sendBrevoTemplate } from "./brevo";

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
