import { getProfiles } from "@/api/data/profile.data";
import { ProfileSchema } from "@/lib/schemas/profile.schema";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const useProfiles = () => {
  const [profiles, setProfiles] = useState<ProfileSchema[]>([]);

  const fetchProfiles = async () => {
    const profiles = await getProfiles();
    if (!profiles) return;
    if (import.meta.env.DEV) toast.info("Perfis carregados com sucesso");
    setProfiles(profiles);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return profiles;
};

export default useProfiles;
