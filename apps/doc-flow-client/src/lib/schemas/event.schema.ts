import { z } from "zod";
import { components } from "../schema";

export const createEventSchema = z
  .object({
    name: z
      .string({
        message: "Nome é obrigatório",
      })
      .min(1, "Nome é obrigatório")
      .max(255, "Nome deve ter no máximo 255 caracteres"),
    description: z.string().max(500, "Descrição deve ter no máximo 500 caracteres").optional(),
    start_at: z
      .string({
        message: "Data de início é obrigatória",
      })
      .date("Data de início inválida"),
    end_at: z
      .string({
        message: "Data de término é obrigatória",
      })
      .date("Data de término inválida"),
    status: z.string({ required_error: "Status é obrigatório" }).min(1, "Status é obrigatório"),
    eventStartTime: z.string({ required_error: "Horário de início é obrigatório" }).regex(/\d{1,2}:\d{1,2}/, "Horário de início inválido (use HH:MM)"),
    eventEndTime: z.string({ required_error: "Horário de término é obrigatório" }).regex(/\d{1,2}:\d{1,2}/, "Horário de término inválido (use HH:MM)"),
    latitude: z.number({ required_error: "Latitude é obrigatória" }).min(-90, "Latitude deve ser entre -90 e 90").max(90, "Latitude deve ser entre -90 e 90"),
    longitude: z.number({ required_error: "Longitude é obrigatória" }).min(-180, "Longitude deve ser entre -180 e 180").max(180, "Longitude deve ser entre -180 e 180"),
    radius: z.number({ required_error: "Raio é obrigatório" }).min(1, "Raio mínimo é 1 metro").max(10000, "Raio máximo é 10.000 metros"),
    vacancies: z.number({ required_error: "Vagas são obrigatórias" }).min(1, "Deve haver pelo menos 1 vaga"),
    presence_option: z.enum(["qrcode", "geo"], {
      required_error: "Opção de presença é obrigatória",
      invalid_type_error: "Opção de presença inválida",
    }),
  })
  .superRefine((val, ctx) => {
    const now = new Date().toISOString();

    const [year, month, day] = val.start_at.split("-").map(Number);
    const [hour, minute] = val.eventStartTime.split(":").map(Number);
    const zodEventStartDate = new Date(
      year,
      month - 1,
      day,
      hour,
      minute
    ).toISOString();
    if (val.status === "upcoming") {
      if (zodEventStartDate < now) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message:
            "Evento próximo não pode possuir a data de inicio menor que agora",
          fatal: true,
          path: ["start_at"],
        });

        return z.NEVER;
      }
      return;
    }

    const [endYear, endMonth, endDay] = val.end_at.split("-").map(Number);
    const [endHour, endMinute] = val.eventEndTime.split(":").map(Number);
    const zodEventEndDate = new Date(
      endYear,
      endMonth - 1,
      endDay,
      endHour,
      endMinute
    ).toISOString();
    if (val.status === "ended") {
      if (zodEventEndDate < zodEventStartDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message:
            "Evento encerrado não pode possuir a data de inicio maior que a data de termino",
          fatal: true,
          path: ["end_at"],
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
          path: ["start_at"],
        });
      }
    }
  })
  .transform(
    ({
      name,
      status,
      start_at,
      end_at,
      eventStartTime,
      eventEndTime,
      latitude,
      longitude,
      radius,
      vacancies,
      description,
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
        status,
        start_at: start.toISOString(),
        end_at: end.toISOString(),
        eventStartTime,
        eventEndTime,
        latitude,
        longitude,
        radius,
        vacancies,
        description,
        presence_option,
      };
    }
  );

export type EventCreateSchema = z.infer<typeof createEventSchema>;

export type EventUpdateSchema = Partial<EventCreateSchema>;

export type EventCreate = components["schemas"]["CreateEventDto"];

export type Event = components["schemas"]["Event"];

export type GetAllEvents = {
  offset: number;
  limit: number;
};

export type EventUpdate = components["schemas"]["UpdateEventDto"];

export type GetAllEventsResponseDto =
  components["schemas"]["GetAllEventsResponseDto"];

export type GetEventResponseDto = components["schemas"]["GetEventResponseDto"];

export type UpdateEvents = components["schemas"]["UpdateEventDto"];
