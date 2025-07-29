import { Inject, Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileRepository } from './repositories/profile.repository.interface';
import { PROFILE_REPOSITORY } from './repositories/profile-repository.token';
import { Profile } from './entities/profile.entity';
@Injectable()
export class ProfileService {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async create(createProfileDto: CreateProfileDto) {
    const profileAlreadyExists = await this.profileRepository.findByProfileName(
      createProfileDto.name,
    );
    if (profileAlreadyExists) {
      return null;
    }
    const profile = await this.profileRepository.create(createProfileDto);
    return profile;
  }

  async findAll() {
    return await this.profileRepository.findAll();
  }

  async findOne(id: string): Promise<null | Profile> {
    const profile = await this.profileRepository.findOne(id);
    if (!profile) {
      return null;
    }
    return profile;
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} profile`;
  }

  async remove(id: string) {
    return `This action removes a #${id} profile`;
  }

  async findByProfileName(name: string): Promise<null | Profile> {
    return await this.profileRepository.findByProfileName(name);
  }
}
