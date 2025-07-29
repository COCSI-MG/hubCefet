import { ApiResponse } from "@/lib/types";
import AbstractService from "./abstract.service";
import type { components } from "@/lib/schema";
import { CreateUser } from "@/lib/schemas/user.schema";

type UsersGetAllResponse = components["schemas"]["GetAllUsersResponseDto"];
type User = components["schemas"]["User"];

export default class UserService extends AbstractService {
  constructor() {
    super("/users", true);
  }

  async getAll(args: {
    limit: number;
    offset: number;
  }): Promise<UsersGetAllResponse> {
    return await this.api.get(
      this.basePath + `?limit=${args.limit}&offset=${args.offset}`,
    );
  }

  async getOne(id: string): Promise<ApiResponse<{ user: User }>> {
    return await this.api.get(this.basePath + `/${id}`);
  }

  async patch(
    id: string,
    data: CreateUser,
  ): Promise<ApiResponse<{ user: User }>> {
    return await this.api.patch(this.basePath + `/${id}`, { ...data });
  }
}
