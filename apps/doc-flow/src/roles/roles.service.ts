import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleRepository } from './repositories/role.repository.interface';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @Inject('IRoleRepository')
    private roleRepository: RoleRepository,
  ) { }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findByRoleName(createRoleDto.name);
    if (role) {
      throw new ConflictException('Role ja existente')
    }

    return await this.roleRepository.create(createRoleDto);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne(id);
    if (!role) {
      throw new NotFoundException('Role nao encontrada')
    }

    return role
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<string> {
    return await this.roleRepository.update(id, updateRoleDto);
  }

  async remove(id: string): Promise<number> {
    return await this.roleRepository.remove(id);
  }
}
