import { ChangePasswordDto } from "@/lib/schemas/auth/change-password.schema";
import AbstractService from "./abstract.service";

export default class AuthService extends AbstractService {
  constructor() {
    super("/auth");
  }

  async signin(email: string, password: string) {
    return await this.api.post(this.basePath + "/signin", { email, password });
  }

  async signup(
    email: string,
    password: string,
    enrollment: string,
    fullName: string
  ) {
    return await this.api.post(this.basePath + "/signup", {
      email,
      password,
      enrollment,
      fullName,
    });
  }

  async changePassword(
    { newPassword }: ChangePasswordDto,
    token?: string
  ) {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    return await this.api.post(
      this.basePath + "/change-password",
      {
        newPassword,
      },
      config
    );
  }

  async requestMagicLogin(email: string) {
    return await this.api.post(this.basePath + "/magic-login/request", {
      email,
    });
  }

  async verifyMagicLogin(token: string) {
    return await this.api.post(this.basePath + "/magic-login/verify", {
      token,
    });
  }
}


export const authService = new AuthService()
