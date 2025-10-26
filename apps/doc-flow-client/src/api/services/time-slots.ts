import { privateAxiosInstance } from '../axios-instance';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  day_of_week: DayOfWeek;
  createdAt?: string;
  updatedAt?: string;
}

interface TimeSlotApiResponse {
  id: number;
  startTime: string;
  endTime: string;
  dayOfWeek: DayOfWeek;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTimeSlotDto {
  start_time: string;
  end_time: string;
  day_of_week: DayOfWeek;
}

export interface UpdateTimeSlotDto {
  start_time?: string;
  end_time?: string;
  day_of_week?: DayOfWeek;
}

const mapApiResponseToTimeSlot = (data: TimeSlotApiResponse): TimeSlot => ({
  id: data.id,
  start_time: data.startTime,
  end_time: data.endTime,
  day_of_week: data.dayOfWeek,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt
});

export const timeSlotsService = {
  getAllTimeSlots: async (): Promise<TimeSlot[]> => {
    const response = await privateAxiosInstance.get('/time-slots');
    return response.data.map(mapApiResponseToTimeSlot);
  },

  getTimeSlotById: async (id: number): Promise<TimeSlot> => {
    const response = await privateAxiosInstance.get(`/time-slots/${id}`);
    return mapApiResponseToTimeSlot(response.data);
  },

  getTimeSlotsByDay: async (day: DayOfWeek): Promise<TimeSlot[]> => {
    const response = await privateAxiosInstance.get(`/time-slots?day_of_week=${day}`);
    return response.data.map(mapApiResponseToTimeSlot);
  },

  create: async (data: CreateTimeSlotDto): Promise<TimeSlot> => {
    const apiData = {
      startTime: data.start_time,
      endTime: data.end_time,
      dayOfWeek: data.day_of_week
    };
    const response = await privateAxiosInstance.post('/time-slots', apiData);
    return mapApiResponseToTimeSlot(response.data);
  },

  update: async (id: number, data: UpdateTimeSlotDto): Promise<TimeSlot> => {
    const apiData = {
      startTime: data.start_time,
      endTime: data.end_time,
      dayOfWeek: data.day_of_week
    };
    const response = await privateAxiosInstance.patch(`/time-slots/${id}`, apiData);
    return mapApiResponseToTimeSlot(response.data);
  },

  delete: async (id: number): Promise<void> => {
    await privateAxiosInstance.delete(`/time-slots/${id}`);
  }
}; 