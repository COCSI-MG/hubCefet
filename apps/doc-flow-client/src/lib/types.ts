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

export const profileSchema = z.object({
  id: z.string(),
  name: z.nativeEnum(Profile),
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
      message:
        "Insira um email institucional (@cefet-rj.br ou @aluno.cefet-rj.br).",
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
    confirmPassword: z.string().min(2, {
      message: "A senha deve ter no mínimo 8 caracteres.",
    }),
  })
).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

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
    description: z.string().max(500).optional(),
    start_at: z
      .string({
        message: "Data de início é obrigatória",
      })
      .date(),
    end_at: z
      .string({
        message: "Data de término é obrigatória",
      })
      .date(),
    eventStartTime: z.string().regex(/\d{1,2}:\d{1,2}/),
    eventEndTime: z.string().regex(/\d{1,2}:\d{1,2}/),

    latitude: z.preprocess(
      (a) => Number(a),
      z
        .number({
          required_error: "Latitude é obrigatória",
        })
        .min(-90, { message: "Latitude deve ser no mínimo -90" })
        .max(90, { message: "Latitude deve ser no máximo 90" })
    ),

    longitude: z.preprocess(
      (a) => Number(a),
      z
        .number({
          required_error: "Longitude é obrigatória",
        })
        .min(-180, { message: "Longitude deve ser no mínimo -180" })
        .max(180, { message: "Longitude deve ser no máximo 180" })
    ),

    radius: z.preprocess(
      (a) => Number(a),
      z
        .number({
          required_error: "O raio é obrigatório",
        })
        .min(1, { message: "O raio deve ser pelo menos 1" })
        .max(10000, { message: "O raio deve ser no máximo 10000" })
    ),

    vacancies: z.preprocess(
      (a) => Number(a),
      z
        .number({
          required_error: "O número de vagas é obrigatório",
        })
        .int({ message: "O número de vagas deve ser um inteiro" })
        .min(1, { message: "O número de vagas deve ser pelo menos 1" })
    ),
    presence_option: z.enum(["qrcode", "geo"]),
  })
  .superRefine((val, ctx) => {
    const [year, month, day] = val.start_at.split("-").map(Number);
    const [hour, minute] = val.eventStartTime.split(":").map(Number);
    const zodEventStartDate = new Date(year, month - 1, day, hour, minute);

    const [endYear, endMonth, endDay] = val.end_at.split("-").map(Number);
    const [endHour, endMinute] = val.eventEndTime.split(":").map(Number);
    const zodEventEndDate = new Date(
      endYear,
      endMonth - 1,
      endDay,
      endHour,
      endMinute
    );

    if (zodEventEndDate <= zodEventStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_date,
        message: "A data de término deve ser posterior à data de início",
        fatal: true,
        path: ["end_at"],
      });
    }
  })
  .transform(
    ({
      name,
      start_at,
      end_at,
      eventStartTime,
      eventEndTime,
      description,
      radius,
      latitude,
      longitude,
      vacancies,
      presence_option,
    }) => {
      const [startYear, startMonth, startDay] = start_at
        .split("-")
        .map(Number);
      const [endYear, endMonth, endDay] = end_at.split("-").map(Number);
      const [startHour, startMinute] = eventStartTime.split(":").map(Number);
      const [endHour, endMinute] = eventEndTime.split(":").map(Number);
      const start = new Date(
        startYear,
        startMonth - 1,
        startDay,
        startHour,
        startMinute
      );
      const end = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);
      return {
        name,
        start_at: start.toISOString(),
        end_at: end.toISOString(),
        eventStartTime,
        eventEndTime,
        latitude,
        longitude,
        vacancies,
        description,
        radius,
        presence_option,
      };
    }
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
