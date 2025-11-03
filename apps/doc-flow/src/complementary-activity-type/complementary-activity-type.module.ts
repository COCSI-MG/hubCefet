import { Module } from '@nestjs/common';
import { ComplementaryActivityTypeService } from './complementary-activity-type.service';
import { ComplementaryActivityTypeController } from './complementary-activity-type.controller';
import { ComplementaryActivityTypeRepository } from './complementary-activity-type.repository';

@Module({
  controllers: [ComplementaryActivityTypeController],
  providers: [ComplementaryActivityTypeService, ComplementaryActivityTypeRepository],
})
export class ComplementaryActivityTypeModule { }
