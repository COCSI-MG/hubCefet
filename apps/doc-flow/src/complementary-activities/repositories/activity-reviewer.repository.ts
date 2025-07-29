import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ActivityReviewer } from '../entities';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ActivityReviewerRepository {
  constructor(
    @InjectModel(ActivityReviewer)
    private readonly activityReviewerModel: typeof ActivityReviewer,
  ) {}

  async createMultiple(
    activityId: string,
    reviewerIds: string[],
  ): Promise<ActivityReviewer[]> {
    const reviewers = reviewerIds.map(reviewerId => ({
      activity_id: activityId,
      reviewer_user_id: reviewerId,
      assigned_at: new Date(),
    }));

    return this.activityReviewerModel.bulkCreate(reviewers);
  }

  async createMultipleWithTransaction(
    activityId: string,
    reviewerIds: string[],
    transaction: any,
  ): Promise<ActivityReviewer[]> {
    const reviewers = reviewerIds.map(reviewerId => ({
      activity_id: activityId,
      reviewer_user_id: reviewerId,
      assigned_at: new Date(),
    }));

    return this.activityReviewerModel.bulkCreate(reviewers, { transaction });
  }

  async findByActivity(activityId: string): Promise<ActivityReviewer[]> {
    return this.activityReviewerModel.findAll({
      where: { activity_id: activityId },
      include: [{ model: User, as: 'reviewer' }],
    });
  }

  async findByReviewer(reviewerId: string): Promise<ActivityReviewer[]> {
    return this.activityReviewerModel.findAll({
      where: { reviewer_user_id: reviewerId },
      include: [{ model: User, as: 'reviewer' }],
    });
  }

  async removeByActivity(activityId: string): Promise<number> {
    return this.activityReviewerModel.destroy({
      where: { activity_id: activityId },
    });
  }
} 
 
 