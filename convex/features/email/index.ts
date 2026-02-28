import { errAsync, okAsync, type ResultAsync } from "neverthrow";
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

export const sendEmail = (
  request: EmailRequest,
) => {
  const templateResult = getBrevoTemplateId(request.flow);
  if (templateResult.isErr()) {
    return errAsync({ ...templateResult.error, flow: request.flow });
  }

  return sendBrevoTemplate({
    flow: request.flow,
    to: request.to,
    templateId: templateResult.value,
    params: request.params,
    tags: request.tags,
  }).andThen(() => okAsync(null));
};
