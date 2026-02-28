export type ReceiptEngine = "basic" | "pro";
export type CurrencyCode = "USD" | "EUR" | "GBP" | "KES" | "ETB";

export interface SettingsResponse {
  id: string;
  userId: string;
  defaultReceiptEngine: ReceiptEngine;
  defaultCurrency: CurrencyCode;
  emailNotifications: boolean;
}

export interface UpdateSettingsInput {
  userId: string;
  defaultReceiptEngine: ReceiptEngine;
  defaultCurrency: CurrencyCode;
  emailNotifications: boolean;
}
