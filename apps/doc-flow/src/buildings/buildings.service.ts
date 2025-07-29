import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Building } from './entities/building.entity';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectModel(Building)
    private buildingModel: typeof Building,
  ) {}

  async findAll(): Promise<Building[]> {
    return this.buildingModel.findAll({
      include: { all: true },
    });
  }

  async findOne(id: number): Promise<Building> {
    const building = await this.buildingModel.findByPk(id, {
      include: { all: true },
    });

    if (!building) {
      throw new NotFoundException(`Bloco com ID ${id} não encontrado`);
    }

    return building;
  }

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    return this.buildingModel.create(createBuildingDto as any);
  }

  async update(id: number, updateBuildingDto: UpdateBuildingDto): Promise<Building> {
    const building = await this.findOne(id);
    
    await building.update(updateBuildingDto);
    await building.reload();
    
    return building;
  }

  async remove(id: number): Promise<void> {
    const building = await this.findOne(id);
    await building.destroy();
  }
} 