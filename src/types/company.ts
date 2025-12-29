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
