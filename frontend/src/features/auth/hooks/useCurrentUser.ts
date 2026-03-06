import { authClient } from "../../../lib/authClient";

export const useCurrentUser = () => {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user ?? null;
  const emailVerifiedValue =
    user && "emailVerified" in user
      ? (user.emailVerified as boolean | string | Date | null | undefined)
      : undefined;
  const isEmailVerified =
    typeof emailVerifiedValue === "boolean"
      ? emailVerifiedValue
      : emailVerifiedValue instanceof Date
        ? true
        : typeof emailVerifiedValue === "string"
          ? emailVerifiedValue.length > 0
          : true;

  const isAuthenticated = !!user;
  const isAnonymous = user?.isAnonymous === true;
  const isRealUser = !!user && user.isAnonymous === false;

  return {
    user,
    isPending,
    isEmailVerified,
    isAuthenticated,
    isAnonymous,
    isRealUser,
  };
};
