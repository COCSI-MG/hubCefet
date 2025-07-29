import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Class } from '../classes/entities/class.entity';
import { TimeSlot } from '../schedules/entities/time-slot.entity';
import { ClassSchedule } from '../schedules/entities/class-schedule.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Class,
      TimeSlot,
      ClassSchedule,
    ]),
  ],
  exports: [
    SequelizeModule,
  ],
})
export class SharedModule {} 