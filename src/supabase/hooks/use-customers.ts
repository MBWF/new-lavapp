import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  customersQueries,
  type Customer,
  type CreateCustomerInput,
  type UpdateCustomerInput,
} from "../queries";

const CUSTOMERS_KEY = "customers";

export const useCustomers = () => {
  return useQuery({
    queryKey: [CUSTOMERS_KEY],
    queryFn: customersQueries.getAll,
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, id],
    queryFn: () => customersQueries.getById(id),
    enabled: !!id,
  });
};

export const useSearchCustomers = (query: string) => {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, "search", query],
    queryFn: () => customersQueries.search(query),
    enabled: query.length > 0,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customersQueries.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCustomerInput) => customersQueries.update(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
      queryClient.setQueryData([CUSTOMERS_KEY, data.id], data);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersQueries.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
  });
};

export type { Customer, CreateCustomerInput, UpdateCustomerInput };

