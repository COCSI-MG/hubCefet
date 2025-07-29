import useAuth from "./useAuth";
import { type ProfileEnum } from "@/lib/schemas/profile.schema";

const useProfile = (): {
  profile: ProfileEnum;
  isUserProfileAdminOrProfessor: boolean;
} => {
  const { user } = useAuth();
  if (!user) {
    throw new Error("useProfile must be used within a AuthProvider");
  }

  const profileValue = user?.profile.name?.toLowerCase();

  const isUserProfileAdminOrProfessor: boolean =
    profileValue === 'admin' || profileValue === 'professor';

  return {
    profile: profileValue as ProfileEnum,
    isUserProfileAdminOrProfessor,
  };
};

export default useProfile;
