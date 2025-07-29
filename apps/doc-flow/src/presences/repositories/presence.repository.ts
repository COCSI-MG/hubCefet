import { InjectModel } from '@nestjs/sequelize';
import { PresenceRepository } from './presence.repository.interface';
import { CreatePresenceDto } from '../dto/create-presence.dto';
import { UpdatePresenceDto } from '../dto/update-presence.dto';
import { Presence } from '../entities/presence.entity';

export class PresenceRepositoryImpl implements PresenceRepository {
  constructor(
    @InjectModel(Presence)
    private readonly presenceModel: typeof Presence,
  ) {}

  async create(createPresenceDto: CreatePresenceDto): Promise<Presence> {
    return await this.presenceModel.create({
      ...createPresenceDto,
    });
  }

  async findAll(): Promise<Presence[]> {
    return await this.presenceModel.findAll();
  }

  async findOne(id: string): Promise<Presence> {
    return await this.presenceModel.findByPk(id);
  }

  async update(
    id: string,
    updatePresenceDto: UpdatePresenceDto,
  ): Promise<Presence> {
    const presence = await this.findOne(id);
    return await presence.update(updatePresenceDto);
  }

  async remove(id: string): Promise<void> {
    const presence = await this.findOne(id);
    await presence.destroy();
  }

  async findPresenceByName(name: string): Promise<Presence> {
    return await this.presenceModel.findOne({ where: { name } });
  }

  async findOrCreatedPresence(
    userId: string,
    eventId: string,
    status: string,
    checkInDate: string | null,
    checkOutDate: string | null,
  ): Promise<[Presence, boolean]> {
    return await this.presenceModel.findOrCreate({
      where: {
        user_id: userId,
        event_id: eventId,
      },
      defaults: {
        user_id: userId,
        event_id: eventId,
        status: status,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
      },
    });
  }

  async findAllByEvent(eventId: string): Promise<Presence[]> {
    return await this.presenceModel.findAll({ where: { event_id: eventId } });
  }

  async findAllByUser(userId: string): Promise<Presence[]> {
    return await this.presenceModel.findAll({ where: { user_id: userId } });
  }
}
