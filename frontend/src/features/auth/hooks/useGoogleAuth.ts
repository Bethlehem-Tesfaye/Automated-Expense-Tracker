import { authClient } from "../../../lib/authClient";

export const useGoogleAuth = (source: "register" | "login" = "login") => {
  return () => {
    if (source === "register") {
      localStorage.setItem("onboarding:social-register-pending", "true");
    } else {
      localStorage.removeItem("onboarding:social-register-pending");
    }

    return authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/dashboard`,
    });
  };
};
