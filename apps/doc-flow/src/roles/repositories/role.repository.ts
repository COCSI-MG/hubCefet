import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository.interface';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';

@Injectable()
export class RoleRepositoryImpl implements RoleRepository {
  constructor(
    @InjectModel(Role)
    private roleModel: typeof Role,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    return await this.roleModel.create({
      ...createRoleDto,
    });
  }

  async findAll(): Promise<Role[]> {
    return await this.roleModel.findAll();
  }

  async findOne(id: string): Promise<Role> {
    return await this.roleModel.findByPk(id);
  }

  async update(id: string, updateRoleDto: CreateRoleDto): Promise<string> {
    await this.roleModel.update(updateRoleDto, {
      where: {
        id,
      },
    });
    return 'Role updated successfully';
  }

  async remove(id: string): Promise<number> {
    const deletedRole = await this.roleModel.destroy({
      where: {
        id,
      },
    });
    return deletedRole;
  }

  async findByPk(id: string): Promise<Role> {
    return await this.roleModel.findByPk(id);
  }

  async findByRoleName(name: string): Promise<Role> {
    return await this.roleModel.findOne({
      where: {
        name,
      },
    });
  }
}
