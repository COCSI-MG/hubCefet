export interface Student {
  id: string;
  name: string;
  email: string;
  registration: string;
}

export interface Class {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  semester: number;
  year: number;
  teacherId: string;
  teacherName: string;
  schedules: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
  locations: {
    building: string;
    room: string;
  }[];
  students: Student[];
}

export const classesMock: Class[] = [
  {
    id: "1",
    subjectId: "1",
    subjectName: "ENGENHARIA ECONÔMICO-FINANCEIRA",
    subjectCode: "T. OPTSINF",
    semester: 2,
    year: 2023,
    teacherId: "101",
    teacherName: "CARLOS ALBERTO CAMPOS",
    schedules: [
      { dayOfWeek: "SEGUNDA", startTime: "18:00", endTime: "21:40" }
    ],
    locations: [
      { building: "Bloco E", room: "E-305" }
    ],
    students: [
      { id: "1001", name: "Ana Silva", email: "ana.silva@cefet-rj.br", registration: "2020001234" },
      { id: "1002", name: "Bruno Oliveira", email: "bruno.oliveira@cefet-rj.br", registration: "2020001235" },
      { id: "1003", name: "Carla Santos", email: "carla.santos@cefet-rj.br", registration: "2020001236" }
    ]
  },
  {
    id: "2",
    subjectId: "2",
    subjectName: "NOÇÕES DE DIREITO E CIDADANIA",
    subjectCode: "T. 2CSINF",
    semester: 2,
    year: 2023,
    teacherId: "102",
    teacherName: "MARGARETH SILVA ALMEIDA",
    schedules: [
      { dayOfWeek: "TERÇA", startTime: "18:00", endTime: "21:40" }
    ],
    locations: [
      { building: "Bloco F", room: "F-201" }
    ],
    students: [
      { id: "1004", name: "Diogo Ferreira", email: "diogo.ferreira@cefet-rj.br", registration: "2020001237" },
      { id: "1005", name: "Elisa Martins", email: "elisa.martins@cefet-rj.br", registration: "2020001238" },
      { id: "1006", name: "Felipe Costa", email: "felipe.costa@cefet-rj.br", registration: "2020001239" }
    ]
  },
  {
    id: "3",
    subjectId: "3",
    subjectName: "PROJETO INTEGRADOR DE SISTEMAS",
    subjectCode: "T. 8CSINF",
    semester: 2,
    year: 2023,
    teacherId: "103",
    teacherName: "EDUARDO OGASAWARA",
    schedules: [
      { dayOfWeek: "QUARTA", startTime: "18:00", endTime: "21:40" }
    ],
    locations: [
      { building: "Bloco E", room: "Laboratório E-407" }
    ],
    students: [
      { id: "1007", name: "Gabriela Lima", email: "gabriela.lima@cefet-rj.br", registration: "2020001240" },
      { id: "1008", name: "Henrique Alves", email: "henrique.alves@cefet-rj.br", registration: "2020001241" }
    ]
  }
];

export const availableStudentsMock: Student[] = [
  { id: "2001", name: "Igor Pereira", email: "igor.pereira@cefet-rj.br", registration: "2020002234" },
  { id: "2002", name: "Juliana Ribeiro", email: "juliana.ribeiro@cefet-rj.br", registration: "2020002235" },
  { id: "2003", name: "Leonardo Souza", email: "leonardo.souza@cefet-rj.br", registration: "2020002236" },
  { id: "2004", name: "Marina Teixeira", email: "marina.teixeira@cefet-rj.br", registration: "2020002237" },
  { id: "2005", name: "Nathalia Vieira", email: "nathalia.vieira@cefet-rj.br", registration: "2020002238" }
];

export const availableDays = ["DOMINGO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "SÁBADO"];
export const availableTimeSlots = [
  "08:00 - 09:40",
  "09:40 - 11:20",
  "11:20 - 13:00",
  "13:00 - 14:40",
  "14:00 - 15:40",
  "15:40 - 18:00",
  "18:00 - 21:40",
  "21:40 - 22:30"
];

export const availableLocations = [
  { building: "Bloco A", rooms: ["A-101", "A-102", "A-201", "A-202"] },
  { building: "Bloco B", rooms: ["B-101", "B-102", "B-201", "B-202"] },
  { building: "Bloco E", rooms: ["E-305", "E-306", "Laboratório E-405", "Laboratório E-407"] },
  { building: "Bloco F", rooms: ["F-201", "F-202", "F-301", "F-302"] }
];

export const fetchClasses = (): Promise<Class[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(classesMock);
    }, 500);
  });
};

export const fetchClass = (id: string): Promise<Class | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const classItem = classesMock.find(c => c.id === id);
      resolve(classItem || null);
    }, 500);
  });
};

export const createClass = (classData: Omit<Class, "id">): Promise<Class> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newClass: Class = {
        ...classData,
        id: String(Date.now())
      };
      resolve(newClass);
    }, 500);
  });
};

export const updateClass = (id: string, classData: Partial<Class>): Promise<Class> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const classIndex = classesMock.findIndex(c => c.id === id);
      if (classIndex === -1) {
        reject(new Error("Aula não encontrada"));
        return;
      }
      
      const updatedClass: Class = {
        ...classesMock[classIndex],
        ...classData
      };
      
      resolve(updatedClass);
    }, 500);
  });
};

export const deleteClass = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
}; 