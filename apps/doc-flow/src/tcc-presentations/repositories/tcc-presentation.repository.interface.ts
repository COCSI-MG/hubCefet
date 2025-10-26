import { CreateTccPresentationDto } from '../dto/create-tcc-presentation.dto';
import { UpdateTccPresentationDto } from '../dto/update-tcc-presentation.dto';
import { TccPresentation } from '../entities/tcc-presentation.entity';

export interface TccPresentationRepository {
  create(
    createTccPresentationDto: CreateTccPresentationDto,
  ): Promise<TccPresentation>;
  findAll(): Promise<TccPresentation[]>;
  findOne(id: string): Promise<TccPresentation>;
  update(
    id: string,
    updateTccPresentationDto: UpdateTccPresentationDto,
  ): Promise<string>;
  remove(id: string): Promise<number>;
  findByPk(id: string): Promise<TccPresentation>;
}
