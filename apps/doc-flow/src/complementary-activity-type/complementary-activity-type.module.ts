import { Module } from '@nestjs/common';
import { ComplementaryActivityTypeService } from './complementary-activity-type.service';
import { ComplementaryActivityTypeController } from './complementary-activity-type.controller';

@Module({
  controllers: [ComplementaryActivityTypeController],
  providers: [ComplementaryActivityTypeService],
})
export class ComplementaryActivityTypeModule {}
