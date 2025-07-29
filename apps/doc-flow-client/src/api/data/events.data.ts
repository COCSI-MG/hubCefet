import EventService from "../services/event.service";
import { EventCreate, Event, GetAllEvents } from "@/lib/schemas/event.schema";

export const getAllEvents = async (
  data: GetAllEvents,
): Promise<Event[] | undefined> => {
  try {
    const eventService = new EventService();
    const response = await eventService.getAll(data);
    if (response.success) {
      return response.data?.events;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(error);
    }
    return undefined;
  }
};

export const createEvent = async (
  data: EventCreate,
): Promise<Event | boolean> => {
  try {
    const eventService = new EventService();
    const response = await eventService.create(data);
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(error);
    }
    return false;
  }
};

export const getUserEvents = async (data: {
  id: string;
  offset: number;
  limit: number;
}): Promise<Event[] | undefined> => {
  try {
    const eventService = new EventService();
    const response = await eventService.getUserEvents(data);
    if (response.success) {
      return response.data?.events;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(error);
    }
    return undefined;
  }
};

export const getEvent = async (id: string): Promise<Event | undefined> => {
  try {
    const eventService = new EventService();
    const response = await eventService.getOne(id);
    if (response.success) {
      return response.data.event;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(error);
    }
    return undefined;
  }
};

export const patch = async (
  id: string,
  data: EventCreate,
): Promise<Event | undefined> => {
  try {
    const eventService = new EventService();
    const response = await eventService.patch(id, data);
    return response.data.event;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error(err);
    }
    return undefined;
  }
};

export const search = async (query: string) => {
  try {
    const eventService = new EventService();
    const response = await eventService.search(query);
    return response.data.events;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error(err);
    }
    return [];
  }
};
