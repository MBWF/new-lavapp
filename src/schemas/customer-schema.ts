import { z } from "zod";

export const customerSchema = z.object({
	name: z
		.string()
		.min(3, "Nome deve ter pelo menos 3 caracteres")
		.max(100, "Nome deve ter no máximo 100 caracteres"),
	phone: z
		.string()
		.min(10, "Telefone deve ter pelo menos 10 dígitos")
		.max(15, "Telefone deve ter no máximo 15 dígitos")
		.regex(/^[\d\s()-]+$/, "Telefone deve conter apenas números"),
	email: z.string().email("Email inválido").optional().or(z.literal("")),
	address: z
		.string()
		.max(200, "Endereço deve ter no máximo 200 caracteres")
		.optional()
		.or(z.literal("")),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
