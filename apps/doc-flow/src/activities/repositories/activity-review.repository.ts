import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ActivityReview } from '../entities';
import { ReviewActivityDto } from '../dto/review-activity.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ActivityReviewRepository {
  constructor(
    @InjectModel(ActivityReview)
    private readonly activityReviewModel: typeof ActivityReview,
  ) {}

  async create(
    activityId: string,
    reviewerId: string,
    reviewData: ReviewActivityDto,
    transaction?: any,
  ): Promise<ActivityReview> {
    return this.activityReviewModel.create(
      {
        activity_id: activityId,
        reviewer_user_id: reviewerId,
        decision: reviewData.decision,
        comments: reviewData.comments,
        reviewed_at: new Date(),
      },
      { transaction },
    );
  }

  async findByActivity(activityId: string): Promise<ActivityReview[]> {
    return this.activityReviewModel.findAll({
      where: { activity_id: activityId },
      include: [{ model: User, as: 'reviewer' }],
      order: [['reviewed_at', 'DESC']],
    });
  }

  async findByReviewer(reviewerId: string): Promise<ActivityReview[]> {
    return this.activityReviewModel.findAll({
      where: { reviewer_user_id: reviewerId },
      include: [{ model: User, as: 'reviewer' }],
      order: [['reviewed_at', 'DESC']],
    });
  }

  async findOne(activityId: string, reviewerId: string, transaction?: any): Promise<ActivityReview | null> {
    return this.activityReviewModel.findOne({
      where: {
        activity_id: activityId,
        reviewer_user_id: reviewerId,
      },
      include: [{ model: User, as: 'reviewer' }],
      transaction,
    });
  }

  async countApprovedByActivity(activityId: string, transaction?: any): Promise<number> {
    return this.activityReviewModel.count({
      where: {
        activity_id: activityId,
        decision: 'APPROVED',
      },
      transaction,
    });
  }

  async countRejectedByActivity(activityId: string, transaction?: any): Promise<number> {
    return this.activityReviewModel.count({
      where: {
        activity_id: activityId,
        decision: 'REJECTED',
      },
      transaction,
    });
  }

  async countTotalByActivity(activityId: string, transaction?: any): Promise<number> {
    return this.activityReviewModel.count({
      where: { activity_id: activityId },
      transaction,
    });
  }
}
 
 
