import { Inject, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleRepository } from './repositories/role.repository.interface';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @Inject('IRoleRepository')
    private roleRepository: RoleRepository,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.roleRepository.create(createRoleDto);
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }

  async findOne(id: string): Promise<Role> {
    return await this.roleRepository.findOne(id);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<string> {
    return await this.roleRepository.update(id, updateRoleDto);
  }

  async remove(id: string): Promise<number> {
    const deletedRole = await this.roleRepository.remove(id);
    return deletedRole;
  }
}
