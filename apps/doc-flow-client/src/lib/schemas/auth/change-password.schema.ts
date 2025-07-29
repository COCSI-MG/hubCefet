import { components } from "@/lib/schema";
import { z } from "zod";

export type ChangePasswordDto = components["schemas"]["ChangePasswordDto"];

export const changePassowrdSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8, {
    message: "A senha deve conter no mínimo 8 caracteres",
  }),
});

export type ChangePassword = z.infer<typeof changePassowrdSchema>;
