import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { useMyProfile } from "../features/profile/hooks/useProfile";
import BrandedLoader from "../components/ui/BrandedLoader";

const PublicAuthLayout: React.FC = () => {
  const { user, isPending, isEmailVerified } = useCurrentUser();
  const { data: profileResponse, isPending: isProfilePending } = useMyProfile({
    enabled: !!user && isEmailVerified,
  });

  if (isPending || (!!user && isEmailVerified && isProfilePending)) {
    return <BrandedLoader message="Preparing Expense Tracker..." />;
  }

  if (user) {
    if (!isEmailVerified) {
      return <Navigate to="/verify-notice" replace />;
    }

    const isProfileComplete = profileResponse?.data?.isComplete ?? false;
    return (
      <Navigate to={isProfileComplete ? "/dashboard" : "/profile"} replace />
    );
  }

  return <Outlet />;
};

export default PublicAuthLayout;
