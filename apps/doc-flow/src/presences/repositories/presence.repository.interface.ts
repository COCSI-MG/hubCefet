import { CreatePresenceDto } from '../dto/create-presence.dto';
import { UpdatePresenceDto } from '../dto/update-presence.dto';
import { Presence } from '../entities/presence.entity';

export interface PresenceRepository {
  create(createPresenceDto: CreatePresenceDto): Promise<Presence>;
  findAll(): Promise<Presence[]>;
  findOne(id: string): Promise<Presence>;
  update(id: string, updatePresenceDto: UpdatePresenceDto): Promise<Presence>;
  remove(id: string): Promise<void>;
  findPresenceByName(name: string): Promise<Presence>;
  findOrCreatedPresence(
    userId: string,
    eventId: string,
    status: string,
    checkInDate: string | null,
    checkOutDate: string | null,
  ): Promise<[Presence, boolean]>;
  findAllByEvent(eventId: string): Promise<Presence[]>;
  findAllByUser(userId: string): Promise<Presence[]>;
}
