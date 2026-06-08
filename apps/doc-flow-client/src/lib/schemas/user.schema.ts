import { z } from "zod";
import { components } from "../schema";

export type User = components["schemas"]["User"];

export const createUserSchema = z
  .object({
    full_name: z.string({ required_error: "Nome completo é obrigatório" }).min(1, "Nome completo é obrigatório"),
    email: z
      .string({ required_error: "Email é obrigatório" })
      .email()
      .regex(/(@cefet-rj\.br|@aluno\.cefet-rj\.br)$/, {
        message: "Email deve ser @cefet-rj.br ou @aluno.cefet-rj.br",
      }),
    enrollment: z.string({ required_error: "Matrícula é obrigatória" }).regex(/\d{4}\d{3}\w{3}/, {
      message: "Matrícula inválida",
    }),
    profileId: z.string({ required_error: "Perfil é obrigatório" }).min(1, "Perfil é obrigatório"),
    password: z
      .string({ required_error: "Senha é obrigatória" })
      .min(8, { message: "Senha deve ter no mínimo 8 caracteres" }),
    confirmPassword: z.string({ required_error: "Confirmação de senha é obrigatória" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type CreateUser = z.infer<typeof createUserSchema>;

export const createUserByAdminSchema = z.object({
  full_name: z.string({ required_error: "Nome completo é obrigatório" }).min(1, "Nome completo é obrigatório"),
  email: z
    .string({ required_error: "Email é obrigatório" })
    .email()
    .regex(/(@cefet-rj\.br|@aluno\.cefet-rj\.br)$/, {
      message: "Email deve ser @cefet-rj.br ou @aluno.cefet-rj.br",
    }),
  enrollment: z.string().optional(),
  profileId: z.string({ required_error: "Perfil é obrigatório" }).min(1, "Perfil é obrigatório"),
});

export type CreateUserByAdmin = z.infer<typeof createUserByAdminSchema>;

export const updateUserByAdminSchema = z.object({
  full_name: z.string().optional(),
  email: z
    .string()
    .email()
    .regex(/(@cefet-rj\.br|@aluno\.cefet-rj\.br)$/, {
      message: "Email deve ser @cefet-rj.br ou @aluno.cefet-rj.br",
    })
    .optional(),
  enrollment: z.string().optional(),
  profileId: z.string().optional(),
})

export type UpdateUserByAdmin = z.infer<typeof updateUserByAdminSchema>
