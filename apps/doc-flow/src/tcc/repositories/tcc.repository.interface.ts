import { CreateTccDto } from '../dto/create-tcc.dto';
import { UpdateTccDto } from '../dto/update-tcc.dto';
import { Tcc } from '../entities/tcc.entity';

export interface TccRepository {
  create(createTccDto: CreateTccDto): Promise<Tcc>;
  findAll(): Promise<Tcc[]>;
  findOne(id: string): Promise<Tcc>;
  update(id: string, updateTccDto: UpdateTccDto): Promise<Tcc>;
  remove(id: string): Promise<number>;
  findByPk(id: string): Promise<Tcc>;
}
