import type { Order } from './order';

export type CalendarView = 'month' | 'week';
export type OperationType = 'pickup' | 'delivery' | 'all';

export interface CalendarFilters {
  status: string;
  operationType: OperationType;
  customerId: string;
}

export interface CalendarEvent {
  order: Order;
  type: 'pickup' | 'delivery';
  date: Date;
  time: string;
}

export interface DayEvents {
  date: Date;
  events: CalendarEvent[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface WeekHourSlot {
  hour: number;
  events: CalendarEvent[];
}

export interface WeekDay {
  date: Date;
  isToday: boolean;
  slots: WeekHourSlot[];
}
