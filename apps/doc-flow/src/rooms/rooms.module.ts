import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';

/**
 * Módulo para gerenciamento de salas
 * 
 * Este módulo importa a implementação do submódulo rooms do timetable,
 * permitindo usá-lo de forma independente.
 */
@Module({
  imports: [SequelizeModule.forFeature([Room])],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {} 