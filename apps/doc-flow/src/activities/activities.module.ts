import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ActivityTypeRepository } from './repositories/activity-type.repository';
import { ActivityReviewRepository } from './repositories/activity-review.repository';
import { ActivityReviewerRepository } from './repositories/activity-reviewer.repository';
import { ReviewSettingRepository } from './repositories/review-setting.repository';
import { ProfessorSelectionService } from './services/professor-selection.service';
import { FileUploadService } from './services/file-upload.service';
import {
  Activity,
  ActivityType,
  ActivityStatus,
  ActivityReviewer,
  ActivityReview,
  ReviewSetting,
} from './entities';
import { UsersModule } from '../users/users.module';
import { ActivityRepository } from './repositories/activity.repository';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Activity,
      ActivityType,
      ActivityStatus,
      ActivityReviewer,
      ActivityReview,
      ReviewSetting,
    ]),
    UsersModule,
  ],
  controllers: [ActivitiesController],
  providers: [
    ActivitiesService,
    ActivityRepository,
    ActivityTypeRepository,
    ActivityReviewRepository,
    ActivityReviewerRepository,
    ReviewSettingRepository,
    ProfessorSelectionService,
    FileUploadService,
  ],
  exports: [
    ActivitiesService,
    ActivityRepository,
    ActivityTypeRepository,
    ActivityReviewRepository,
    ActivityReviewerRepository,
    ReviewSettingRepository,
    ProfessorSelectionService,
    FileUploadService,
  ],
})
export class ActivitiesModule { }


