import { ApiResponse } from "@/lib/types";
import AbstractService from "./abstract.service";
import type {
  GetAllEventsResponseDto,
  EventCreate,
  GetEventResponseDto,
  Event,
} from "@/lib/schemas/event.schema";

export default class AuthService extends AbstractService {
  constructor() {
    super("/events", true);
  }

  async getAll(data: {
    offset: number;
    limit: number;
  }): Promise<GetAllEventsResponseDto> {
    return await this.api.get(
      this.basePath + `?offset=${data.offset}&limit=${data.limit}`,
    );
  }

  async create(data: EventCreate): Promise<ApiResponse<Event>> {
    return await this.api.post(this.basePath, data);
  }

  async getUserEvents(data: {
    id: string;
    offset: number;
    limit: number;
  }): Promise<GetAllEventsResponseDto> {
    return await this.api.get(
      this.basePath +
        `/user-events/${data.id}` +
        `?offset=${data.offset}&limit=${data.limit}`,
    );
  }

  async getOne(id: string): Promise<GetEventResponseDto> {
    return await this.api.get(this.basePath + `/${id}`);
  }

  async patch(
    id: string,
    data: EventCreate,
  ): Promise<
    ApiResponse<{
      event: Event;
    }>
  > {
    return await this.api.patch(this.basePath + `/${id}`, data);
  }

  async search(q: string): Promise<GetAllEventsResponseDto> {
    return await this.api.get(this.basePath + `/search?q=${q}`);
  }
}
