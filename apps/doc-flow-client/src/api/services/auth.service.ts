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

  async changePassword({ oldPassword, newPassword }: ChangePasswordDto) {
    return await this.api.post(this.basePath + "/change-password", {
      oldPassword,
      newPassword,
    });
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
