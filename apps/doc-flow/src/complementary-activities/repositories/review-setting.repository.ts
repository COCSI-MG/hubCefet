import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ReviewSetting } from '../entities';

@Injectable()
export class ReviewSettingRepository {
  constructor(
    @InjectModel(ReviewSetting)
    private readonly reviewSettingModel: typeof ReviewSetting,
  ) {}

  async findByKey(key: string): Promise<ReviewSetting | null> {
    return this.reviewSettingModel.findOne({
      where: { key },
    });
  }

  async getRequiredReviewers(): Promise<number> {
    const setting = await this.findByKey('required_reviewers');
    return setting ? setting.required_approvals : 3;
  }

  async updateRequiredReviewers(count: number): Promise<void> {
    await this.reviewSettingModel.update(
      { required_approvals: count },
      { where: { key: 'required_reviewers' } }
    );
  }
} 
 
 