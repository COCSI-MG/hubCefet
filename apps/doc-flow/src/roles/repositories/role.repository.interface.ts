import { Role } from '../entities/role.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

export interface RoleRepository {
  create(createRoleDto: CreateRoleDto): Promise<Role>;
  findAll(): Promise<Role[]>;
  findOne(id: string): Promise<Role>;
  update(id: string, updateRoleDto: UpdateRoleDto): Promise<string>;
  remove(id: string): Promise<number>;
  findByPk(id: string): Promise<Role>;
  findByRoleName(name: string): Promise<Role>;
}
