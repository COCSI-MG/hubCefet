import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository.interface';
import { InjectModel } from '@nestjs/sequelize';
import { Profile } from '../entities/profile.entity';
import { CreateProfileDto } from '../dto/create-profile.dto';

@Injectable()
export class ProfileRepositoryImpl implements ProfileRepository {
  constructor(
    @InjectModel(Profile)
    private profileModel: typeof Profile,
  ) {}

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    return await this.profileModel.create({
      ...createProfileDto,
    });
  }

  async findAll(): Promise<Profile[]> {
    return await this.profileModel.findAll();
  }

  async findOne(id: string): Promise<Profile> {
    return await this.profileModel.findByPk(id);
  }

  async update(
    id: string,
    updateProfileDto: CreateProfileDto,
  ): Promise<string> {
    await this.profileModel.update(updateProfileDto, {
      where: {
        id,
      },
    });
    return 'Profile updated successfully';
  }

  async remove(id: string): Promise<number> {
    const deletedProfile = await this.profileModel.destroy({
      where: {
        id,
      },
    });
    return deletedProfile;
  }

  async findByPk(id: string): Promise<Profile> {
    return await this.profileModel.findByPk(id);
  }

  async findByProfileName(name: string): Promise<Profile> {
    return await this.profileModel.findOne({
      where: {
        name,
      },
    });
  }
}
