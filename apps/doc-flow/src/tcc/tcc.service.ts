import { Inject, Injectable } from '@nestjs/common';
import { CreateTccDto } from './dto/create-tcc.dto';
import { UpdateTccDto } from './dto/update-tcc.dto';
import { TccRepository } from './repositories/tcc.repository.interface';

@Injectable()
export class TccService {
  constructor(
    @Inject('TccRepository')
    private readonly tccRepository: TccRepository,
  ) {}

  async create(createTccDto: CreateTccDto) {
    return await this.tccRepository.create(createTccDto);
  }

  async findAll() {
    return await this.tccRepository.findAll();
  }

  async findOne(id: string) {
    return await this.tccRepository.findOne(id);
  }

  async update(id: string, updateTccDto: UpdateTccDto) {
    return await this.tccRepository.update(id, updateTccDto);
  }

  async remove(id: string) {
    return await this.tccRepository.remove(id);
  }
}
