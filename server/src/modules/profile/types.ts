export interface UpdateProfileInput {
  userId: string;
  displayName: string;
  monthlyBudget: number;
  monthlyIncome: number;
  avatarUrl?: string | null;
  removeAvatar?: boolean;
}

export interface ProfileResponse {
  id: string;
  userId: string;
  email: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
  monthlyBudget: number | null;
  monthlyIncome: number | null;
  isComplete: boolean;
}
