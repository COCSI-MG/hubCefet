import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions, WhereOptions, Op, literal, QueryTypes } from 'sequelize';
import { ComplementaryActivity, ActivityType, ActivityStatus, ActivityReviewer, ActivityReview } from '../entities';
import { CreateComplementaryActivityDto } from '../dto/create-complementary-activity.dto';
import { UpdateComplementaryActivityDto } from '../dto/update-complementary-activity.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ComplementaryActivityRepository {
  constructor(
    @InjectModel(ComplementaryActivity)
    private readonly complementaryActivityModel: typeof ComplementaryActivity,
  ) {}

  async create(
    createDto: CreateComplementaryActivityDto,
    userId: string,
  ): Promise<ComplementaryActivity> {
    return this.complementaryActivityModel.create({
      ...createDto,
      user_id: userId,
      status_id: 1,
    });
  }

  async createWithTransaction(
    createDto: CreateComplementaryActivityDto,
    userId: string,
    transaction: any,
  ): Promise<ComplementaryActivity> {
    return this.complementaryActivityModel.create({
      ...createDto,
      user_id: userId,
      status_id: 1,
    }, { transaction });
  }

  async findAll(options?: FindOptions): Promise<ComplementaryActivity[]> {
    return this.complementaryActivityModel.findAll({
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

  async findByUserId(userId: string): Promise<ComplementaryActivity[]> {
    return this.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
  }

  async findByReviewer(reviewerId: string): Promise<ComplementaryActivity[]> {
    const reviewedActivityIds = await this.complementaryActivityModel.sequelize.query(
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

    return this.complementaryActivityModel.findAll({
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

  async findOne(id: string): Promise<ComplementaryActivity | null> {
    return this.complementaryActivityModel.findByPk(id, {
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
    updateDto: UpdateComplementaryActivityDto,
  ): Promise<[number, ComplementaryActivity[]]> {
    return this.complementaryActivityModel.update(updateDto, {
      where: { id },
      returning: true,
    });
  }

  async updateStatus(id: string, statusId: number): Promise<void> {
    await this.complementaryActivityModel.update(
      { status_id: statusId },
      { where: { id } },
    );
  }

  async remove(id: string): Promise<number> {
    return this.complementaryActivityModel.destroy({
      where: { id },
    });
  }

  async findByStatus(statusId: number): Promise<ComplementaryActivity[]> {
    return this.findAll({
      where: { status_id: statusId },
      order: [['created_at', 'DESC']],
    });
  }

  async countByUser(userId: string): Promise<number> {
    return this.complementaryActivityModel.count({
      where: { user_id: userId },
    });
  }

  async findPendingReview(): Promise<ComplementaryActivity[]> {
    return this.findAll({
      where: { status_id: 1 },
      order: [['created_at', 'ASC']],
    });
  }

  getSequelize() {
    return this.complementaryActivityModel.sequelize;
  }
} 