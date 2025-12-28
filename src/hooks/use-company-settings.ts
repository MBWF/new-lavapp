import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companySettingsQueries } from '@/supabase/queries/company-settings';
import type { UpdateCompanySettingsInput } from '@/types/company';

const COMPANY_SETTINGS_KEY = 'company-settings';

export const useCompanySettings = () => {
  return useQuery({
    queryKey: [COMPANY_SETTINGS_KEY],
    queryFn: companySettingsQueries.get,
  });
};

export const useUpdateCompanySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateCompanySettingsInput;
    }) => companySettingsQueries.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANY_SETTINGS_KEY] });
    },
  });
};

export const useUploadLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => companySettingsQueries.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANY_SETTINGS_KEY] });
    },
  });
};

export const useDeleteLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logoUrl: string) => companySettingsQueries.deleteLogo(logoUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANY_SETTINGS_KEY] });
    },
  });
};

