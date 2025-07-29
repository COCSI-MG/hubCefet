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
  ): Promise<ActivityReview> {
    return this.activityReviewModel.create({
      activity_id: activityId,
      reviewer_user_id: reviewerId,
      decision: reviewData.decision,
      comments: reviewData.comments,
      reviewed_at: new Date(),
    });
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

  async findOne(activityId: string, reviewerId: string): Promise<ActivityReview | null> {
    return this.activityReviewModel.findOne({
      where: {
        activity_id: activityId,
        reviewer_user_id: reviewerId,
      },
      include: [{ model: User, as: 'reviewer' }],
    });
  }

  async countApprovedByActivity(activityId: string): Promise<number> {
    return this.activityReviewModel.count({
      where: {
        activity_id: activityId,
        decision: 'APPROVED',
      },
    });
  }

  async countRejectedByActivity(activityId: string): Promise<number> {
    return this.activityReviewModel.count({
      where: {
        activity_id: activityId,
        decision: 'REJECTED',
      },
    });
  }

  async countTotalByActivity(activityId: string): Promise<number> {
    return this.activityReviewModel.count({
      where: { activity_id: activityId },
    });
  }
}
 
 