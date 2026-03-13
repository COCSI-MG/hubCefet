import { Injectable } from "@nestjs/common";
import { ComplementaryActivityType } from "./entities/complementary-activity-type.entity";
import { CreateComplementaryActivityTypeDto } from "./dto/create-complementary-activity-type.dto";
import { UpdateComplementaryActivityTypeDto } from "./dto/update-complementary-activity-type.dto";
import sequelize from "sequelize";

@Injectable()
export class ComplementaryActivityTypeRepository {
  async create(createComplementaryActivityTypeDto: CreateComplementaryActivityTypeDto) {
    return await ComplementaryActivityType.create(createComplementaryActivityTypeDto)
  }

  async findAll(limit: number, offset: number) {
    const options: { limit?: number, offset?: number } = {}

    if (limit) options.limit = limit;
    if (offset) options.offset = offset;

    return await ComplementaryActivityType.findAndCountAll({
      order: sequelize.col('id'),
      ...options
    })
  }

  async findOne(id: number) {
    return await ComplementaryActivityType.findOne({
      where: { id }
    })
  }

  async findOneByName(name: string) {
    return await ComplementaryActivityType.findOne({
      where: { name }
    })
  }

  async update(id: number, updateComplementaryActivityTypeDto: UpdateComplementaryActivityTypeDto) {
    return await ComplementaryActivityType.update(updateComplementaryActivityTypeDto, {
      where: {
        id
      }
    })
  }

  async remove(id: number) {
    return await ComplementaryActivityType.destroy({
      where: { id }
    })
  }
}
