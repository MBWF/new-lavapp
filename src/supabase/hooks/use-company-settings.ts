import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	companySettingsQueries,
	type CompanySettings,
	type UpdateCompanySettingsInput,
} from "../queries/company-settings";

const SETTINGS_KEY = "company-settings";

export const useCompanySettings = () => {
	return useQuery({
		queryKey: [SETTINGS_KEY],
		queryFn: companySettingsQueries.get,
	});
};

export const useUpdateCompanySettings = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpdateCompanySettingsInput) =>
			companySettingsQueries.update(input),
		onSuccess: (data) => {
			queryClient.setQueryData([SETTINGS_KEY], data);
		},
	});
};

export type { CompanySettings, UpdateCompanySettingsInput };
