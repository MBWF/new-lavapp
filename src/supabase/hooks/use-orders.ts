import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type CreateOrderInput,
  type DeliveryType,
  type Order,
  type OrderHistory,
  type OrderItem,
  type OrderStatus,
  ordersQueries,
  type UpdateOrderInput,
} from '../queries';

const ORDERS_KEY = 'orders';

export const useOrders = () => {
  return useQuery({
    queryKey: [ORDERS_KEY],
    queryFn: ordersQueries.getAll,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: [ORDERS_KEY, id],
    queryFn: () => ordersQueries.getById(id),
    enabled: !!id,
  });
};

export const useOrdersByStatus = (status: OrderStatus) => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'status', status],
    queryFn: () => ordersQueries.getByStatus(status),
  });
};

export const useOrdersByDateRange = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: [
      ORDERS_KEY,
      'dateRange',
      startDate.toISOString(),
      endDate.toISOString(),
    ],
    queryFn: () => ordersQueries.getByDateRange(startDate, endDate),
  });
};

export const useSearchOrders = (query: string) => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'search', query],
    queryFn: () => ordersQueries.search(query),
    enabled: query.length > 0,
  });
};

export const useOrdersByPhone = (phone: string) => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'phone', phone],
    queryFn: () => ordersQueries.getByPhone(phone),
    enabled: phone.length >= 8,
  });
};

export const useOrdersByCustomerId = (
  customerId: string,
  page: number = 1,
  pageSize: number = 10,
) => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'customer', customerId, page, pageSize],
    queryFn: () => ordersQueries.getByCustomerId(customerId, page, pageSize),
    enabled: !!customerId,
    staleTime: 30000,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => ordersQueries.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateOrderInput) => ordersQueries.update(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
      queryClient.setQueryData([ORDERS_KEY, data.id], data);
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersQueries.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
      queryClient.setQueryData([ORDERS_KEY, data.id], data);
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersQueries.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
    },
  });
};

export type {
  Order,
  OrderItem,
  OrderHistory,
  OrderStatus,
  DeliveryType,
  CreateOrderInput,
  UpdateOrderInput,
};
