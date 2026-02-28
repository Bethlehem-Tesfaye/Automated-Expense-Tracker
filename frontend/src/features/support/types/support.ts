export type SupportCategory =
  | "billing"
  | "technical"
  | "account"
  | "feature"
  | "other";

export interface SupportResourceItem {
  id: string;
  title: string;
  description: string;
}

export interface SupportRequestItem {
  id: string;
  subject: string;
  category: SupportCategory;
  status: string;
  createdAt: string;
}

export interface AdminSupportRequestItem extends SupportRequestItem {
  message: string;
  userName: string;
  userEmail: string;
}

export type SupportStatus = "open" | "resolved";

export interface CreateSupportRequestInput {
  subject: string;
  message: string;
  category: SupportCategory;
}

export interface GetSupportResourcesResponse {
  data: SupportResourceItem[];
}

export interface GetSupportRequestsResponse {
  data: SupportRequestItem[];
}

export interface GetAdminSupportRequestsResponse {
  data: AdminSupportRequestItem[];
}

export interface CreateSupportRequestResponse {
  data: SupportRequestItem;
}

export interface UpdateSupportRequestStatusInput {
  id: string;
  status: SupportStatus;
}
