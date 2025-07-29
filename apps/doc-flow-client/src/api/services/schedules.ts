import { privateAxiosInstance } from '../axios-instance';
import { TimeSlot } from './time-slots';
import { Room } from './buildings';

export interface ClassSchedule {
  id?: number;
  class_id: number;
  time_slot_id: number;
  room_id: number;
  building_id?: number;
  created_at?: string;
  updated_at?: string;
  time_slot?: TimeSlot;
  room?: Room;
}

class ClassSchedulesService {
  private baseUrl = '/class-schedules';

  async createSchedule(data: Omit<ClassSchedule, 'id' | 'created_at' | 'updated_at' | 'time_slot' | 'room'>): Promise<ClassSchedule> {
    try {
      const response = await privateAxiosInstance.post(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      throw error;
    }
  }

  async getSchedulesByClassId(classId: number): Promise<ClassSchedule[]> {
    try {
      const response = await privateAxiosInstance.get(`${this.baseUrl}/class/${classId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar agendamentos da aula ${classId}:`, error);
      throw error;
    }
  }

  async deleteSchedule(id: number): Promise<void> {
    try {
      await privateAxiosInstance.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Erro ao excluir agendamento ${id}:`, error);
      throw error;
    }
  }

  async isRoomAvailable(roomId: number, timeSlotId: number): Promise<boolean> {
    try {
      const response = await privateAxiosInstance.get(`${this.baseUrl}/is-room-available/${roomId}/${timeSlotId}`);
      return response.data.available;
    } catch (error) {
      console.error(`Erro ao verificar disponibilidade da sala:`, error);
      throw error;
    }
  }

  async isTimeSlotAvailableForClass(classId: number, timeSlotId: number): Promise<boolean> {
    try {
      const response = await privateAxiosInstance.get(`${this.baseUrl}/is-timeslot-available-for-class/${classId}/${timeSlotId}`);
      return response.data.available;
    } catch (error) {
      console.error(`Erro ao verificar disponibilidade do horário:`, error);
      throw error;
    }
  }

  async getAvailableRooms(timeSlotId: number): Promise<Room[]> {
    try {
      const response = await privateAxiosInstance.get(`${this.baseUrl}/available-rooms/${timeSlotId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar salas disponíveis:`, error);
      throw error;
    }
  }
}

export const classSchedulesService = new ClassSchedulesService(); 
export const schedulesService = classSchedulesService; 