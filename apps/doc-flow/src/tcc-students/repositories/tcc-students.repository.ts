import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TccStudentsRepository } from './tcc-students.repository.interface';
import { CreateTccStudentDto } from '../dto/create-tcc-student.dto';
import { UpdateTccStudentDto } from '../dto/update-tcc-student.dto';
import { TccStudents } from '../entities/tcc-students.entity';

@Injectable()
export class TccStudentsRepositoryImpl implements TccStudentsRepository {
  constructor(
    @InjectModel(TccStudents)
    private model: typeof TccStudents,
  ) {}

  async create(createTccStudentDto: CreateTccStudentDto): Promise<TccStudents> {
    return await this.model.create({
      ...createTccStudentDto,
    });
  }

  async findAll(): Promise<TccStudents[]> {
    return await this.model.findAll();
  }

  async findOne(id: string): Promise<TccStudents> {
    const tcc = await this.model.findByPk(id);
    if (!tcc) {
      throw new Error('TccStudents not found');
    }
    return tcc;
  }

  async update(
    id: string,
    updateTccStudentDto: UpdateTccStudentDto,
  ): Promise<string> {
    // Implement update logic here
    return `This action updates a #${id} tcc`;
  }

  async remove(id: string): Promise<number> {
    return await this.model.destroy({ where: { id } });
  }

  async findByPk(id: string): Promise<TccStudents> {
    return await this.model.findByPk(id);
  }
}
