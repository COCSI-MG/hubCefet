import { z } from "zod";
import { components } from "./schema";
import { Profile } from "./enum/profile.enum";

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  error: string | null;
  data: T;
}

export const userSchema = z.object({
  id: z.string(),
  email: z
    .string()
    .email()
    .regex(/(@cefet-rj\.br|@aluno\.cefet-rj\.br)$/),
  password: z.string().min(8),
  enrollment: z.string().regex(/\d{4}\d{3}\w{3}/),
  profile_id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const eventsSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  start_at: z.string(),
  end_at: z.string(),
});

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  profiles_roles: z.object({
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    profile_id: z.string(),
    role_id: z.string(),
  }),
});

export const profileSchema = z.object({
  id: z.string(),
  name: z.nativeEnum(Profile),
  roles: z.array(roleSchema),
});

export const userPayloadSchema = z.object({
  sub: z.string(),
  email: z.string(),
  fullName: z.string(),
  profile: profileSchema,
});

export type UserPayload = z.infer<typeof userPayloadSchema>;

export interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  user: UserPayload | null;
  logout: () => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  isLoading: boolean;
  checkAuthentication: () => Promise<void>;
}

export const authFormSchema = z.object({
  email: z
    .string()
    .email({
      message: "Insira um email válido.",
    })
    .regex(/(@cefet-rj\.br|@aluno\.cefet-rj\.br)$/, {
      message: "Insira um email institucional (@cefet-rj.br ou @aluno.cefet-rj.br).",
    }),
  password: z.string().min(2, {
    message: "A senha deve ter no mínimo 8 caracteres.",
  }),
});

export const singupFormSchema = authFormSchema.merge(
  z.object({
    enrollment: z.string().regex(/\d{4}\d{3}[A-Z]{4}$/, {
      message: "Matrícula inválida.",
    }),
    fullName: z.string().max(255, {
      message: "Nome muito longo.",
    }),
    profileId: z.string().min(1, { message: "O perfil é obrigatório." }),
  }),
);

export const presenceSchema = z.object({
  event_id: z.string().min(1, { message: "O ID do evento é obrigatório." }),
  status: z.string().min(1, { message: "O status é obrigatório." }),
  check_out_date: z
    .string()
    .min(1, { message: "A data de saída é obrigatória." }),
  check_in_date: z
    .string()
    .min(1, { message: "A data de saída é obrigatória." }),
});

export type AuthFormSchema = z.infer<typeof authFormSchema>;

export type SignupFormSchema = z.infer<typeof singupFormSchema>;

export type PresenceFormSchema = z.infer<typeof presenceSchema>;

/**
 * EVENTS --------
 */
export const createEventSchema = z
  .object({
    name: z
      .string({
        message: "Nome é obrigatório",
      })
      .max(255),
    eventStartDate: z
      .string({
        message: "Data de início é obrigatória",
      })
      .date(),
    eventEndDate: z
      .string({
        message: "Data de término é obrigatória",
      })
      .date(),
    status: z.string(),
    eventStartTime: z.string().regex(/\d{1,2}:\d{1,2}/),
    eventEndTime: z.string().regex(/\d{1,2}:\d{1,2}/),

    latitude: z.preprocess(
      (a) => Number(a),
      z
        .number({
          required_error: "Latitude é obrigatória",
        })
        .min(-90, { message: "Latitude deve ser no mínimo -90" })
        .max(90, { message: "Latitude deve ser no máximo 90" }),
    ),

    longitude: z.preprocess(
      (a) => Number(a),
      z
        .number({
          required_error: "Longitude é obrigatória",
        })
        .min(-180, { message: "Longitude deve ser no mínimo -180" })
        .max(180, { message: "Longitude deve ser no máximo 180" }),
    ),
    vacancies: z.preprocess(
      (a) => Number(a),
      z
        .number({
          required_error: "O número de vagas é obrigatório",
        })
        .int({ message: "O número de vagas deve ser um inteiro" })
        .min(1, { message: "O número de vagas deve ser pelo menos 1" }),
    ),
  })
  .superRefine((val, ctx) => {
    const now = new Date().toISOString();

    const [year, month, day] = val.eventStartDate.split("-").map(Number);
    const [hour, minute] = val.eventStartTime.split(":").map(Number);
    const zodEventStartDate = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
    ).toISOString();
    if (val.status === "upcoming") {
      if (zodEventStartDate < now) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message:
            "Evento próximo não pode possuir a data de inicio menor que agora",
          fatal: true,
          path: ["eventStartDate"],
        });

        return z.NEVER;
      }
      return;
    }

    const [endYear, endMonth, endDay] = val.eventEndDate.split("-").map(Number);
    const [endHour, endMinute] = val.eventEndTime.split(":").map(Number);
    const zodEventEndDate = new Date(
      endYear,
      endMonth - 1,
      endDay,
      endHour,
      endMinute,
    ).toISOString();
    if (val.status === "ended") {
      if (zodEventEndDate < zodEventStartDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message:
            "Evento encerrado não pode possuir a data de inicio maior que a data de termino",
          fatal: true,
          path: ["eventEndDate"],
        });

        return z.NEVER;
      }
      return;
    }

    if (val.status === "started") {
      if (zodEventStartDate > now) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message:
            "Evento em andamento não pode possui uma data de inicio maior que agora",
          fatal: true,
          path: ["eventStartDate"],
        });
      }
    }
  })
  .transform(
    ({
      name,
      status,
      eventStartDate,
      eventEndDate,
      eventStartTime,
      eventEndTime,
      latitude,
      longitude,
      vacancies,
    }) => {
      const [startYear, startMonth, startDay] = eventStartDate
        .split("-")
        .map(Number);
      const [endYear, endMonth, endDay] = eventEndDate.split("-").map(Number);
      const [startHour, startMinute] = eventStartTime.split(":").map(Number);
      const [endHour, endMinute] = eventEndTime.split(":").map(Number);
      const start = new Date(
        startYear,
        startMonth - 1,
        startDay,
        startHour,
        startMinute,
      );
      const end = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);
      return {
        name,
        status,
        eventStartDate: start.toISOString(),
        eventEndDate: end.toISOString(),
        eventStartTime,
        eventEndTime,
        latitude,
        longitude,
        vacancies,
      };
    },
  );

export type EventCreateSchema = z.infer<typeof createEventSchema>;

export type EventUpdateSchema = Partial<EventCreateSchema>;

export type EventCreate = components["schemas"]["CreateEventDto"];

export type Event = components["schemas"]["Event"];

export type Presence = components["schemas"]["Presence"];

export type PresenceCreate = components["schemas"]["CreatePresenceDto"];
export type PresenceUpdate = components["schemas"]["UpdatePresenceDto"];

export type GetAllPresencesResponseDto =
  components["schemas"]["GetAllPresencesResponseDto"];

export type GetAllPresencesByUserResponseDto =
  components["schemas"]["GetAllPresencesByUserResponseDto"];

export type GetAllEvents = {
  offset: number;
  limit: number;
};

export type GetAllPresences = {
  offset: number;
  limit: number;
};

export type EventUpdate = components["schemas"]["UpdateEventDto"];

export type GetAllEventsResponseDto =
  components["schemas"]["GetAllEventsResponseDto"];

export type GetEventResponseDto = components["schemas"]["GetEventResponseDto"];

export type UpdateEvents = components["schemas"]["UpdateEventDto"];

/**
 * END EVENTS --------
 */

export interface Pagination {
  limit: number;
  offset: number;
}
