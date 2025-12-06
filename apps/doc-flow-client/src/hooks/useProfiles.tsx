import { ProfileSchema } from "@/lib/schemas/profile.schema";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { profileService } from "@/api/services/profile.service";
import { ApiError } from "@/api/errors/ApiError";

const useProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileSchema[]>([]);

  const fetchProfiles = async () => {
    try {
      const response = await profileService.getAll({ limit: 1000, offset: 0 });
      const { profiles } = response.data;

      if (!profiles) return;

      if (import.meta.env.DEV) {
        toast.info("Perfis carregados com sucesso");
      }

      setProfiles(profiles);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }

      toast.error("Não foi possível carregar os perfis");
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return profiles;
};

export default useProfiles;
