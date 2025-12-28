import { supabase } from '../client';
import type {
  CompanySettingsRow,
  CompanySettingsUpdate,
} from '../types/database';
import type { CompanySettings, UpdateCompanySettingsInput } from '@/types/company';

const parseCompanySettings = (row: CompanySettingsRow): CompanySettings => {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    logoUrl: row.logo_url,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
};

export const companySettingsQueries = {
  get: async (): Promise<CompanySettings | null> => {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return parseCompanySettings(data as CompanySettingsRow);
  },

  update: async (
    id: string,
    input: UpdateCompanySettingsInput,
  ): Promise<CompanySettings> => {
    const updateData: CompanySettingsUpdate = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl;

    const { data, error } = await supabase
      .from('company_settings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update company settings');

    return parseCompanySettings(data as CompanySettingsRow);
  },

  uploadLogo: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from('company-logos').getPublicUrl(filePath);

    return publicUrl;
  },

  deleteLogo: async (logoUrl: string): Promise<void> => {
    const urlParts = logoUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    if (!fileName) return;

    const { error } = await supabase.storage
      .from('company-logos')
      .remove([fileName]);

    if (error) throw error;
  },
};

