import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ActivityType } from '../entities';

@Injectable()
export class ActivityTypeRepository {
  constructor(
    @InjectModel(ActivityType)
    private readonly activityTypeModel: typeof ActivityType,
  ) {}

  async findAll(): Promise<ActivityType[]> {
    return this.activityTypeModel.findAll({
      order: [['name', 'ASC']],
    });
  }

  async findOne(id: number): Promise<ActivityType | null> {
    return this.activityTypeModel.findByPk(id);
  }

  async findByName(name: string): Promise<ActivityType | null> {
    return this.activityTypeModel.findOne({
      where: { name },
    });
  }
} 
 
 