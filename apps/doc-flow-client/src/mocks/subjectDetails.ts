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

export interface SubjectDetails {
  id: string;
  code: string;
  name: string;
  course: string;
  year: number;
  semester: number;
  classType: string;
  teachers: SubjectTeacher[];
  schedules: SubjectSchedule[];
  locations: SubjectLocation[];
  startDate: string;
  endDate: string;
}

export const subjectDetailsMock: Record<string, SubjectDetails> = {
  "1": {
    id: "1",
    code: "T. OPTSINF",
    name: "ENGENHARIA ECONÔMICO-FINANCEIRA",
    course: "SISTEMAS DE INFORMAÇÃO",
    year: 2023,
    semester: 2,
    classType: "Optativa",
    teachers: [
      { name: "CARLOS ALBERTO CAMPOS", role: "Professor Titular" }
    ],
    schedules: [
      { dayOfWeek: "SEGUNDA", startTime: "18:00", endTime: "21:40" }
    ],
    locations: [
      { building: "Bloco E", room: "E-305" }
    ],
    startDate: "06/03/2023",
    endDate: "14/07/2023"
  },
  "2": {
    id: "2",
    code: "T. 2CSINF",
    name: "NOÇÕES DE DIREITO E CIDADANIA",
    course: "SISTEMAS DE INFORMAÇÃO",
    year: 2023,
    semester: 2,
    classType: "Obrigatória",
    teachers: [
      { name: "MARGARETH SILVA ALMEIDA", role: "Professora Titular" }
    ],
    schedules: [
      { dayOfWeek: "TERÇA", startTime: "18:00", endTime: "21:40" }
    ],
    locations: [
      { building: "Bloco F", room: "F-201" }
    ],
    startDate: "06/03/2023",
    endDate: "14/07/2023"
  },
  "3": {
    id: "3",
    code: "T. 8CSINF",
    name: "PROJETO INTEGRADOR DE SISTEMAS",
    course: "SISTEMAS DE INFORMAÇÃO",
    year: 2023,
    semester: 2,
    classType: "Obrigatória",
    teachers: [
      { name: "EDUARDO OGASAWARA", role: "Professor Orientador" },
      { name: "GLAUCO AMORIM", role: "Professor Co-orientador" }
    ],
    schedules: [
      { dayOfWeek: "QUARTA", startTime: "18:00", endTime: "21:40" }
    ],
    locations: [
      { building: "Bloco E", room: "Laboratório E-407" }
    ],
    startDate: "06/03/2023",
    endDate: "14/07/2023"
  },
  "4": {
    id: "4",
    code: "T. OPTSINF",
    name: "LIBRAS - LÍNGUA BRASILEIRA DE SINAIS",
    course: "SISTEMAS DE INFORMAÇÃO",
    year: 2023,
    semester: 2,
    classType: "Optativa",
    teachers: [
      { name: "SIMONE GONÇALVES", role: "Professora Especialista" }
    ],
    schedules: [
      { dayOfWeek: "QUINTA", startTime: "14:00", endTime: "15:40" }
    ],
    locations: [
      { building: "Bloco D", room: "D-102" }
    ],
    startDate: "06/03/2023",
    endDate: "14/07/2023"
  },
  "5": {
    id: "5",
    code: "T. 4CSINF",
    name: "ESTRUTURAS DE DADOS II",
    course: "SISTEMAS DE INFORMAÇÃO",
    year: 2023,
    semester: 2,
    classType: "Obrigatória",
    teachers: [
      { name: "JORGE SOARES", role: "Professor Titular" }
    ],
    schedules: [
      { dayOfWeek: "QUINTA", startTime: "18:00", endTime: "21:40" },
      { dayOfWeek: "SEXTA", startTime: "15:40", endTime: "18:00" }
    ],
    locations: [
      { building: "Bloco E", room: "Laboratório E-405" },
      { building: "Bloco E", room: "Laboratório E-405" }
    ],
    startDate: "06/03/2023",
    endDate: "14/07/2023"
  },
  "6": {
    id: "6",
    code: "T. 8CSINF",
    name: "PROJETO FINAL I",
    course: "SISTEMAS DE INFORMAÇÃO",
    year: 2023,
    semester: 2,
    classType: "Obrigatória",
    teachers: [
      { name: "RAFAEL CASTANEDA", role: "Professor Orientador" }
    ],
    schedules: [
      { dayOfWeek: "SEXTA", startTime: "18:00", endTime: "21:40" }
    ],
    locations: [
      { building: "Bloco E", room: "Auditório E-102" }
    ],
    startDate: "06/03/2023",
    endDate: "14/07/2023"
  }
};

export const fetchSubjectDetails = (id: string): Promise<SubjectDetails> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const subject = subjectDetailsMock[id];
      if (subject) {
        resolve(subject);
      } else {
        reject(new Error("Disciplina não encontrada"));
      }
    }, 500);
  });
}; 