import { z } from "zod";
import { components } from "../schema";

export const createEventSchema = z
  .object({
    name: z
      .string({
        message: "Nome é obrigatório",
      })
      .max(255),
    description: z.string().max(500).optional(),
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
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(1).max(10000),
    vacancies: z.number().min(1),
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
      minute
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
      endMinute
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
      radius,
      vacancies,
      description,
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
        startMinute
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
        radius,
        vacancies,
        description,
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
