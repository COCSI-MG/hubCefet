import { Injectable } from "@nestjs/common";
import { ExtensionActivityType } from "./entities/extension-activity-type.entity";
import { CreateExtensionActivityTypeDto } from "./dto/create-extension-activity-type.dto";
import { UpdateExtensionActivityTypeDto } from "./dto/update-extension-activity-type.dto";
import sequelize from "sequelize";

@Injectable()
export class ExtensionActivityTypeRepository {
  async create(createExtensionActivityTypeDto: CreateExtensionActivityTypeDto) {
    return await ExtensionActivityType.create(createExtensionActivityTypeDto)
  }

  async findAll(limit: number, offset: number) {
    const options: { limit?: number, offset?: number } = {}

    if (limit) options.limit = limit;
    if (offset) options.offset = offset;

    return await ExtensionActivityType.findAndCountAll({
      order: sequelize.col('id'),
      ...options
    })
  }

  async findOne(id: number) {
    return await ExtensionActivityType.findOne({
      where: { id }
    })
  }

  async findOneByName(name: string) {
    return await ExtensionActivityType.findOne({
      where: { name }
    })
  }

  async update(id: number, updateExtensionActivityTypeDto: UpdateExtensionActivityTypeDto) {
    return await ExtensionActivityType.update(updateExtensionActivityTypeDto, {
      where: {
        id
      }
    })
  }

  async remove(id: number) {
    return await ExtensionActivityType.destroy({
      where: { id }
    })
  }
}
