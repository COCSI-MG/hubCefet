import { z } from "zod";
import { components } from "../schema";

export type User = components["schemas"]["User"];

export const createUserSchema = z
  .object({
    full_name: z.string(),
    email: z
      .string()
      .email()
      .regex(/(@cefet-rj\.br|@aluno\.cefet-rj\.br)$/, {
        message: "Email deve ser @cefet-rj.br ou @aluno.cefet-rj.br",
      }),
    enrollment: z.string().regex(/\d{4}\d{3}\w{3}/, {
      message: "Matrícula inválida",
    }),
    profileId: z.string(),
    password: z
      .string()
      .min(8, { message: "Senha deve ter no mínimo 8 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type CreateUser = z.infer<typeof createUserSchema>;
