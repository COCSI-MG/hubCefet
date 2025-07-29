import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClassSchedule } from './entities/class-schedule.entity';
import { TimeSlot } from './entities/time-slot.entity';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { TimeSlotsService } from './services/time-slots.service';
import { ClassSchedulesService } from './services/class-schedules.service';
import { ClassSchedulesController } from './controllers/class-schedules.controller';
import { TimeSlotsController } from './controllers/time-slots.controller';
import { ClassesModule } from '../classes/classes.module';
import { Class } from '../classes/entities/class.entity';
import { RoomsModule } from '../rooms/rooms.module';
import { BuildingsModule } from '../buildings/buildings.module';
import { Room } from '../rooms/entities/room.entity';
import { Building } from '../buildings/entities/building.entity';

/**
 * Módulo para gerenciamento de horários
 * 
 * Este módulo importa a implementação do submódulo schedules do timetable,
 * permitindo usá-lo de forma independente.
 */
@Module({
  imports: [
    SequelizeModule.forFeature([ClassSchedule, TimeSlot, Class, Room, Building]),
    forwardRef(() => ClassesModule),
    RoomsModule,
    BuildingsModule,
  ],
  controllers: [SchedulesController, ClassSchedulesController, TimeSlotsController],
  providers: [SchedulesService, TimeSlotsService, ClassSchedulesService],
  exports: [SchedulesService, TimeSlotsService, ClassSchedulesService],
})
export class SchedulesModule {} 