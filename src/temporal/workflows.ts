import { proxyActivities, workflowInfo } from "@temporalio/workflow";
import type * as activities from "./activities.js";

const { verifyPhoneNumber } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});

export async function phoneVerificationWorkflow(phoneNumber: string) {
  const { workflowId } = workflowInfo();
  return await verifyPhoneNumber(phoneNumber,workflowId);
}
