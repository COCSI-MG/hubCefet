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
    search?: string;
    profileName?: string;
  }): Promise<UsersGetAllResponse> {
    return await this.api.get(
      `${this.basePath}/limit/${args.limit}/offset/${args.offset}`,
      {
        params: {
          search: args.search,
          profileName: args.profileName,
        },
      }
    );
  }

  async getOne(id: string): Promise<User> {
    return await this.api.get(this.basePath + `/${id}`);
  }

  async patch(
    id: string,
    data: CreateUser
  ): Promise<User> {
    return await this.api.patch(this.basePath + `/${id}`, { ...data });
  }

  async delete(id: string): Promise<void> {
    return await this.api.delete(this.basePath + `/${id}`);
  }

  async create(data: CreateUser): Promise<User> {
    return await this.api.post(this.basePath, { ...data });
  }
}

export const userService = new UserService()
