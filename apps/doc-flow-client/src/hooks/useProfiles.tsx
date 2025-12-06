import { ProfileSchema } from "@/lib/schemas/profile.schema";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { profileService } from "@/api/services/profile.service";

const useProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileSchema[]>([]);

  const fetchProfiles = async () => {
    const profiles = await profileService.getAll({ limit: 1000, offset: 0 });
    if (!profiles.data.profiles) return;

    if (import.meta.env.DEV) {
      toast.info("Perfis carregados com sucesso");
    }

    setProfiles(profiles.data.profiles);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return profiles;
};

export default useProfiles;
