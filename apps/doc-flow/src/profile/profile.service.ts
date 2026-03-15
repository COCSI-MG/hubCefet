import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
  ) { }

  async create(createProfileDto: CreateProfileDto) {
    const profileAlreadyExists = await this.profileRepository.findByProfileName(
      createProfileDto.name,
    );
    if (profileAlreadyExists) {
      throw new ConflictException('Perfil ja existe')
    }

    return await this.profileRepository.create(createProfileDto);
  }

  async findAll() {
    return await this.profileRepository.findAll();
  }

  async findOne(id: string): Promise<null | Profile> {
    const profile = await this.profileRepository.findOne(id);
    if (!profile) {
      throw new NotFoundException('Perfil nao encontrado')
    }

    return profile;
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    return await this.profileRepository.update(id, updateProfileDto);
  }

  async remove(id: string) {
    return await this.profileRepository.remove(id);
  }

  async findByProfileName(name: string): Promise<null | Profile> {
    const profile = await this.profileRepository.findByProfileName(name);
    if (!profile) {
      throw new NotFoundException('Perfil nao encontrado')
    }

    return profile;
  }
}
