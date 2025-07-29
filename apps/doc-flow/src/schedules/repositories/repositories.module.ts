import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Class } from '../../classes/entities/class.entity';
import { TimeSlot } from '../entities/time-slot.entity';
import { ClassSchedule } from '../entities/class-schedule.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Class, TimeSlot, ClassSchedule]),
  ],
  exports: [SequelizeModule],
})
export class RepositoriesModule {} 