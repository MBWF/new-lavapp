import { useMemo } from 'react';
import { useOrders } from './use-orders';
import type { PAYMENT_METHOD_OPTIONS } from '@/types/order';

export interface FinancialSummary {
  totalOrders: number;
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  paymentRate: number;
  byPaymentMethod: Record<
    (typeof PAYMENT_METHOD_OPTIONS)[number]['value'],
    { count: number; total: number }
  >;
}

export interface RevenueDataPoint {
  date: string;
  label: string;
  totalRevenue: number;
  paidRevenue: number;
}

export function useFinancialSummary(startDate: Date, endDate: Date) {
  const { data: allOrders = [], isLoading } = useOrders();

  const summary = useMemo((): FinancialSummary => {
    const filteredOrders = allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });

    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );
    const paidRevenue = filteredOrders
      .filter((order) => order.isPaid)
      .reduce((sum, order) => sum + order.total, 0);
    const unpaidRevenue = totalRevenue - paidRevenue;

    const paymentRate =
      filteredOrders.length > 0
        ? (filteredOrders.filter((order) => order.isPaid).length /
            filteredOrders.length) *
          100
        : 0;

    const byPaymentMethod: Record<
      (typeof PAYMENT_METHOD_OPTIONS)[number]['value'],
      { count: number; total: number }
    > = {
      CASH: { count: 0, total: 0 },
      CREDIT_CARD: { count: 0, total: 0 },
      DEBIT_CARD: { count: 0, total: 0 },
      PIX: { count: 0, total: 0 },
    };

    filteredOrders.forEach((order) => {
      if (order.paymentMethod) {
        byPaymentMethod[order.paymentMethod]!.count += 1;
        byPaymentMethod[order.paymentMethod]!.total += order.total;
      }
    });

    return {
      totalOrders: filteredOrders.length,
      totalRevenue,
      paidRevenue,
      unpaidRevenue,
      paymentRate,
      byPaymentMethod,
    };
  }, [allOrders, startDate, endDate]);

  return { data: summary, isLoading };
}

export type PeriodType = 'day' | 'week' | 'month' | 'year';

export function useRevenueByPeriod(period: PeriodType, startDate?: Date) {
  const { data: allOrders = [], isLoading } = useOrders();

  const revenueData = useMemo((): RevenueDataPoint[] => {
    const now = new Date();
    const start = startDate || now;
    const data: RevenueDataPoint[] = [];

    if (period === 'day') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(start);
        date.setDate(start.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);

        const dayOrders = allOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= date && orderDate < nextDate;
        });

        const totalRevenue = dayOrders.reduce(
          (sum, order) => sum + order.total,
          0,
        );
        const paidRevenue = dayOrders
          .filter((order) => order.isPaid)
          .reduce((sum, order) => sum + order.total, 0);

        data.push({
          date: date.toISOString(),
          label: date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
          }),
          totalRevenue,
          paidRevenue,
        });
      }
    } else if (period === 'week') {
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(start);
        weekStart.setDate(start.getDate() - i * 7);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const weekOrders = allOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= weekStart && orderDate < weekEnd;
        });

        const totalRevenue = weekOrders.reduce(
          (sum, order) => sum + order.total,
          0,
        );
        const paidRevenue = weekOrders
          .filter((order) => order.isPaid)
          .reduce((sum, order) => sum + order.total, 0);

        data.push({
          date: weekStart.toISOString(),
          label: `Sem ${12 - i}`,
          totalRevenue,
          paidRevenue,
        });
      }
    } else if (period === 'month') {
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(
          start.getFullYear(),
          start.getMonth() - i,
          1,
        );
        const nextMonth = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth() + 1,
          1,
        );

        const monthOrders = allOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= monthDate && orderDate < nextMonth;
        });

        const totalRevenue = monthOrders.reduce(
          (sum, order) => sum + order.total,
          0,
        );
        const paidRevenue = monthOrders
          .filter((order) => order.isPaid)
          .reduce((sum, order) => sum + order.total, 0);

        data.push({
          date: monthDate.toISOString(),
          label: monthDate.toLocaleDateString('pt-BR', {
            month: 'short',
            year: '2-digit',
          }),
          totalRevenue,
          paidRevenue,
        });
      }
    } else if (period === 'year') {
      const currentYear = start.getFullYear();
      for (let i = 4; i >= 0; i--) {
        const year = currentYear - i;
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year + 1, 0, 1);

        const yearOrders = allOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= yearStart && orderDate < yearEnd;
        });

        const totalRevenue = yearOrders.reduce(
          (sum, order) => sum + order.total,
          0,
        );
        const paidRevenue = yearOrders
          .filter((order) => order.isPaid)
          .reduce((sum, order) => sum + order.total, 0);

        data.push({
          date: yearStart.toISOString(),
          label: year.toString(),
          totalRevenue,
          paidRevenue,
        });
      }
    }

    return data;
  }, [allOrders, period, startDate]);

  return { data: revenueData, isLoading };
}

export function useOrdersWithPaymentFilter(
  paymentStatus?: 'paid' | 'unpaid' | 'all',
  paymentMethod?: (typeof PAYMENT_METHOD_OPTIONS)[number]['value'],
) {
  const { data: allOrders = [], isLoading } = useOrders();

  const filteredOrders = useMemo(() => {
    let orders = allOrders;

    if (paymentStatus === 'paid') {
      orders = orders.filter((order) => order.isPaid);
    } else if (paymentStatus === 'unpaid') {
      orders = orders.filter((order) => !order.isPaid);
    }

    if (paymentMethod) {
      orders = orders.filter((order) => order.paymentMethod === paymentMethod);
    }

    return orders;
  }, [allOrders, paymentStatus, paymentMethod]);

  return { data: filteredOrders, isLoading };
}
