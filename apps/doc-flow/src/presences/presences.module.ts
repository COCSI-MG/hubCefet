import { Module } from '@nestjs/common';
import { PresencesService } from './presences.service';
import { PresencesController } from './presences.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Presence } from './entities/presence.entity';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';
import { PresenceRepositoryImpl } from './repositories/presence.repository';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    SequelizeModule.forFeature([Presence]), 
    UsersModule, 
    EventsModule,
    BullModule.registerQueue({
      name: 'pdf-generation',
    }),
  ],
  controllers: [PresencesController],
  providers: [
    PresencesService,
    {
      provide: 'IPresenceRepository',
      useClass: PresenceRepositoryImpl,
    },
  ],
})
export class PresencesModule {}
