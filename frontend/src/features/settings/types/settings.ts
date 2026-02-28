export type ReceiptEngine = "basic" | "pro";
export type CurrencyCode = "USD" | "EUR" | "GBP" | "KES" | "ETB";

export interface SettingsData {
  id: string;
  userId: string;
  defaultReceiptEngine: ReceiptEngine;
  defaultCurrency: CurrencyCode;
  emailNotifications: boolean;
}

export interface GetMySettingsResponse {
  data: SettingsData;
}

export interface UpdateSettingsInput {
  defaultReceiptEngine: ReceiptEngine;
  defaultCurrency: CurrencyCode;
  emailNotifications: boolean;
}
