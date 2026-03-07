import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { useMyProfile } from "../features/profile/hooks/useProfile";
import BrandedLoader from "../components/ui/BrandedLoader";

const ProtectedLayout: React.FC = () => {
  const location = useLocation();
  const { user, isPending, isEmailVerified } = useCurrentUser();
  const { data: profileResponse, isPending: isProfilePending } = useMyProfile({
    enabled: !!user && isEmailVerified,
  });

  if (isPending || (!!user && isEmailVerified && isProfilePending)) {
    return <BrandedLoader message="Loading your dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isEmailVerified) {
    return <Navigate to="/verify-notice" replace />;
  }

  const isProfileComplete = profileResponse?.data?.isComplete ?? false;
  const isProfileRoute = location.pathname === "/profile";

  if (!isProfileComplete && !isProfileRoute) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;
