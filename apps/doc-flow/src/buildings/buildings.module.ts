import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { Building } from './entities/building.entity';

/**
 * Módulo para gerenciamento de blocos
 * 
 * Este módulo importa a implementação do submódulo buildings do timetable,
 * permitindo usá-lo de forma independente.
 */
@Module({
  imports: [SequelizeModule.forFeature([Building])],
  controllers: [BuildingsController],
  providers: [BuildingsService],
  exports: [BuildingsService],
})
export class BuildingsModule {} 