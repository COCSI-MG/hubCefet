import { z } from "zod";
import { components } from "../schema";

export type User = components["schemas"]["User"];

export const createUserSchema = z.object({
  fullName: z.string(),
  email: z
    .string()
    .email()
    .regex(/(@cefet-rj\.br|@aluno\.cefet-rj\.br)$/, {
      message: "Email deve ser @cefet-rj.br ou @aluno.cefet-rj.br",
    }),
  enrollment: z.string().regex(/\d{4}\d{3}\w{3}/, {
    message: "Matrícula inválida",
  }),
  profile_id: z.string(),
});

export type CreateUser = z.infer<typeof createUserSchema>;
