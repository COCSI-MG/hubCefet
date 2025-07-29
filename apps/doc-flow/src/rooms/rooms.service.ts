import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room)
    private roomModel: typeof Room,
  ) {}

  async findAll(buildingId?: number): Promise<Room[]> {
    const options: any = {
      include: { all: true },
    };

    if (buildingId) {
      options.where = { building_id: buildingId };
    }

    return this.roomModel.findAll(options);
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomModel.findByPk(id, {
      include: { all: true },
    });

    if (!room) {
      throw new NotFoundException(`Sala com ID ${id} não encontrada`);
    }

    return room;
  }

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    return this.roomModel.create(createRoomDto as any);
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    
    await room.update(updateRoomDto);
    await room.reload();
    
    return room;
  }

  async remove(id: number): Promise<void> {
    const room = await this.findOne(id);
    await room.destroy();
  }
} 