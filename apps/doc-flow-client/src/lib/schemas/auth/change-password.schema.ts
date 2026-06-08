import { components } from "@/lib/schema";
import { z } from "zod";

export type ChangePasswordDto = components["schemas"]["ChangePasswordDto"];

export const changePassowrdSchema = z.object({
  newPassword: z.string().min(8, {
    message: "A senha deve conter no mínimo 8 caracteres",
  }),
  confirmPassword: z.string().min(8, {
    message: "A senha deve conter no mínimo 8 caracteres",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type ChangePassword = z.infer<typeof changePassowrdSchema>;
