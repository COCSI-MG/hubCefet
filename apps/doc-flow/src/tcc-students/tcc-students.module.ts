import { Module } from '@nestjs/common';
import { TccStudentsService } from './tcc-students.service';
import { TccStudentsController } from './tcc-students.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TccStudents } from './entities/tcc-students.entity';
import { TCC_STUDENTS_REPOSITORY } from './repositories/tcc-students.repository.token';
import { TccStudentsRepositoryImpl } from './repositories/tcc-students.repository';

@Module({
  imports: [SequelizeModule.forFeature([TccStudents])],
  controllers: [TccStudentsController],
  providers: [
    TccStudentsService,
    {
      provide: TCC_STUDENTS_REPOSITORY,
      useClass: TccStudentsRepositoryImpl,
    },
  ],
})
export class TccStudentsModule {}
