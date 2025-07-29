import { privateAxiosInstance } from '../axios-instance';
import { Subject } from './subjects';

export interface SubjectSchedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface SubjectLocation {
  building: string;
  room: string;
}

export interface SubjectTeacher {
  name: string;
  role: string;
}

export interface SubjectDetails extends Subject {
  year?: number;
  semester?: number;
  teachers?: SubjectTeacher[];
  schedules?: SubjectSchedule[];
  locations?: SubjectLocation[];
  startDate?: string;
  endDate?: string;
}

export const fetchSubjectDetails = async (id: string): Promise<SubjectDetails> => {
  const response = await privateAxiosInstance.get(`/subjects/${id}`);
  
  return {
    id: response.data.id.toString(),
    name: response.data.name,
    code: response.data.code,
    course: response.data.course || '',
    classType: response.data.classType || '',
    year: response.data.year,
    semester: response.data.semester,
    teachers: response.data.teachers || [],
    schedules: response.data.schedules || [],
    locations: response.data.locations || [],
    startDate: response.data.startDate,
    endDate: response.data.endDate
  };
}; 