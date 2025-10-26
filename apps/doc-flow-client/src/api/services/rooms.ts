import { privateAxiosInstance } from '../axios-instance';

export interface Room {
  id: string;
  name: string;
  building_id: number;
}

export const fetchRooms = async (buildingId?: number): Promise<Room[]> => {
  const url = buildingId ? `/rooms?building_id=${buildingId}` : '/rooms';
  const response = await privateAxiosInstance.get(url);
  
  return response.data.map((room: any) => ({
    id: room.id.toString(),
    name: room.name,
    building_id: room.building_id
  }));
};

export const getRoomById = async (id: string): Promise<Room> => {
  const response = await privateAxiosInstance.get(`/rooms/${id}`);
  
  return {
    id: response.data.id.toString(),
    name: response.data.name,
    building_id: response.data.building_id
  };
};

export const createRoom = async (name: string, building_id: number): Promise<Room> => {
  const response = await privateAxiosInstance.post('/rooms', { name, building_id });
  
  return {
    id: response.data.id.toString(),
    name: response.data.name,
    building_id: response.data.building_id
  };
};

export const updateRoom = async (id: string, data: Partial<Room>): Promise<Room> => {
  const response = await privateAxiosInstance.put(`/rooms/${id}`, data);
  
  return {
    id: response.data.id.toString(),
    name: response.data.name,
    building_id: response.data.building_id
  };
};

export const deleteRoom = async (id: string): Promise<void> => {
  await privateAxiosInstance.delete(`/rooms/${id}`);
}; 