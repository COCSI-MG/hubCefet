import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Class } from './entities/class.entity';
import { ClassStudent } from './entities/class-student.entity';
import { ClassCancellation } from './entities/class-cancellation.entity';
import { ClassesController } from './controllers/classes.controller';
import { ClassesService } from './services/classes.service';
import { Room } from '../rooms/entities/room.entity';
import { Building } from '../buildings/entities/building.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Semester } from '../semesters/entities/semester.entity';
import { User } from '../users/entities/user.entity';
import { TimeSlot } from '../schedules/entities/time-slot.entity';
import { ClassSchedule } from '../schedules/entities/class-schedule.entity';
import { SchedulesModule } from '../schedules/schedules.module';
import { SharedModule } from '../shared/shared.module';
import { CancellationsController } from './cancellations.controller';
import { EmailModule } from '../email/email.module';

/**
 * Módulo para gerenciamento de aulas
 * 
 * Este módulo importa a implementação do submódulo classes do timetable,
 * permitindo usá-lo de forma independente.
 */
@Module({
  imports: [
    SharedModule,
    EmailModule,
    SequelizeModule.forFeature([
      Class, 
      ClassStudent,
      ClassCancellation,
      Room,
      Building,
      Subject,
      Semester,
      User,
      TimeSlot,
      ClassSchedule
    ]),
    forwardRef(() => SchedulesModule),
  ],
  controllers: [ClassesController, CancellationsController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {} 