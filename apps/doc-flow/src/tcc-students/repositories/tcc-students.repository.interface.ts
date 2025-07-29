import { CreateTccStudentDto } from '../dto/create-tcc-student.dto';
import { UpdateTccStudentDto } from '../dto/update-tcc-student.dto';
import { TccStudents } from '../entities/tcc-students.entity';

export interface TccStudentsRepository {
  create(createTccStudentsDto: CreateTccStudentDto): Promise<TccStudents>;
  findAll(): Promise<TccStudents[]>;
  findOne(id: string): Promise<TccStudents>;
  update(id: string, updateTccStudentDto: UpdateTccStudentDto): Promise<string>;
  remove(id: string): Promise<number>;
  findByPk(id: string): Promise<TccStudents>;
}
