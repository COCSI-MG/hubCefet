import api from 'axios';

export enum Shift {
    MORNING = 'MORNING',
    AFTERNOON = 'AFTERNOON',
    NIGHT = 'NIGHT',
}

export interface TimeSlot {
id: number;
startTime: string;
endTime: string;
shift: Shift;
order: number;
createdAt: string;
updatedAt: string;
}

export interface CreateTimeSlotDto {
startTime: string;
endTime: string;
shift: Shift;
order: number;
}

export interface UpdateTimeSlotDto {
startTime?: string;
endTime?: string;
shift?: Shift;
order?: number;
}

class TimeSlotsService {
async getAllTimeSlots(): Promise<TimeSlot[]> {
    const response = await api.get('/time-slots');
    return response.data;
}

async getTimeSlotById(id: number): Promise<TimeSlot> {
    const response = await api.get(`/time-slots/${id}`);
    return response.data;
}

async create(data: CreateTimeSlotDto): Promise<TimeSlot> {
    const response = await api.post('/time-slots', data);
    return response.data;
}

async update(id: number, data: UpdateTimeSlotDto): Promise<TimeSlot> {
    const response = await api.patch(`/time-slots/${id}`, data);
    return response.data;
}

async delete(id: number): Promise<void> {
    await api.delete(`/time-slots/${id}`);
}
}

export default new TimeSlotsService(); 
 