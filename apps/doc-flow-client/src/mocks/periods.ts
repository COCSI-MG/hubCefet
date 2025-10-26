export interface Period {
  id: string;
  year: number;
  semester: number;
  startDate: string;
  endDate: string;
}

export const periodsMock: Period[] = [
  { id: '1', year: 2024, semester: 1, startDate: '2024-03-01', endDate: '2024-07-15' },
  { id: '2', year: 2024, semester: 2, startDate: '2024-08-01', endDate: '2024-12-15' },
];

export const fetchPeriods = (): Promise<Period[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(periodsMock), 300);
  });
};

export const createPeriod = (period: Omit<Period, 'id'>): Promise<Period> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPeriod = { ...period, id: String(Date.now()) };
      periodsMock.push(newPeriod);
      resolve(newPeriod);
    }, 300);
  });
};

export const getPeriodById = (id: string): Promise<Period | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(periodsMock.find(p => p.id === id));
    }, 300);
  });
}; 