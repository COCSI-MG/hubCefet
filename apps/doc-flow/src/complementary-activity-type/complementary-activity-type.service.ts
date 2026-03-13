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

  async create(createComplementaryActivityTypeDto: CreateComplementaryActivityTypeDto): Promise<ApiResponseDto<string>> {
    const alredyExistsWithName = await this.complementaryActivityTypeRepository.findOneByName(createComplementaryActivityTypeDto.name)
    if (alredyExistsWithName) {
      throw new ConflictException('already exists one complemntary activity type with this name')
    }

    await this.complementaryActivityTypeRepository.create(createComplementaryActivityTypeDto)

    return {
      data: 'complementary activity type created successfully',
      error: null,
      status: 201,
      success: true
    }
  }

  async findAll(limit: number, offset: number) {
    return await this.complementaryActivityTypeRepository.findAll(limit, offset)
  }

  async findOne(id: number) {
    const complementaryActivityType = await this.complementaryActivityTypeRepository.findOne(id)
    if (!complementaryActivityType) {
      throw new NotFoundException('complementary acitivity type not found')
    }

    return await this.complementaryActivityTypeRepository.findOne(id)
  }


  async update(id: number, updateComplementaryActivityTypeDto: UpdateComplementaryActivityTypeDto): Promise<ApiResponseDto<string>> {
    const complementaryActivityType = await this.complementaryActivityTypeRepository.findOne(id)
    if (!complementaryActivityType) {
      throw new NotFoundException('complementary acitivity type not found')
    }

    await this.complementaryActivityTypeRepository.update(id, updateComplementaryActivityTypeDto)

    return {
      data: 'complementary activity type updated successfully',
      error: null,
      status: 200,
      success: true
    }
  }

  async remove(id: number): Promise<ApiResponseDto<string>> {
    const complementaryActivityType = await this.complementaryActivityTypeRepository.findOne(id)
    if (!complementaryActivityType) {
      throw new NotFoundException('complementary acitivity type not found')
    }

    await this.complementaryActivityTypeRepository.remove(id)

    return {
      data: 'complementary activity type deleted successfully',
      error: null,
      status: 200,
      success: true
    }
  }
}
