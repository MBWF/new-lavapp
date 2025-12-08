import { useWeekDays } from "@/hooks/use-calendar";
import { CalendarEventCard } from "./calendar-event-card";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

interface WeekViewProps {
  startOfWeek: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const formatDayHeader = (date: Date): { day: string; date: number; month: string } => {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return {
    day: days[date.getDay()] ?? "",
    date: date.getDate(),
    month: months[date.getMonth()] ?? "",
  };
};

const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

export function WeekView({ startOfWeek, events, onEventClick }: WeekViewProps) {
  const days = useWeekDays(startOfWeek, events);

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex border-b">
        <div className="w-16 shrink-0 border-r" />
        {days.map((day, index) => {
          const header = formatDayHeader(day.date);
          return (
            <div
              key={index}
              className={cn(
                "flex-1 border-r p-2 text-center last:border-r-0",
                day.isToday && "bg-primary/5"
              )}
            >
              <div className="text-sm font-medium text-muted-foreground">
                {header.day}
              </div>
              <div
                className={cn(
                  "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold",
                  day.isToday && "bg-primary text-primary-foreground"
                )}
              >
                {header.date}
              </div>
              <div className="text-xs text-muted-foreground">{header.month}</div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex">
          <div className="w-16 shrink-0">
            {days[0]?.slots.map((slot) => (
              <div
                key={slot.hour}
                className="flex h-20 items-start justify-end border-b border-r pr-2 pt-1"
              >
                <span className="text-xs text-muted-foreground">
                  {formatHour(slot.hour)}
                </span>
              </div>
            ))}
          </div>

          {days.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className={cn(
                "flex-1 border-r last:border-r-0",
                day.isToday && "bg-primary/5"
              )}
            >
              {day.slots.map((slot) => (
                <div
                  key={slot.hour}
                  className="relative h-20 border-b p-0.5"
                >
                  {slot.events.length > 0 && (
                    <div className="flex h-full flex-col gap-0.5 overflow-hidden">
                      {slot.events.slice(0, 2).map((event, eventIndex) => (
                        <CalendarEventCard
                          key={`${event.order.id}-${event.type}-${eventIndex}`}
                          event={event}
                          onClick={() => onEventClick(event)}
                        />
                      ))}
                      {slot.events.length > 2 && (
                        <div className="text-center text-[10px] font-medium text-muted-foreground">
                          +{slot.events.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

