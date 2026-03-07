import { authClient } from "../../../lib/authClient";

export const useGoogleAuth = (_source: "register" | "login" = "login") => {
  return () => {
    localStorage.setItem("onboarding:social-register-pending", "true");

    return authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/dashboard`,
    });
  };
};
