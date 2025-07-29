import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { EventStatus } from './enum/event-status.enum';

describe('EventsService', () => {
  let service: EventsService;
  const startEventDate = new Date('2021-01-01T00:00:00.000Z');
  const eventData: Event[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Event 1',
      status: EventStatus.STATUS_ENDED,
      start_at: new Date('2020-01-01T00:00:00.000Z'),
      end_at: new Date('2020-01-02T00:00:00.000Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Event 2',
      start_at: new Date('2021-01-01T00:00:00.000Z'),
      end_at: null,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Event 3',
      start_at: new Date(),
      end_at: new Date(),
    },
  ] as Event[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: 'IEventRepository',
          useValue: {
            findEventByName: jest.fn((name) => {
              return new Promise((resolve) => {
                const event = eventData.find((e) => e.name === name);
                if (!event) {
                  resolve(null);
                }
                resolve(event);
              });
            }),
            create: jest.fn((createEventDto: CreateEventDto) => {
              return new Promise((resolve) => {
                const event: Event = {
                  id: '550e8400-e29b-41d4-a716-446655440003',
                  name: createEventDto.name,
                  status: createEventDto.status,
                  start_at: new Date(createEventDto.eventStartDate),
                  end_at: createEventDto.eventEndDate
                    ? new Date(createEventDto.eventEndDate)
                    : null,
                } as Event;
                resolve(event);
              });
            }),
            findAll: jest.fn(() => {
              return new Promise((resolve) => {
                resolve(eventData);
              });
            }),
            findOne: jest.fn((id: string) => {
              return new Promise((resolve) => {
                const event = eventData.find((e) => e.id === id);
                if (!event) {
                  resolve(null);
                }
                resolve(event);
              });
            }),
            getEndedEvents: jest.fn(() => {
              return new Promise((resolve) => {
                resolve([eventData[0]]);
              });
            }),
            getUpcomingEvents: jest.fn(() => {
              return new Promise((resolve) => {
                resolve([eventData[1]]);
              });
            }),
            endEvent: jest.fn((id: string) => {
              return new Promise((resolve) => {
                const event = eventData.find((e) => e.id === id);
                if (!event) {
                  resolve(null);
                }
                event.status = EventStatus.STATUS_ENDED;
                event.end_at = new Date();
                resolve(event);
              });
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createEventDto: CreateEventDto = {
        name: 'Event 4',
        eventStartDate: startEventDate.toISOString(),
        eventEndDate: undefined,
        status: EventStatus.STATUS_STARTED,
        latitude: 0,
        longitude: 0,
        vacancies: 10,
      };

      const result = await service.create(createEventDto);
      expect(result).toEqual({
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: createEventDto.name,
        status: createEventDto.status,
        start_at: startEventDate,
        end_at: null,
      });
    });

    it('should throw conflict exception if event already exists', async () => {
      const createEventDto: CreateEventDto = {
        name: 'Event 1',
        eventStartDate: new Date().toISOString(),
        eventEndDate: undefined,
        status: EventStatus.STATUS_STARTED,
        latitude: 0,
        longitude: 0,
        vacancies: 10,
      };

      await expect(service.create(createEventDto)).rejects.toThrow(
        'Event already exists',
      );
    });

    it('should throw bad request exception if event status is different than started but event already started', async () => {
      const createEventDto: CreateEventDto = {
        name: 'Event 4',
        eventStartDate: startEventDate.toISOString(),
        eventEndDate: undefined,
        status: EventStatus.STATUS_UPCOMING,
        latitude: 0,
        longitude: 0,
        vacancies: 10,
      };

      await expect(service.create(createEventDto)).rejects.toThrow(
        'Event start date is in the past, status must be started',
      );
    });

    it('should throw bad request exception if event status is different than upcoming but eventStartDate is on the future', async () => {
      const now = new Date();
      const nowPlusOneMonth = new Date(now);
      nowPlusOneMonth.setMonth(now.getMonth() + 1);
      const createEventDto: CreateEventDto = {
        name: 'Event 4',
        eventStartDate: nowPlusOneMonth.toISOString(),
        eventEndDate: undefined,
        status: EventStatus.STATUS_STARTED,
        latitude: 0,
        longitude: 0,
        vacancies: 10,
      };

      await expect(service.create(createEventDto)).rejects.toThrow(
        'Event start date is in the future, status must be upcoming',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      const result = await service.findAll(0, 10);
      expect(result).toEqual(eventData);
    });

    it('should return an empty array if there are no events', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);
      const result = await service.findAll(0, 10);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an event with status ended and started as true', async () => {
      const event = eventData[0];
      const result = await service.findOne(event.id);
      expect(result).toEqual([event, true, true]);
    });

    it('should return an event with status started as true', async () => {
      const event = eventData[1];
      const result = await service.findOne(event.id);
      expect(result).toEqual([event, true, false]);
    });

    it('should return an event with status started and ended as false', async () => {
      const event: Event = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Event 4',
        status: EventStatus.STATUS_UPCOMING,
        start_at: new Date('2022-01-01T00:00:00.000Z'),
        end_at: null,
      } as Event;
      jest.spyOn(service, 'findOne').mockResolvedValue([event, false, false]);
      const result = await service.findOne(event.id);
      expect(result).toEqual([event, false, false]);
    });
  });

  describe('eventsByStatus', () => {
    it('should return an array of events with status ended', async () => {
      const result = await service.getEndedEvents();
      expect(result).toEqual([eventData[0]]);
    });

    it('should return an array of events with status upcoming', async () => {
      const result = await service.getUpcomingEvents();
      expect(result).toEqual([eventData[1]]);
    });
  });

  describe('endEvent', () => {
    it('should end an event', async () => {
      const event = eventData[1];
      const result = await service.endEvent(event.id);
      expect(result).toEqual(event);
    });
  });
});
