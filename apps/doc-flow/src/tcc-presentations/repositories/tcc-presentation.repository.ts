import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TccPresentationRepository } from './tcc-presentation.repository.interface';
import { CreateTccPresentationDto } from '../dto/create-tcc-presentation.dto';
import { UpdateTccPresentationDto } from '../dto/update-tcc-presentation.dto';
import { TccPresentation } from '../entities/tcc-presentation.entity';

@Injectable()
export class TccPresentationRepositoryImpl
  implements TccPresentationRepository
{
  constructor(
    @InjectModel(TccPresentation)
    private tccModel: typeof TccPresentation,
  ) {}

  async create(
    createTccPresentationDto: CreateTccPresentationDto,
  ): Promise<TccPresentation> {
    return await this.tccModel.create({
      ...createTccPresentationDto,
    });
  }

  async findAll(): Promise<TccPresentation[]> {
    return await this.tccModel.findAll();
  }

  async findOne(id: string): Promise<TccPresentation> {
    const tcc = await this.tccModel.findByPk(id);
    if (!tcc) {
      throw new Error('TccPresentation not found');
    }
    return tcc;
  }

  async update(
    id: string,
    updateTccPresentationDto: UpdateTccPresentationDto,
  ): Promise<string> {
    // Implement update logic here
    return `This action updates a #${id} tcc`;
  }

  async remove(id: string): Promise<number> {
    return await this.tccModel.destroy({ where: { id } });
  }

  async findByPk(id: string): Promise<TccPresentation> {
    return await this.tccModel.findByPk(id);
  }
}
