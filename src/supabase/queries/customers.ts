import { supabase } from "../client";
import type {
	CustomerRow,
	CustomerInsert,
	CustomerUpdate,
} from "../types/database";

export interface Customer {
	id: string;
	code: string;
	name: string;
	phone: string;
	email?: string | null;
	address?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateCustomerInput {
	name: string;
	phone: string;
	email?: string;
	address?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
	id: string;
}

const mapCustomerRowToCustomer = (row: CustomerRow): Customer => ({
	id: row.id,
	code: row.code,
	name: row.name,
	phone: row.phone,
	email: row.email,
	address: row.address,
	createdAt: new Date(row.created_at),
	updatedAt: new Date(row.updated_at),
});

export const customersQueries = {
	getAll: async (): Promise<Customer[]> => {
		const { data, error } = await supabase
			.from("customers")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) throw error;
		return data.map(mapCustomerRowToCustomer);
	},

	getById: async (id: string): Promise<Customer | null> => {
		const { data, error } = await supabase
			.from("customers")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			if (error.code === "PGRST116") return null;
			throw error;
		}
		return mapCustomerRowToCustomer(data);
	},

	create: async (input: CreateCustomerInput): Promise<Customer> => {
		const { data: codeData, error: codeError } = await supabase.rpc(
			"generate_customer_code",
			{ customer_name: input.name },
		);

		if (codeError) throw codeError;

		const insertData: CustomerInsert = {
			code: codeData,
			name: input.name,
			phone: input.phone,
			email: input.email,
			address: input.address,
		};

		const { data, error } = await supabase
			.from("customers")
			.insert(insertData)
			.select()
			.single();

		if (error) throw error;
		return mapCustomerRowToCustomer(data);
	},

	update: async (input: UpdateCustomerInput): Promise<Customer> => {
		const updateData: CustomerUpdate = {};

		if (input.name !== undefined) updateData.name = input.name;
		if (input.phone !== undefined) updateData.phone = input.phone;
		if (input.email !== undefined) updateData.email = input.email;
		if (input.address !== undefined) updateData.address = input.address;

		const { data, error } = await supabase
			.from("customers")
			.update(updateData)
			.eq("id", input.id)
			.select()
			.single();

		if (error) throw error;
		return mapCustomerRowToCustomer(data);
	},

	delete: async (id: string): Promise<void> => {
		const { error } = await supabase.from("customers").delete().eq("id", id);

		if (error) throw error;
	},

	search: async (query: string): Promise<Customer[]> => {
		const { data, error } = await supabase
			.from("customers")
			.select("*")
			.or(`name.ilike.%${query}%,code.ilike.%${query}%,phone.ilike.%${query}%`)
			.order("name", { ascending: true });

		if (error) throw error;
		return data.map(mapCustomerRowToCustomer);
	},
};
