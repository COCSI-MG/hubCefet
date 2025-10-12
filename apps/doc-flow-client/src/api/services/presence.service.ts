import { ApiResponse } from "@/lib/types";
import AbstractService from "./abstract.service";
import type {
  GetAllPresencesResponseDto,
  PresenceCreate,
  /*GetPresenceResponseDto*/ Presence,
  GetAllPresencesByUserResponseDto,
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
    coordinates?: { latitude: number; longitude: number }
  ): Promise<ApiResponse<Presence>> {
    if (coordinates) {
      // Add geolocation headers if coordinates are provided
      const config = {
        headers: {
          "x-user-latitude": coordinates.latitude.toString(),
          "x-user-longitude": coordinates.longitude.toString(),
        },
      };
      return await this.api.post(this.basePath, data, config);
    }

    // Make request without geolocation headers if no coordinates provided
    return await this.api.post(this.basePath, data);
  }

  async patch(
    id: string,
    data: PresenceCreate,
    coordinates?: { latitude: number; longitude: number }
  ): Promise<
    ApiResponse<{
      presence: Presence;
    }>
  > {
    if (coordinates) {
      // Add geolocation headers if coordinates are provided
      const config = {
        headers: {
          "x-user-latitude": coordinates.latitude.toString(),
          "x-user-longitude": coordinates.longitude.toString(),
        },
      };
      return await this.api.patch(this.basePath + `/${id}`, data, config);
    }

    // Make request without geolocation headers if no coordinates provided
    return await this.api.patch(this.basePath + `/${id}`, data);
  }
}
