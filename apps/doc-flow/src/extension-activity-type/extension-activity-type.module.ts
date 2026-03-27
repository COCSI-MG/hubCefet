import { Module } from '@nestjs/common';
import { ExtensionActivityTypeService } from './extension-activity-type.service';
import { ExtensionActivityTypeController } from './extension-activity-type.controller';
import { ExtensionActivityTypeRepository } from './extension-activity-type.repository';
import { ExtensionActivityType } from './entities/extension-activity-type.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([ExtensionActivityType])],
  controllers: [ExtensionActivityTypeController],
  providers: [ExtensionActivityTypeService, ExtensionActivityTypeRepository],
})
export class ExtensionActivityTypeModule { }
