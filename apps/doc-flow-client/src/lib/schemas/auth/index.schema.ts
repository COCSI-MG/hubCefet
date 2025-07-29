import { components, paths } from "@/lib/schema";

export type AuthSigninResponse =
  components["schemas"]["AccessTokenResponseDto"];
export type AuthSignupResponse =
  components["schemas"]["AccessTokenResponseDto"];

export type AuthSigninBody =
  paths["/auth/signin"]["post"]["requestBody"]["content"]["application/json"];
export type AuthSignupBody =
  paths["/auth/signup"]["post"]["requestBody"]["content"]["application/json"];
