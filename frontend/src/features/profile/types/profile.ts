export interface ProfileData {
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

export interface GetMyProfileResponse {
  data: ProfileData;
}

export interface UpdateProfileInput {
  displayName: string;
  monthlyBudget: number;
  monthlyIncome: number;
  avatar?: File | null;
  removeAvatar?: boolean;
}
