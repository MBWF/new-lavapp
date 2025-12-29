import { useMemo } from 'react';
import { useOrders } from './use-orders';
import type { Order } from '@/types/order';
import type {
  CalendarEvent,
  CalendarFilters,
  DayEvents,
  WeekDay,
  WeekHourSlot,
} from '@/types/calendar';

export function useCalendarEvents(
  startDate: Date,
  endDate: Date,
  filters: CalendarFilters,
) {
  const { data: orders = [], isLoading } = useOrders();

  const events = useMemo(() => {
    const filteredOrders = orders.filter((order) => {
      if (
        filters.status &&
        filters.status !== 'ALL' &&
        order.status !== filters.status
      ) {
        return false;
      }
      if (
        filters.customerId &&
        filters.customerId !== 'all' &&
        order.customer?.id !== filters.customerId
      ) {
        return false;
      }
      return true;
    });

    const calendarEvents: CalendarEvent[] = [];

    filteredOrders.forEach((order) => {
      const pickupDate = new Date(order.pickupDate);
      const deliveryDate = new Date(order.deliveryDate);

      if (
        filters.operationType === 'all' ||
        filters.operationType === 'pickup'
      ) {
        if (pickupDate >= startDate && pickupDate <= endDate) {
          calendarEvents.push({
            order,
            type: 'pickup',
            date: pickupDate,
            time: order.pickupTime,
          });
        }
      }

      if (
        filters.operationType === 'all' ||
        filters.operationType === 'delivery'
      ) {
        if (deliveryDate >= startDate && deliveryDate <= endDate) {
          calendarEvents.push({
            order,
            type: 'delivery',
            date: deliveryDate,
            time: order.deliveryTime,
          });
        }
      }
    });

    return calendarEvents;
  }, [orders, startDate, endDate, filters]);

  return { events, isLoading };
}

export function useMonthDays(
  year: number,
  month: number,
  events: CalendarEvent[],
): DayEvents[] {
  return useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: DayEvents[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        events: getEventsForDate(events, date),
        isToday: isSameDay(date, today),
        isCurrentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        events: getEventsForDate(events, date),
        isToday: isSameDay(date, today),
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        events: getEventsForDate(events, date),
        isToday: isSameDay(date, today),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month, events]);
}

export function useWeekDays(
  startOfWeek: Date,
  events: CalendarEvent[],
): WeekDay[] {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: WeekDay[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const dayEvents = getEventsForDate(events, date);
      const slots: WeekHourSlot[] = [];

      for (let hour = 6; hour <= 20; hour++) {
        slots.push({
          hour,
          events: dayEvents.filter((e) => {
            const eventHour = parseInt(e.time.split(':')[0] || '0', 10);
            return eventHour === hour;
          }),
        });
      }

      days.push({
        date,
        isToday: isSameDay(date, today),
        slots,
      });
    }

    return days;
  }, [startOfWeek, events]);
}

function getEventsForDate(
  events: CalendarEvent[],
  date: Date,
): CalendarEvent[] {
  return events.filter((e) => isSameDay(e.date, date));
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getMonthDateRange(
  year: number,
  month: number,
): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1);
  start.setDate(start.getDate() - 7);
  const end = new Date(year, month + 1, 7);
  return { start, end };
}

export function isOverdue(
  order: Order,
  eventType: 'pickup' | 'delivery',
): boolean {
  const now = new Date();
  const eventDate =
    eventType === 'pickup'
      ? new Date(order.pickupDate)
      : new Date(order.deliveryDate);
  const eventTime =
    eventType === 'pickup' ? order.pickupTime : order.deliveryTime;

  const [hours, minutes] = eventTime.split(':').map(Number);
  eventDate.setHours(hours || 0, minutes || 0, 0, 0);

  return (
    eventDate < now &&
    order.status !== 'DELIVERED' &&
    order.status !== 'CANCELLED'
  );
}
