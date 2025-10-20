import PresenceService from "../services/presence.service";
import {
  PresenceCreate,
  Presence,
  GetAllPresences,
  PresenceUpdate,
} from "@/lib/types";

export const getAllPresences = async (
  data: GetAllPresences
): Promise<Presence[] | undefined> => {
  try {
    const presenceService = new PresenceService();
    const response = await presenceService.getAll(data);
    if (response.success) {
      return response.data?.presences;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(error);
    }
    return undefined;
  }
};

export const createPresence = async (
  data: PresenceCreate,
  coordinates?: { latitude: number; longitude: number }
): Promise<Presence | boolean> => {
  try {
    const presenceService = new PresenceService();
    const response = await presenceService.create(data, coordinates);
    return response.data as Presence;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(error);
    }
    return false;
  }
};

export const getUserPresences = async (data: {
  id: string;
  offset: number;
  limit: number;
}): Promise<Presence[] | undefined> => {
  try {
    const presenceService = new PresenceService();
    const response = await presenceService.getAllByUser(data);
    if (response.success) {
      return response.data?.presences;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(error);
    }
    return undefined;
  }
};

export const patchPresence = async (
  id: string,
  data: PresenceUpdate,
  coordinates?: { latitude: number; longitude: number }
): Promise<Presence | undefined> => {
  try {
    const presenceService = new PresenceService();
    const response = await presenceService.patch(id, data, coordinates);
    return response.data.presence;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error(err);
    }
    return undefined;
  }
};
