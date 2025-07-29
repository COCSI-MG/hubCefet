import { Profile } from '../entities/profile.entity';
import { CreateProfileDto } from '../dto/create-profile.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';

export interface ProfileRepository {
  create(createProfileDto: CreateProfileDto): Promise<Profile>;
  findAll(): Promise<Profile[]>;
  findOne(id: string): Promise<Profile>;
  update(id: string, updateProfileDto: UpdateProfileDto): Promise<string>;
  remove(id: string): Promise<number>;
  findByPk(id: string): Promise<Profile>;
  findByProfileName(name: string): Promise<Profile>;
}
