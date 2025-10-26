export interface Subject {
  id: string;
  name: string;
  code: string;
  course: string;
  classType: string;
}

export const subjectsMock: Subject[] = [
  { id: '1', name: 'ENGENHARIA ECONÔMICO-FINANCEIRA', code: 'T. OPTSINF', course: 'SISTEMAS DE INFORMAÇÃO', classType: 'Optativa' },
  { id: '2', name: 'NOÇÕES DE DIREITO E CIDADANIA', code: 'T. 2CSINF', course: 'SISTEMAS DE INFORMAÇÃO', classType: 'Obrigatória' },
  { id: '3', name: 'PROJETO INTEGRADOR DE SISTEMAS', code: 'T. 8CSINF', course: 'SISTEMAS DE INFORMAÇÃO', classType: 'Obrigatória' },
];

export const fetchSubjects = (): Promise<Subject[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(subjectsMock), 300);
  });
};

export const createSubject = (subject: Omit<Subject, 'id'>): Promise<Subject> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSubject = { ...subject, id: String(Date.now()) };
      subjectsMock.push(newSubject);
      resolve(newSubject);
    }, 300);
  });
};

export const getSubjectById = (id: string): Promise<Subject | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(subjectsMock.find(s => s.id === id));
    }, 300);
  });
}; 