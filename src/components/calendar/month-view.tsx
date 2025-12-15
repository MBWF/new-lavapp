import { useMonthDays } from '@/hooks/use-calendar';
import { CalendarEventCard } from './calendar-event-card';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/types/calendar';

interface MonthViewProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date, events: CalendarEvent[]) => void;
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function MonthView({
  year,
  month,
  events,
  onEventClick,
  onDayClick,
}: MonthViewProps) {
  const days = useMonthDays(year, month, events);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div
            key={day}
            className="border-r p-2 text-center text-sm font-medium text-muted-foreground last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => onDayClick(day.date, day.events)}
            className={cn(
              'group relative min-h-[100px] border-b border-r p-1 text-left transition-colors hover:bg-muted/50 last:border-r-0',
              !day.isCurrentMonth && 'bg-muted/30',
              day.isToday && 'bg-primary/5',
            )}
          >
            <div
              className={cn(
                'mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm',
                day.isToday &&
                  'bg-primary font-semibold text-primary-foreground',
                !day.isCurrentMonth && 'text-muted-foreground',
              )}
            >
              {day.date.getDate()}
            </div>

            <div className="space-y-0.5">
              {day.events.slice(0, 3).map((event, eventIndex) => (
                <CalendarEventCard
                  key={`${event.order.id}-${event.type}-${eventIndex}`}
                  event={event}
                  compact
                  onClick={() => onEventClick(event)}
                />
              ))}
              {day.events.length > 3 && (
                <div className="px-1.5 text-xs font-medium text-muted-foreground">
                  +{day.events.length - 3} mais
                </div>
              )}
            </div>

            {day.events.length > 0 && (
              <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                {day.events.length}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
