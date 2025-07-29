import { AxiosResponse } from 'axios';
import { privateAxiosInstance } from '../axios-instance';
import { Semester } from './semesters';
import { Subject } from './subjects';
import { User } from './users';
import { Room } from './buildings';
import { TimeSlot } from './time-slots';

export interface Class {
  id?: number;
  name: string;
  subjectId: number;
  semesterId: number;
  teacherId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassSchedule {
  id?: number;
  class_id: number;
  time_slot_id: number;
  room_id: number;
  building_id: number;
  created_at?: string;
  updated_at?: string;
  time_slot?: TimeSlot;
  room?: Room;
}

export interface ClassWithDetails extends Class {
  subject?: Subject;
  semester?: Semester;
  teacher?: User;
  professor?: { name: string };
  schedules?: ClassSchedule[];
  students?: User[];
  isCancelled?: boolean;
  cancellationDates?: string[];
}

export interface ClassCancellation {
  id: number;
  classId: number;
  date: string;
  reason: string;
  studentsNotified: boolean;
  canceledBy: string;
  createdAt: string;
  updatedAt: string;
  class?: ClassWithDetails;
  canceledByUser?: User;
}

export interface CancelClassRequest {
  dates: string[];
  reason: string;
}

export interface CreateClassWithSchedulesRequest {
  class: Omit<Class, 'teacherId'> & { teacherId?: string };
  schedules: {
    time_slot_id: number;
    room_id: number;
    building_id?: number;
    class_id?: number;
  }[];
}

class ClassesService {
  private baseUrl = '/classes';

  async getClasses(semesterId?: number): Promise<ClassWithDetails[]> {
    const url = semesterId ? `${this.baseUrl}?semester_id=${semesterId}` : this.baseUrl;
    const response: AxiosResponse<ClassWithDetails[]> = await privateAxiosInstance.get(url);
    return response.data;
  }

  async getPublicClasses(semesterId?: number): Promise<ClassWithDetails[]> {
    const url = semesterId ? `${this.baseUrl}/public?semester_id=${semesterId}` : `${this.baseUrl}/public`;
    const response: AxiosResponse<ClassWithDetails[]> = await privateAxiosInstance.get(url);
    return response.data;
  }

  async getPublicClassById(id: number): Promise<ClassWithDetails> {
    const response: AxiosResponse<ClassWithDetails> = await privateAxiosInstance.get(`${this.baseUrl}/public/${id}`);
    return response.data;
  }

  async getClassById(id: number): Promise<ClassWithDetails> {
    const response: AxiosResponse<ClassWithDetails> = await privateAxiosInstance.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createClass(classData: Class): Promise<ClassWithDetails> {
    const response: AxiosResponse<ClassWithDetails> = await privateAxiosInstance.post(this.baseUrl, classData);
    return response.data;
  }

  async createClassWithSchedules(data: CreateClassWithSchedulesRequest): Promise<ClassWithDetails> {
    // Não modificar o teacherId aqui - deixar o backend decidir baseado no token
    const response: AxiosResponse<ClassWithDetails> = await privateAxiosInstance.post(`${this.baseUrl}/with-schedules`, data);
    return response.data;
  }

  async updateClass(id: number, classData: Partial<Class>): Promise<ClassWithDetails> {
    const response: AxiosResponse<ClassWithDetails> = await privateAxiosInstance.put(`${this.baseUrl}/${id}`, classData);
    return response.data;
  }

  async deleteClass(id: number): Promise<void> {
    await privateAxiosInstance.delete(`${this.baseUrl}/${id}`);
  }

  async addStudents(classId: number, studentIds: string[]): Promise<ClassWithDetails> {
    const response: AxiosResponse<ClassWithDetails> = await privateAxiosInstance.post(
      `${this.baseUrl}/${classId}/students`,
      { student_ids: studentIds }
    );
    return response.data;
  }

  async removeStudent(classId: number, studentId: string): Promise<void> {
    try {
      await privateAxiosInstance.delete(`${this.baseUrl}/${classId}/students/${studentId}`);
    } catch (error: any) {
      console.error('Erro ao remover aluno da aula:', error);
      if (error.response?.status === 403) {
        console.warn('Alunos não têm permissão para cancelar matrícula');
      }
      throw error;
    }
  }

  async getClassStudents(classId: number, searchTerm?: string): Promise<ClassWithDetails> {
    const url = `${this.baseUrl}/${classId}/search-students${searchTerm ? `?term=${encodeURIComponent(searchTerm.trim())}` : ''}`;
    
    const response: AxiosResponse<ClassWithDetails> = await privateAxiosInstance.get(url);
    return response.data;
  }
  
  async getAllCancellations(filters?: { startDate?: string, endDate?: string }): Promise<ClassCancellation[]> {
    let url = '/all-cancellations';
    
    if (filters) {
      const queryParams = [];
      if (filters.startDate) queryParams.push(`start_date=${filters.startDate}`);
      if (filters.endDate) queryParams.push(`end_date=${filters.endDate}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
    }
    
    const response: AxiosResponse<ClassCancellation[]> = await privateAxiosInstance.get(url);
    return response.data;
  }
  
  async getClassCancellations(classId: number): Promise<ClassCancellation[]> {
    const response: AxiosResponse<ClassCancellation[]> = await privateAxiosInstance.get(
      `${this.baseUrl}/${classId}/cancellations`
    );
    return response.data;
  }
  
  async cancelClasses(classId: number, dates: Date[], reason: string): Promise<void> {
    if (!reason.trim()) {
      throw new Error('O motivo do cancelamento é obrigatório');
    }

    if (dates.length === 0) {
      throw new Error('Selecione pelo menos uma data para cancelamento');
    }
    
    const formattedDates = dates.map(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    });
    
    
    const payload: CancelClassRequest = {
      dates: formattedDates,
      reason: reason.trim()
    };
    
    try {
      const response = await privateAxiosInstance.post(`${this.baseUrl}/${classId}/cancel`, payload);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao cancelar aulas:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new ClassesService();