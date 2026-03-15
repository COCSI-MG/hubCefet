import AbstractService from "./abstract.service";
import type {
  GetAllPresencesResponseDto,
  PresenceCreate,
  /*GetPresenceResponseDto*/ Presence,
  GetAllPresencesByUserResponseDto,
  PresenceUpdate,
} from "@/lib/types";

export default class PresenceService extends AbstractService {
  constructor() {
    super("/presences", true);
  }

  getToken() {
    return localStorage.getItem("accessToken");
  }

  async getAll(data: {
    offset: number;
    limit: number;
  }): Promise<GetAllPresencesResponseDto> {
    return await this.api.get(
      this.basePath + `?offset=${data.offset}&limit=${data.limit}`
    );
  }

  async getAllByUser(data: {
    id: string;
    offset: number;
    limit: number;
  }): Promise<GetAllPresencesByUserResponseDto> {
    return await this.api.get(
      this.basePath +
      `/user/${data.id}` +
      `?offset=${data.offset}&limit=${data.limit}`
    );
  }

  async create(
    data: PresenceCreate,
  ): Promise<Presence> {
    return await this.api.post(this.basePath, data);
  }

  async update(
    id: string,
    data: PresenceUpdate,
  ): Promise<Presence> {
    return await this.api.patch(this.basePath + `/${id}`, data);
  }

  async findByUserAndEventId(userId: string, eventId: string): Promise<Presence> {
    return await this.api.get(this.basePath + `/${userId}/${eventId}`)
  }
}

export const presenceService = new PresenceService()
