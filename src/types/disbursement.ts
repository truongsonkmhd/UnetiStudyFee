
export type DisbursementItem = {
  id: string;
  description: string;
  amount: number; 
  taxRate: number; 
};

export type DisbursementRequest = {
  id: string;
  code: string;
  projectId: string;
  contractId: string;
  period: string; // YYYY-MM (gắn với kế hoạch)
  items: DisbursementItem[];
  note?: string;
  advanceDeduction: number;
  retentionRate: number; 
  completionPct: number; 
  status: "DRAFT" | "SUBMITTED" | "APPROVING" | "APPROVED" | "PAYMENT_ORDERED" | "PAID" | "REJECTED" | "NEED_INFO";
  submittedAt?: string;
};

export type PlanItem = {
  id: string;
  period: string; // YYYY-MM
  plannedAmount: number;
};

export type DisbursementPlan = {
  id: string;
  projectId: string;
  contractId: string;
  items: PlanItem[];
};