import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ActivityHistory } from '../entities';
import { ActivityHistoryType } from '../enum/activity-history-type.enum';

@Injectable()
export class ActivityHistoryRepository {
  constructor(
    @InjectModel(ActivityHistory)
    private readonly activityHistoryModel: typeof ActivityHistory,
  ) {}

  async create(
    activityId: string,
    userId: string,
    type: ActivityHistoryType,
    description: string,
  ): Promise<ActivityHistory> {
    return this.activityHistoryModel.create({
      activity_id: activityId,
      user_id: userId,
      type,
      description,
    });
  }

  async createWithTransaction(
    activityId: string,
    userId: string,
    type: ActivityHistoryType,
    description: string,
    transaction: any,
  ): Promise<ActivityHistory> {
    return this.activityHistoryModel.create(
      {
        activity_id: activityId,
        user_id: userId,
        type,
        description,
      },
      { transaction },
    );
  }
}
