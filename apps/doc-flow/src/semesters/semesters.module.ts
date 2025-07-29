import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Semester } from './entities/semester.entity';
import { SemestersController } from './semesters.controller';
import { SemestersService } from './semesters.service';

@Module({
  imports: [SequelizeModule.forFeature([Semester])],
  controllers: [SemestersController],
  providers: [SemestersService],
  exports: [SemestersService],
})
export class SemestersModule {} 