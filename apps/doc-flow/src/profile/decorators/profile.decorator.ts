import { SetMetadata } from '@nestjs/common';
import { Profile } from '../enum/profile.enum';

export const PROFILES_KEY = 'profiles';
export const Profiles = (...profile: Profile[]) =>
  SetMetadata(PROFILES_KEY, profile);
