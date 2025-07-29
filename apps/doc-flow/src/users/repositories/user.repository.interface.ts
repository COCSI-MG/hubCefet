import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

export interface UserRepository {
  create(createUserDto: CreateUserDto, profileId: string): Promise<User>;
  findAll(limit: number, offset: number): Promise<User[]>;
  findOne(id: string): Promise<User>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<[number, User[]]>;
  remove(id: string): Promise<number>;
  findByEmail(email: string): Promise<User>;
  findByPk(id: string): Promise<User>;
  search(term: string, limit: number, offset: number): Promise<User[]>;
}
