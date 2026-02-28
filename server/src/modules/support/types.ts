export type SupportCategory =
  | "billing"
  | "technical"
  | "account"
  | "feature"
  | "other";

export type SupportStatus = "open" | "resolved";

export interface CreateSupportRequestInput {
  userId: string;
  subject: string;
  message: string;
  category: SupportCategory;
}

export interface GetSupportRequestsInput {
  userId: string;
  limit?: number;
}

export interface GetAllSupportRequestsInput {
  limit?: number;
  status?: SupportStatus;
}

export interface UpdateSupportRequestStatusInput {
  id: string;
  status: SupportStatus;
}

export interface SupportResourceItem {
  id: string;
  title: string;
  description: string;
}
