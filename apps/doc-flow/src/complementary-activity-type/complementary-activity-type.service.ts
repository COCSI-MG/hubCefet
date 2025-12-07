import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateComplementaryActivityTypeDto } from './dto/create-complementary-activity-type.dto';
import { UpdateComplementaryActivityTypeDto } from './dto/update-complementary-activity-type.dto';
import { ComplementaryActivityTypeRepository } from './complementary-activity-type.repository';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

@Injectable()
export class ComplementaryActivityTypeService {
  constructor(
    private readonly complementaryActivityTypeRepository: ComplementaryActivityTypeRepository
  ) { }

  async create(createComplementaryActivityTypeDto: CreateComplementaryActivityTypeDto) {
    const alredyExistsWithName = await this.complementaryActivityTypeRepository.findOneByName(createComplementaryActivityTypeDto.name)
    if (alredyExistsWithName) {
      throw new ConflictException('Ja existe uma atividade complementar com este nome')
    }

    return await this.complementaryActivityTypeRepository.create(createComplementaryActivityTypeDto)
  }

  async findAll(limit: number, offset: number) {
    return await this.complementaryActivityTypeRepository.findAll(limit, offset)
  }

  async findOne(id: number) {
    const complementaryActivityType = await this.complementaryActivityTypeRepository.findOne(id)
    if (!complementaryActivityType) {
      throw new NotFoundException('Ativiade complementar nao encontrada')
    }

    return await this.complementaryActivityTypeRepository.findOne(id)
  }


  async update(id: number, updateComplementaryActivityTypeDto: UpdateComplementaryActivityTypeDto) {
    const complementaryActivityType = await this.complementaryActivityTypeRepository.findOne(id)
    if (!complementaryActivityType) {
      throw new NotFoundException('Ativiade complementar nao encontrada')
    }

    await this.complementaryActivityTypeRepository.update(id, updateComplementaryActivityTypeDto)
  }

  async remove(id: number) {
    const complementaryActivityType = await this.complementaryActivityTypeRepository.findOne(id)
    if (!complementaryActivityType) {
      throw new NotFoundException('Ativiade complementar nao encontrada')
    }

    await this.complementaryActivityTypeRepository.remove(id)
  }
}
