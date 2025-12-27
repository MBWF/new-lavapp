import { supabase } from "../client";

export interface CompanySettings {
	id: string;
	name: string;
	phone: string | null;
	address: string | null;
	logoUrl: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface UpdateCompanySettingsInput {
	name?: string;
	phone?: string | null;
	address?: string | null;
	logoUrl?: string | null;
}

interface CompanySettingsRow {
	id: string;
	name: string;
	phone: string | null;
	address: string | null;
	logo_url: string | null;
	created_at: string;
	updated_at: string;
}

const mapRowToSettings = (row: CompanySettingsRow): CompanySettings => ({
	id: row.id,
	name: row.name,
	phone: row.phone,
	address: row.address,
	logoUrl: row.logo_url,
	createdAt: new Date(row.created_at),
	updatedAt: new Date(row.updated_at),
});

export const companySettingsQueries = {
	get: async (): Promise<CompanySettings | null> => {
		const { data, error } = await supabase
			.from("company_settings")
			.select("*")
			.limit(1)
			.single();

		if (error) {
			if (error.code === "PGRST116") return null;
			throw error;
		}
		return mapRowToSettings(data);
	},

	update: async (input: UpdateCompanySettingsInput): Promise<CompanySettings> => {
		// First get the existing record
		const existing = await companySettingsQueries.get();
		
		if (!existing) {
			// Create new record if doesn't exist
			const insertData = {
				name: input.name ?? "LavApp",
				phone: input.phone,
				address: input.address,
				logo_url: input.logoUrl,
			};

			const { data, error } = await supabase
				.from("company_settings")
				.insert(insertData)
				.select()
				.single();

			if (error) throw error;
			return mapRowToSettings(data);
		}

		// Update existing record
		const updateData: Record<string, unknown> = {};
		if (input.name !== undefined) updateData.name = input.name;
		if (input.phone !== undefined) updateData.phone = input.phone;
		if (input.address !== undefined) updateData.address = input.address;
		if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl;

		const { data, error } = await supabase
			.from("company_settings")
			.update(updateData)
			.eq("id", existing.id)
			.select()
			.single();

		if (error) throw error;
		return mapRowToSettings(data);
	},
};
