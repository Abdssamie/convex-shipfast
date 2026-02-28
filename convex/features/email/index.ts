import {
  type EmailFlow,
  type EmailSendError,
  getBrevoTemplateId,
} from "./config";
import { sendBrevoTemplate } from "./brevo";

export type EmailRequest = {
  flow: EmailFlow;
  to: { email: string; name?: string };
  params: Record<string, string>;
  tags?: string[];
};

export const sendEmail = async (
  request: EmailRequest,
): Promise<void> => {
  const templateId = getBrevoTemplateId(request.flow);

  await sendBrevoTemplate({
    flow: request.flow,
    to: request.to,
    templateId,
    params: request.params,
    tags: request.tags,
  });
};
