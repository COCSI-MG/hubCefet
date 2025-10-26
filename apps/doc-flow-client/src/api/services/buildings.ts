import { privateAxiosInstance } from '../axios-instance';

export interface Room {
  id: string;
  name: string;
  buildingId?: string;
  buildingName?: string;
  building?: Building;
}

export interface Building {
  id: string;
  name: string;
  rooms: Room[];
}

export const fetchBuildings = async (): Promise<Building[]> => {
  const response = await privateAxiosInstance.get('/buildings');
  
  return response.data.map((building: any) => ({
    id: building.id.toString(),
    name: building.name,
    rooms: building.rooms?.map((room: any) => ({
      id: room.id.toString(),
      name: room.name,
    })) || []
  }));
};

export const createBuilding = async (name: string): Promise<Building> => {
  const response = await privateAxiosInstance.post('/buildings', { name });
  
  return {
    id: response.data.id.toString(),
    name: response.data.name,
    rooms: []
  };
};

export const deleteBuilding = async (id: string): Promise<void> => {
  await privateAxiosInstance.delete(`/buildings/${id}`);
};

export const fetchRooms = async (buildingId: string): Promise<Room[]> => {
  const response = await privateAxiosInstance.get(`/rooms?building_id=${buildingId}`);
  
  return response.data.map((room: any) => ({
    id: room.id.toString(),
    name: room.name
  }));
};

export const createRoom = async (buildingId: string, name: string): Promise<Room> => {
  const response = await privateAxiosInstance.post('/rooms', { 
    name, 
    building_id: parseInt(buildingId)
  });
  
  return {
    id: response.data.id.toString(),
    name: response.data.name
  };
};

export const deleteRoom = async (id: string): Promise<void> => {
  await privateAxiosInstance.delete(`/rooms/${id}`);
}; 