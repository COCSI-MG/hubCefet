import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExtensionActivityTypeDto } from './dto/create-extension-activity-type.dto';
import { UpdateExtensionActivityTypeDto } from './dto/update-extension-activity-type.dto';
import { ExtensionActivityTypeRepository } from './extension-activity-type.repository';
import { ApiResponseDto } from 'src/lib/dto/api-response.dto';

@Injectable()
export class ExtensionActivityTypeService {
  constructor(
    private readonly extensionActivityTypeRepository: ExtensionActivityTypeRepository
  ) { }

  async create(createExtensionActivityTypeDto: CreateExtensionActivityTypeDto) {
    const alredyExistsWithName = await this.extensionActivityTypeRepository.findOneByName(createExtensionActivityTypeDto.name)
    if (alredyExistsWithName) {
      throw new ConflictException('Ja existe uma atividade de extensao com este nome')
    }

    return await this.extensionActivityTypeRepository.create(createExtensionActivityTypeDto)
  }

  async findAll(limit: number, offset: number) {
    return await this.extensionActivityTypeRepository.findAll(limit, offset)
  }

  async findOne(id: number) {
    const extensionActivityType = await this.extensionActivityTypeRepository.findOne(id)
    if (!extensionActivityType) {
      throw new NotFoundException('Atividade de extensao nao encontrada')
    }

    return await this.extensionActivityTypeRepository.findOne(id)
  }


  async update(id: number, updateExtensionActivityTypeDto: UpdateExtensionActivityTypeDto) {
    const extensionActivityType = await this.extensionActivityTypeRepository.findOne(id)
    if (!extensionActivityType) {
      throw new NotFoundException('Atividade de extensao nao encontrada')
    }

    await this.extensionActivityTypeRepository.update(id, updateExtensionActivityTypeDto)
  }

  async remove(id: number) {
    const extensionActivityType = await this.extensionActivityTypeRepository.findOne(id)
    if (!extensionActivityType) {
      throw new NotFoundException('Atividade de extensao nao encontrada')
    }

    await this.extensionActivityTypeRepository.remove(id)
  }
}
