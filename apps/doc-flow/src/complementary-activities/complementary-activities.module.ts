import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ComplementaryActivitiesService } from './complementary-activities.service';
import { ComplementaryActivitiesController } from './complementary-activities.controller';
import { ComplementaryActivityRepository } from './repositories/complementary-activity.repository';
import { ActivityTypeRepository } from './repositories/activity-type.repository';
import { ActivityReviewRepository } from './repositories/activity-review.repository';
import { ActivityReviewerRepository } from './repositories/activity-reviewer.repository';
import { ReviewSettingRepository } from './repositories/review-setting.repository';
import { ProfessorSelectionService } from './services/professor-selection.service';
import { FileUploadService } from './services/file-upload.service';
import {
  ComplementaryActivity,
  ActivityType,
  ActivityStatus,
  ActivityReviewer,
  ActivityReview,
  ReviewSetting,
} from './entities';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ComplementaryActivity,
      ActivityType,
      ActivityStatus,
      ActivityReviewer,
      ActivityReview,
      ReviewSetting,
    ]),
    UsersModule,
  ],
  controllers: [ComplementaryActivitiesController],
  providers: [
    ComplementaryActivitiesService,
    ComplementaryActivityRepository,
    ActivityTypeRepository,
    ActivityReviewRepository,
    ActivityReviewerRepository,
    ReviewSettingRepository,
    ProfessorSelectionService,
    FileUploadService,
  ],
  exports: [
    ComplementaryActivitiesService,
    ComplementaryActivityRepository,
    ActivityTypeRepository,
    ActivityReviewRepository,
    ActivityReviewerRepository,
    ReviewSettingRepository,
    ProfessorSelectionService,
    FileUploadService,
  ],
})
export class ComplementaryActivitiesModule {} 
 
 