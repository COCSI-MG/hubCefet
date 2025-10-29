import { Injectable } from '@nestjs/common';
import { CreateComplementaryActivityTypeDto } from './dto/create-complementary-activity-type.dto';
import { UpdateComplementaryActivityTypeDto } from './dto/update-complementary-activity-type.dto';
import { ComplementaryActivityTypeRepository } from './complementary-activity-type.repository';

@Injectable()
export class ComplementaryActivityTypeService {
  constructor(
    private readonly complementaryActivityTypeRepository: ComplementaryActivityTypeRepository
  ) { }

  create(createComplementaryActivityTypeDto: CreateComplementaryActivityTypeDto) {
    return 'This action adds a new complementaryActivityType';
  }

  findAll() {
    return `This action returns all complementaryActivityType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} complementaryActivityType`;
  }

  update(id: number, updateComplementaryActivityTypeDto: UpdateComplementaryActivityTypeDto) {
    return `This action updates a #${id} complementaryActivityType`;
  }

  remove(id: number) {
    return `This action removes a #${id} complementaryActivityType`;
  }
}
