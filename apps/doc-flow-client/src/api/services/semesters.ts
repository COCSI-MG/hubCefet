import { privateAxiosInstance } from '../axios-instance';

export interface Semester {
  id: string;
  year: number;
  number: number;
  start_date: string;
  end_date: string;
  started_at?: string;
  ended_at?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SemesterCreateDTO {
  year: number;
  number: number;
  start_date: string;
  end_date: string;
}

const formatPeriodName = (year: number, number: number): string => {
  return `Período ${number} (${year})`;
};

export const fetchSemesters = async (): Promise<Semester[]> => {
  const response = await privateAxiosInstance.get('/semesters');
  
  return response.data.map((semester: any) => ({
    id: semester.id.toString(),
    year: semester.year,
    number: semester.number,
    start_date: semester.start_date,
    end_date: semester.end_date,
    started_at: semester.start_date,
    ended_at: semester.end_date,
    name: formatPeriodName(semester.year, semester.number),
    createdAt: semester.created_at || semester.createdAt,
    updatedAt: semester.updated_at || semester.updatedAt
  }));
};

export const createSemester = async (semesterData: SemesterCreateDTO): Promise<Semester> => {
  const response = await privateAxiosInstance.post('/semesters', {
    year: semesterData.year,
    number: semesterData.number,
    start_date: semesterData.start_date,
    end_date: semesterData.end_date
  });
  
  return {
    id: response.data.id.toString(),
    year: response.data.year,
    number: response.data.number,
    start_date: response.data.start_date,
    end_date: response.data.end_date,
    started_at: response.data.start_date,
    ended_at: response.data.end_date,
    name: formatPeriodName(response.data.year, response.data.number),
    createdAt: response.data.created_at || response.data.createdAt,
    updatedAt: response.data.updated_at || response.data.updatedAt
  };
};

export const getSemesterById = async (id: string): Promise<Semester> => {
  const response = await privateAxiosInstance.get(`/semesters/${id}`);
  
  return {
    id: response.data.id.toString(),
    year: response.data.year,
    number: response.data.number,
    start_date: response.data.start_date,
    end_date: response.data.end_date,
    started_at: response.data.start_date,
    ended_at: response.data.end_date,
    name: formatPeriodName(response.data.year, response.data.number),
    createdAt: response.data.created_at || response.data.createdAt,
    updatedAt: response.data.updated_at || response.data.updatedAt
  };
};

export const updateSemester = async (id: string, semesterData: Partial<SemesterCreateDTO>): Promise<Semester> => {
  const response = await privateAxiosInstance.put(`/semesters/${id}`, semesterData);
  
  return {
    id: response.data.id.toString(),
    year: response.data.year,
    number: response.data.number,
    start_date: response.data.start_date,
    end_date: response.data.end_date,
    started_at: response.data.start_date,
    ended_at: response.data.end_date,
    name: formatPeriodName(response.data.year, response.data.number),
    createdAt: response.data.created_at || response.data.createdAt,
    updatedAt: response.data.updated_at || response.data.updatedAt
  };
};

export const deleteSemester = async (id: string): Promise<void> => {
  await privateAxiosInstance.delete(`/semesters/${id}`);
}; 