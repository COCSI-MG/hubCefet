import { PartialType } from '@nestjs/swagger';
import { CreateTccStudentDto } from './create-tcc-student.dto';

export class UpdateTccStudentDto extends PartialType(CreateTccStudentDto) {}
