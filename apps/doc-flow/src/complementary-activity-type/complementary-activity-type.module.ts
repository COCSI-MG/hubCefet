import { Module } from '@nestjs/common';
import { ComplementaryActivityTypeService } from './complementary-activity-type.service';
import { ComplementaryActivityTypeController } from './complementary-activity-type.controller';
import { ComplementaryActivityTypeRepository } from './complementary-activity-type.repository';
import { ComplementaryActivityType } from './entities/complementary-activity-type.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([ComplementaryActivityType])],
  controllers: [ComplementaryActivityTypeController],
  providers: [ComplementaryActivityTypeService, ComplementaryActivityTypeRepository],
})
export class ComplementaryActivityTypeModule { }
