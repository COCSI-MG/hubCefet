import { Navigate, Outlet } from "react-router";
import useProfile from "@/hooks/useProfile";
import { type ProfileEnum } from "@/lib/schemas/profile.schema";

interface ProfileRouteProps {
  profile: ProfileEnum[];
}

const ProfileRoute = ({ ...props }: ProfileRouteProps) => {
  const { profile } = useProfile();
  
  const userProfile = profile?.toLowerCase();
  const requiredProfiles = props.profile.map(p => p.toLowerCase());
  
  return requiredProfiles.includes(userProfile) ? (
    <Outlet />
  ) : (
    <Navigate to="/forbidden" />
  );
};

export default ProfileRoute;
