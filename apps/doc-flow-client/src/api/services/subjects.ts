import { privateAxiosInstance } from '../axios-instance';

export interface Subject {
  id: string;
  name: string;
  code: string;
  course?: string;
  classType?: string;
}

export interface SubjectCreateDTO {
  name: string;
  code: string;
  course?: string;
  classType?: string;
}

export const fetchSubjects = async (): Promise<Subject[]> => {
  const response = await privateAxiosInstance.get('/subjects');
  
  return response.data.map((subject: any) => ({
    id: subject.id.toString(),
    name: subject.name,
    code: subject.code,
    course: subject.course || '',
    classType: subject.classType || ''
  }));
};

export const createSubject = async (subjectData: SubjectCreateDTO): Promise<Subject> => {
  const response = await privateAxiosInstance.post('/subjects', subjectData);
  
  return {
    id: response.data.id.toString(),
    name: response.data.name,
    code: response.data.code,
    course: response.data.course || '',
    classType: response.data.classType || ''
  };
};

export const getSubjectById = async (id: string): Promise<Subject> => {
  const response = await privateAxiosInstance.get(`/subjects/${id}`);
  
  return {
    id: response.data.id.toString(),
    name: response.data.name,
    code: response.data.code,
    course: response.data.course || '',
    classType: response.data.classType || ''
  };
};

export const updateSubject = async (id: string, subjectData: Partial<SubjectCreateDTO>): Promise<Subject> => {
  const response = await privateAxiosInstance.put(`/subjects/${id}`, subjectData);
  
  return {
    id: response.data.id.toString(),
    name: response.data.name,
    code: response.data.code,
    course: response.data.course || '',
    classType: response.data.classType || ''
  };
};

export const deleteSubject = async (id: string): Promise<void> => {
  await privateAxiosInstance.delete(`/subjects/${id}`);
}; 