import { z } from "zod";

export const pieceSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  price: z
    .number({ invalid_type_error: "Preço deve ser um número" })
    .positive("Preço deve ser maior que 0")
    .or(
      z
        .string()
        .min(1, "Preço é obrigatório")
        .transform((val) => parseFloat(val.replace(",", ".")))
        .refine((val) => !isNaN(val) && val > 0, "Preço deve ser maior que 0")
    ),
  unitType: z.enum(["UNIDADE", "PAR"], {
    errorMap: () => ({ message: "Selecione o tipo de unidade" }),
  }),
});

export type PieceFormData = z.infer<typeof pieceSchema>;

