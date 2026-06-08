import { CreatePresenceDto } from '../dto/create-presence.dto';
import { Presence } from '../entities/presence.entity';
import { PresenceStatus } from '../enum/presence-status.enum';
import { UpdatePresenceData } from '../types/update-presence-data.type';

export interface PresenceRepository {
  create(createPresenceDto: CreatePresenceDto): Promise<Presence>;
  findAll(): Promise<Presence[]>;
  findOne(id: string): Promise<Presence>;
  update(id: string, data: UpdatePresenceData): Promise<Presence>;
  remove(id: string): Promise<void>;
  findPresenceByName(name: string): Promise<Presence>;
  findOrCreatedPresence(
    userId: string,
    eventId: string,
  ): Promise<[Presence, boolean]>;
  findAllByEvent(eventId: string): Promise<Presence[]>;
  findAllByUser(userId: string): Promise<Presence[]>;
  findByUserAndEventId(userId: string, eventId: string): Promise<Presence>
  updateAllStatusByEventId(eventId: string, status: PresenceStatus): Promise<void>
}
