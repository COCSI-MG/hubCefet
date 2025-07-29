//import { components } from '@/lib/schema';
import ProfileService from "../services/profile.service";

//type Profile = components['schemas']['Profile'];

export async function getProfileId(
  role: string,
  args: { limit: number; offset: number },
): Promise<string | undefined> {
  try {
    const profileService = new ProfileService();
    const res = await profileService.getAll(args);

    if (!res.data?.profiles || res.data.profiles.length === 0) {
      console.warn("Nenhum perfil encontrado para o role:", role);
      return undefined;
    }

    const profile = res.data.profiles.find(
      (profile) => profile.name.toLowerCase() === role,
    );

    if (!profile) {
      console.warn("Perfil não encontrado para o role:", role);
      return undefined;
    }

    return profile.id;
  } catch (err) {
    console.error("EErro ao buscar perfil:", err);
    return undefined;
  }
}

export const getProfiles = async () => {
  try {
    const profileService = new ProfileService();
    const res = await profileService.getAll({ limit: 100, offset: 0 });
    return res.data?.profiles || [];
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error(err);
    }
    return undefined;
  }
};
