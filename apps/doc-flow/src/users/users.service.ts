import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repositories/user.repository.interface';
import { USER_REPOSITORY } from './repositories/user-repository.token';
import { ProfileService } from '../profile/profile.service';
import { ServiceLayerDto } from 'src/lib/dto/service-layer.dto';
import { User } from './entities/user.entity';
import { hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private userRepository: UserRepository,
    private readonly profileService: ProfileService,
    private configService: ConfigService
  ) { }

  async createByAdmin(
    dto: CreateUserByAdminDto,
  ): Promise<ServiceLayerDto<{ user: User }>> {
    const profile = await this.profileService.findOne(dto.profileId);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const emailInUse = await this.userRepository.findByEmail(dto.email);
    if (emailInUse) {
      throw new ConflictException('Email já está em uso');
    }

    const enrollmentInUse = await this.userRepository.findByEnrollment(dto.enrollment);
    if (enrollmentInUse) {
      throw new ConflictException('Matrícula já está em uso');
    }

    const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD');
    if (!defaultPassword) {
      throw new Error('DEFAULT_USER_PASSWORD not defined in environment variables');
    }
    const hashedPassword = await hash(defaultPassword, 10);

    const user = await this.userRepository.create(
      { ...dto, password: hashedPassword },
      profile.id,
    );
    return new ServiceLayerDto<{ user: User }>({ user }, true);
  }

  async resetPassword(id: string): Promise<void> {
    const userExists = await this.userRepository.findOne(id);
    if (!userExists) {
      throw new NotFoundException('Usuario nao encontrado')
    }

    const defaultPassword = this.configService.get<string>('DEFAULT_USER_PASSWORD');
    if (!defaultPassword) {
      throw new Error('DEFAULT_USER_PASSWORD not defined in environment variables');
    }

    const hashedPassword = await hash(defaultPassword, 10);

    await this.userRepository.update(id, { password: hashedPassword });
  }

  async findAll(
    limit: number,
    offset: number,
    profileName?: string,
  ): Promise<ServiceLayerDto<{ users: User[] }>> {
    let users: User[];

    if (profileName) {
      const profile = await this.profileService.findByProfileName(profileName);
      if (profile) {
        users = await this.userRepository.findAll(limit, offset);
        users = users.filter((user) => user.profile_id === profile.id);
      } else {
        users = [];
      }
    } else {
      users = await this.userRepository.findAll(limit, offset);
    }

    return new ServiceLayerDto<{ users: User[] }>(
      { users },
      users.length > 0 ? true : false,
    );
  }

  async findOne(id: string): Promise<ServiceLayerDto<{ user: User }>> {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado')
    }

    return new ServiceLayerDto<{ user: User }>({ user }, user ? true : false);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userExists = await this.userRepository.findOne(id);
    if (!userExists) {
      throw new NotFoundException('Usuario nao encontrado')
    }

    if (updateUserDto.email) {
      const emailInUse = await this.userRepository.findByEmail(updateUserDto.email);
      if (emailInUse && emailInUse.id !== id) {
        throw new ConflictException('Email já está em uso');
      }
    }

    if (updateUserDto.enrollment) {
      const enrollmentInUse = await this.userRepository.findByEnrollment(updateUserDto.enrollment);
      if (enrollmentInUse && enrollmentInUse.id !== id) {
        throw new ConflictException('Matrícula já está em uso');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 10);
    }

    const [number, user] = await this.userRepository.update(id, updateUserDto);
    if (number === 0) {
      throw new NotFoundException('User not found');
    }
    return user[0];
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException('Usuario nao encontrado')
    }

    return await this.userRepository.remove(id);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findByEmail(email);

    return user
  }

  async search(
    term: string,
    limit: number,
    offset: number,
    profileName?: string,
  ): Promise<ServiceLayerDto<{ users: User[] }>> {
    let users: User[];

    if (profileName) {
      const profile = await this.profileService.findByProfileName(profileName);
      if (profile) {
        users = await this.userRepository.search(term, limit, offset);
        users = users.filter((user) => user.profile_id === profile.id);
      } else {
        users = [];
      }
    } else {
      users = await this.userRepository.search(term, limit, offset);
    }

    return new ServiceLayerDto<{ users: User[] }>(
      { users },
      users.length > 0 ? true : false,
    );
  }
}
