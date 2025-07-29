import { Inject, Injectable } from '@nestjs/common';
import { CreateTccStudentDto } from './dto/create-tcc-student.dto';
import { UpdateTccStudentDto } from './dto/update-tcc-student.dto';
import { TccStudentsRepository } from './repositories/tcc-students.repository.interface';

@Injectable()
export class TccStudentsService {
  constructor(
    @Inject('TccStudentsRepository')
    private readonly tccStudentsRepository: TccStudentsRepository,
  ) {}

  async create(createTccStudentDto: CreateTccStudentDto) {
    return await this.tccStudentsRepository.create(createTccStudentDto);
  }

  async findAll() {
    return await this.tccStudentsRepository.findAll();
  }

  async findOne(id: string) {
    return await this.tccStudentsRepository.findOne(id);
  }

  async update(id: string, updateTccStudentDto: UpdateTccStudentDto) {
    return await this.tccStudentsRepository.update(id, updateTccStudentDto);
  }

  async remove(id: string) {
    return await this.tccStudentsRepository.remove(id);
  }
}
