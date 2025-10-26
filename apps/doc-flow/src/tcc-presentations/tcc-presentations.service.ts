import { Inject, Injectable } from '@nestjs/common';
import { CreateTccPresentationDto } from './dto/create-tcc-presentation.dto';
import { UpdateTccPresentationDto } from './dto/update-tcc-presentation.dto';
import { TccPresentationRepository } from './repositories/tcc-presentation.repository.interface';

@Injectable()
export class TccPresentationsService {
  constructor(
    @Inject('TccPresentationRepository')
    private readonly tccRepository: TccPresentationRepository,
  ) {}

  async create(createTccPresentationDto: CreateTccPresentationDto) {
    return await this.tccRepository.create(createTccPresentationDto);
  }

  async findAll() {
    return await this.tccRepository.findAll();
  }

  async findOne(id: string) {
    return await this.tccRepository.findOne(id);
  }

  async update(id: string, updateTccPresentationDto: UpdateTccPresentationDto) {
    return await this.tccRepository.update(id, updateTccPresentationDto);
  }

  async remove(id: string) {
    return await this.tccRepository.remove(id);
  }
}
