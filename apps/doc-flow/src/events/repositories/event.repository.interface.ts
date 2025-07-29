import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { Event } from '../entities/event.entity';

interface GetEventsByUserIdParams {
  userId: string;
  offset: number;
  limit: number;
}

export interface EventRepository {
  create(createEventDto: CreateEventDto): Promise<Event>;
  findAll(offset: number, limit: number): Promise<Event[]>;
  findOne(id: string): Promise<Event>;
  update(id: string, updateEventDto: UpdateEventDto): Promise<Event>;
  remove(id: string): Promise<void>;
  findEventByName(name: string): Promise<Event>;
  findOrCreateEvent(name: string): Promise<[Event, boolean]>;
  endEvent(id: string): Promise<null | Event>;
  getUpcomingEvents(): Promise<Event[]>;
  getEndedEvents(): Promise<Event[]>;
  getEventsByUserId(args: GetEventsByUserIdParams): Promise<Event[]>;
  search(query: string): Promise<Event[]>;
}
