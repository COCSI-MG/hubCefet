import { ChangePasswordDto } from "@/lib/schemas/auth/change-password.schema";
import AuthService from "../services/auth.service";
import {
  AuthSigninResponse,
  AuthSignupResponse,
  AuthSigninBody,
  AuthSignupBody,

} from "@/lib/schemas/auth/index.schema";

const authServiceInstance = new AuthService();

export const getAccessToken = async ({
  email,
  password,
}: AuthSigninBody): Promise<AuthSigninResponse | undefined> => {
  const data: AuthSigninResponse = await authServiceInstance.signin(
    email,
    password
  );
  return data;
};

export const signup = async ({
  email,
  password,
  enrollment,
  fullName,
}: AuthSignupBody): Promise<AuthSignupResponse | undefined> => {
  if (!enrollment || !fullName) {
    throw new Error("Campos vazios não são permitidos");
  }
  const authServiceInstance = new AuthService();
  const data: AuthSignupResponse = await authServiceInstance.signup(
    email,
    password,
    enrollment,
    fullName
  );
  return data;
};

export const changePassword = async ({
  oldPassword,
  newPassword,
}: ChangePasswordDto): Promise<void | string> => {
  return await authServiceInstance.changePassword({
    oldPassword,
    newPassword,
  });
};
