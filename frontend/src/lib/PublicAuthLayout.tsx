import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "../features/auth/hooks/useCurrentUser";
import { useMyProfile } from "../features/profile/hooks/useProfile";
import BrandedLoader from "../components/ui/BrandedLoader";

const PublicAuthLayout: React.FC = () => {
  const { user, isPending } = useCurrentUser();
  const { data: profileResponse, isPending: isProfilePending } = useMyProfile({
    enabled: !!user,
  });

  if (isPending || (!!user && isProfilePending)) {
    return <BrandedLoader message="Preparing Expense Tracker..." />;
  }

  if (user) {
    const isProfileComplete = profileResponse?.data?.isComplete ?? false;
    return (
      <Navigate to={isProfileComplete ? "/dashboard" : "/profile"} replace />
    );
  }

  return <Outlet />;
};

export default PublicAuthLayout;
