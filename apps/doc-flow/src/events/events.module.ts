import { forwardRef, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Event } from './entities/event.entity';
import { EventRepositoryImpl } from './repositories/event.repository';
import { EventCronService } from './events-cron.service';
import { PresencesModule } from 'src/presences/presences.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Event]),
    forwardRef(() => PresencesModule),
    UsersModule
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    {
      provide: 'IEventRepository',
      useClass: EventRepositoryImpl,
    },
    EventCronService,
  ],
  exports: [EventsService, EventCronService],
})
export class EventsModule { }
