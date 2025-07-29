import { CreateUser } from "@/lib/schemas/user.schema";
import UsersService from "../services/users.service";
import { components } from "@/lib/schema";

type UsersGetAllResponse = components["schemas"]["GetAllUsersResponseDto"];
type User = components["schemas"]["User"];

const userService = new UsersService();

export const getAllUsers = async (): Promise<User[] | undefined> => {
  try {
    const response: UsersGetAllResponse = await userService.getAll({
      limit: 10,
      offset: 0,
    });
    return response?.data.users;
  } catch (error) {
    console.error(error);
  }
};

export const getUser = async (id: string): Promise<User | undefined> => {
  try {
    const response = await userService.getOne(id);
    return response.data.user;
  } catch (error) {
    console.error(error);
  }
};

export const updateUserPatchVerb = async (
  id: string,
  data: CreateUser,
): Promise<User | undefined> => {
  try {
    const response = await userService.patch(id, data);
    return response.data.user;
  } catch (err) {
    if (import.meta.env.DEV) console.error(err);
    return undefined;
  }
};
