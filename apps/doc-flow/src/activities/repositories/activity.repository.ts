import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions, WhereOptions, Op, literal, QueryTypes } from 'sequelize';
import { Activity, ActivityType, ActivityStatus, ActivityReviewer, ActivityReview } from '../entities';
import { User } from '../../users/entities/user.entity';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { UpdateActivityDto } from '../dto/update-activity.dto';

@Injectable()
export class ActivityRepository {
  constructor(
    @InjectModel(Activity)
    private readonly activityModel: typeof Activity,
  ) { }

  async create(
    createDto: CreateActivityDto,
    userId: string,
  ): Promise<Activity> {
    return this.activityModel.create({
      ...createDto,
      user_id: userId,
      status_id: 1,
    });
  }

  async createWithTransaction(
    createDto: CreateActivityDto,
    userId: string,
    transaction: any,
  ): Promise<Activity> {
    return this.activityModel.create({
      ...createDto,
      user_id: userId,
      status_id: 1,
    }, { transaction });
  }

  async findAll(options?: FindOptions): Promise<Activity[]> {
    return this.activityModel.findAll({
      include: [
        { model: ActivityType, as: 'activityType' },
        { model: ActivityStatus, as: 'status' },
        { model: User, as: 'user' },
        {
          model: ActivityReviewer,
          as: 'reviewers',
          include: [{ model: User, as: 'reviewer' }],
        },
        {
          model: ActivityReview,
          as: 'reviews',
          include: [{ model: User, as: 'reviewer' }],
        },
      ],
      ...options,
    });
  }

  async findByUserId(userId: string): Promise<Activity[]> {
    return this.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
  }

  async findByReviewer(reviewerId: string): Promise<Activity[]> {
    const reviewedActivityIds = await this.activityModel.sequelize.query(
      `SELECT DISTINCT activity_id FROM activity_reviews WHERE reviewer_user_id = :reviewerId`,
      {
        replacements: { reviewerId },
        type: QueryTypes.SELECT,
      }
    ) as { activity_id: string }[];

    const reviewedIds = reviewedActivityIds.map(row => row.activity_id);

    const whereClause: any = {
      status_id: {
        [Op.ne]: 3
      }
    };

    if (reviewedIds.length > 0) {
      whereClause.id = {
        [Op.notIn]: reviewedIds
      };
    }

    return this.activityModel.findAll({
      include: [
        { model: ActivityType, as: 'activityType' },
        { model: ActivityStatus, as: 'status' },
        { model: User, as: 'user' },
        {
          model: ActivityReviewer,
          as: 'reviewers',
          where: { reviewer_user_id: reviewerId },
          include: [{ model: User, as: 'reviewer' }],
        },
        {
          model: ActivityReview,
          as: 'reviews',
          include: [{ model: User, as: 'reviewer' }],
        },
      ],
      where: whereClause,
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Activity | null> {
    return this.activityModel.findByPk(id, {
      include: [
        { model: ActivityType, as: 'activityType' },
        { model: ActivityStatus, as: 'status' },
        { model: User, as: 'user' },
        {
          model: ActivityReviewer,
          as: 'reviewers',
          include: [{ model: User, as: 'reviewer' }],
        },
        {
          model: ActivityReview,
          as: 'reviews',
          include: [{ model: User, as: 'reviewer' }],
        },
      ],
    });
  }

  async update(
    id: string,
    updateDto: UpdateActivityDto,
  ): Promise<[number, Activity[]]> {
    return this.activityModel.update(updateDto, {
      where: { id },
      returning: true,
    });
  }

  async updateStatus(id: string, statusId: number): Promise<void> {
    await this.activityModel.update(
      { status_id: statusId },
      { where: { id } },
    );
  }

  async remove(id: string): Promise<number> {
    return this.activityModel.destroy({
      where: { id },
    });
  }

  async findByStatus(statusId: number): Promise<Activity[]> {
    return this.findAll({
      where: { status_id: statusId },
      order: [['created_at', 'DESC']],
    });
  }

  async countByUser(userId: string): Promise<number> {
    return this.activityModel.count({
      where: { user_id: userId },
    });
  }

  async findPendingReview(): Promise<Activity[]> {
    return this.findAll({
      where: { status_id: 1 },
      order: [['created_at', 'ASC']],
    });
  }

  getSequelize() {
    return this.activityModel.sequelize;
  }
} 
