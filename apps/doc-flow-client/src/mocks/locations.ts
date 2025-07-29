// Mock de blocos e salas
export interface Building {
  id: string;
  name: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
}

const buildingsMock: Building[] = [
  { id: '1', name: 'Bloco A', rooms: [ { id: '1', name: '101' }, { id: '2', name: '102' } ] },
  { id: '2', name: 'Bloco B', rooms: [ { id: '3', name: '201' }, { id: '4', name: '202' } ] },
];

export const fetchBuildings = (): Promise<Building[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(buildingsMock), 300);
  });
};

export const createBuilding = (name: string): Promise<Building> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newBuilding = { id: String(Date.now()), name, rooms: [] };
      buildingsMock.push(newBuilding);
      resolve(newBuilding);
    }, 300);
  });
};

export const addRoomToBuilding = (buildingId: string, roomName: string): Promise<Room> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const building = buildingsMock.find(b => b.id === buildingId);
      if (!building) return reject(new Error('Bloco não encontrado'));
      const newRoom = { id: String(Date.now()), name: roomName };
      building.rooms.push(newRoom);
      resolve(newRoom);
    }, 300);
  });
}; 