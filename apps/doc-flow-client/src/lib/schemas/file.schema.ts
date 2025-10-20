import { z } from "zod";
import { components } from "../schema";

export type File = components["schemas"]["File"];

export type FileSchema = Omit<File, "user">;

export const createFileSchema = z.object({
  name: z
    .string()
    .max(30, { message: "Nome do arquivo deve ter no máximo 30 caracteres" }),
  type: z.enum(["image", "document", "certificate"], {
    required_error: "Tipo do arquivo é obrigatório",
  }),
});

export type CreateFile = z.infer<typeof createFileSchema>;

export type CreateFileResponse = components["schemas"]["CreateFileResponseDto"];
