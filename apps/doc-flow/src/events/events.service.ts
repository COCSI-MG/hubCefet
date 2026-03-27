import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { EventRepository } from './repositories/event.repository.interface';
import { Event } from './entities/event.entity';
import { EventStatus } from './enum/event-status.enum';
import { UpdateEventDto } from './dto/update-event.dto';
import { UsersService } from 'src/users/users.service';
import { Profile } from 'src/profile/enum/profile.enum';

@Injectable()
export class EventsService {
  constructor(
    @Inject('IEventRepository')
    private readonly eventRepository: EventRepository,
    private readonly userService: UsersService,
  ) { }

  async create(createEventDto: CreateEventDto): Promise<null | Event> {
    const event = await this.eventRepository.findEventByName(
      createEventDto.name,
    );
    if (event) {
      throw new ConflictException('Evento com este nome ja existe');
    }

    const eventEndDate =
      createEventDto.end_at !== undefined
        ? new Date(createEventDto.end_at)
        : null;

    const now = new Date();
    const eventStartDate = new Date(createEventDto.start_at);
    if (createEventDto.status !== undefined) {
      const [result, message] = this.isValidEventStatusForEventDates(
        eventStartDate,
        eventEndDate,
        now,
        createEventDto.status,
      );

      if (!result && message !== null) {
        throw new BadRequestException(message);
      }
    }

    return await this.eventRepository.create({
      name: createEventDto.name,
      start_at: eventStartDate.toISOString(),
      end_at: eventEndDate?.toISOString() || null,
      status: createEventDto.status,
      created_by_user_id: createEventDto.created_by_user_id,
      latitude: createEventDto.latitude,
      longitude: createEventDto.longitude,
      vacancies: createEventDto.vacancies,
      radius: createEventDto.radius,
      description: createEventDto.description,
      presence_option: createEventDto.presence_option,
    });
  }

  async findAll(offset: number, limit: number): Promise<Event[]> {
    return await this.eventRepository.findAll(offset, limit);
  }

  async findOne(id: string): Promise<[Event, boolean, boolean] | null> {
    const event = await this.eventRepository.findOne(id);
    if (!event) {
      throw new NotFoundException("Evento nao encontrado")
    }

    const now = new Date();
    const isStarted: boolean = this.eventStarted(event.start_at, now);
    const isEnded: boolean =
      event.end_at === null ? false : this.eventEnded(event.end_at, now);
    return [event, isStarted, isEnded];
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string) {
    const event = await this.eventRepository.findOne(id);
    if (!event) throw new NotFoundException('Evento não encontrado');

    const now = new Date();
    if (event.end_at < now) {
      throw new UnprocessableEntityException('Não é possível editar eventos já finalizados');
    }

    await this.validatePermission(event, userId);

    if (updateEventDto.status != null) {
      const [result, message] = this.isValidEventStatusForEventDates(
        new Date(updateEventDto.start_at || event.start_at),
        updateEventDto.end_at ? new Date(updateEventDto.end_at) : new Date(event.end_at),
        now,
        updateEventDto.status,
      );

      if (!result && message) throw new BadRequestException(message);
    }

    return await this.eventRepository.update(id, updateEventDto);
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.eventRepository.findOne(id);
    if (!event) throw new NotFoundException('Evento não encontrado');

    const now = new Date();
    if (event.end_at < now) {
      throw new UnprocessableEntityException('Não é possível excluir eventos já finalizados');
    }

    if (event.start_at <= now) {
      throw new UnprocessableEntityException('Não é possível excluir eventos já em andamento ou iniciados');
    }

    await this.validatePermission(event, userId);

    await this.eventRepository.remove(id);
  }

  async endEvent(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne(id)
    if (!event) {
      throw new NotFoundException('Evento nao encontrado')
    }

    const now = new Date();
    if (event.end_at < now) {
      throw new UnprocessableEntityException('Não é possível finalizar eventos já finalizados');
    }

    return await this.eventRepository.endEvent(id);
  }

  async getUpcomingEvents(): Promise<Event[]> {
    return await this.eventRepository.getUpcomingEvents();
  }

  async getEndedEvents(): Promise<Event[]> {
    return await this.eventRepository.getEndedEvents();
  }

  async startEvent(id: string): Promise<Event> {
    return await this.eventRepository.update(id, {
      status: EventStatus.STATUS_STARTED,
    });
  }

  async getEventsByUserId(data: {
    userId: string;
    offset: number;
    limit: number;
  }): Promise<Event[]> {
    return await this.eventRepository.getEventsByUserId(data);
  }

  async search(q: string) {
    return await this.eventRepository.search(q);
  }

  private isValidEventEndDate(eventEndDate: Date, now: Date): boolean {
    const datePlusThenMinutes = new Date(now);
    datePlusThenMinutes.setMinutes(datePlusThenMinutes.getMinutes() + 10);
    if (eventEndDate > datePlusThenMinutes) {
      return true;
    }
    return false;
  }

  private isValidEventStatusForEventDates(
    eventStartDate: Date,
    eventEndDate: Date | null,
    now: Date,
    status: EventStatus,
  ): [boolean, string | null] {
    switch (status) {
      case EventStatus.STATUS_STARTED:
        if (eventStartDate >= now) {
          return [
            false,
            'Data de inicio do evento e no futuro, status deve ser Proximo',
          ];
        }
        if (
          eventEndDate !== null &&
          !this.isValidEventEndDate(eventEndDate, now)
        ) {
          return [false, 'Data de termino de evento deve ser maior que a atual'];
        }
        break;
      case EventStatus.STATUS_UPCOMING:
        if (eventStartDate <= now) {
          return [
            false,
            'Data de inicio do evento e no passado, status deve ser Em andamento',
          ];
        }
        break;
      case EventStatus.STATUS_ENDED:
        if (eventEndDate === null || eventEndDate >= now) {
          return [
            false,
            'Data de inicio do evento e no futuro, status nao pode ser Em andamento',
          ];
        }
        break;
      default:
        return [true, null];
    }
    return [true, null];
  }

  private eventStarted(start_at: Date, now: Date): boolean {
    return start_at < now;
  }

  private eventEnded(end_at: Date, now: Date): boolean {
    return end_at < now;
  }

  async decreaseVacancies(id: string) {
    const event = await this.findOne(id)

    const actualVacancies = event[0].vacancies
    if (actualVacancies <= 0) {
      throw new UnprocessableEntityException("Nao a vagas disponiveis")
    }

    return await this.eventRepository.updateVacancies(id, actualVacancies - 1);
  }

  private async validatePermission(event: any, userId: string) {
    const { data } = await this.userService.findOne(userId);
    const isAdmin = data.user.profile_id === Profile.Admin;
    const isOwner = event.user.id === userId;

    if (!isAdmin && !isOwner) {
      throw new UnprocessableEntityException('Sem permissão para alterar este evento');
    }
  }
}

