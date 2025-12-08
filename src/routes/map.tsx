import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { CalendarFiltersComponent } from "@/components/calendar/calendar-filters";
import { OrderDetailsModal } from "@/components/calendar/order-details-modal";
import { DayEventsModal } from "@/components/calendar/day-events-modal";
import {
  useCalendarEvents,
  getStartOfWeek,
  getEndOfWeek,
  getMonthDateRange,
} from "@/hooks/use-calendar";
import type { CalendarView, CalendarFilters, CalendarEvent } from "@/types/calendar";

export const Route = createFileRoute("/map")({
  component: MapPage,
});

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function MapPage() {
  const today = new Date();
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(today);
  const [filters, setFilters] = useState<CalendarFilters>({
    status: "ALL",
    operationType: "all",
    customerId: "",
  });

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const dateRange = useMemo(() => {
    if (view === "month") {
      return getMonthDateRange(year, month);
    }
    const start = getStartOfWeek(currentDate);
    const end = getEndOfWeek(currentDate);
    return { start, end };
  }, [view, year, month, currentDate]);

  const { events, isLoading } = useCalendarEvents(
    dateRange.start,
    dateRange.end,
    filters
  );

  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDayClick = (date: Date, dayEvents: CalendarEvent[]) => {
    setSelectedDayDate(date);
    setSelectedDayEvents(dayEvents);
    setIsDayModalOpen(true);
  };

  const getHeaderTitle = (): string => {
    if (view === "month") {
      return `${monthNames[month]} ${year}`;
    }
    const start = getStartOfWeek(currentDate);
    const end = getEndOfWeek(currentDate);
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} de ${startMonth} ${year}`;
    }
    return `${start.getDate()} ${startMonth} - ${end.getDate()} ${endMonth} ${year}`;
  };

  const totalPickups = events.filter((e) => e.type === "pickup").length;
  const totalDeliveries = events.filter((e) => e.type === "delivery").length;

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Mapa de Pedidos"
        description="Visualize todos os pedidos no calendário"
      />

      <div className="flex-1 space-y-4 overflow-hidden p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              aria-label="Próximo"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="ml-2 text-xl font-semibold">{getHeaderTitle()}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Coletas: {totalPickups}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>Entregas: {totalDeliveries}</span>
              </div>
            </div>

            <div className="flex rounded-lg border p-1">
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                className="gap-1"
              >
                <CalendarDays className="h-4 w-4" />
                Mês
              </Button>
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                className="gap-1"
              >
                <CalendarRange className="h-4 w-4" />
                Semana
              </Button>
            </div>
          </div>
        </div>

        <CalendarFiltersComponent filters={filters} onFiltersChange={setFilters} />

        <Card className="flex-1 overflow-hidden">
          <CardContent className="h-full p-0">
            {isLoading ? (
              <div className="flex h-full items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : view === "month" ? (
              <MonthView
                year={year}
                month={month}
                events={events}
                onEventClick={handleEventClick}
                onDayClick={handleDayClick}
              />
            ) : (
              <WeekView
                startOfWeek={getStartOfWeek(currentDate)}
                events={events}
                onEventClick={handleEventClick}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <OrderDetailsModal
        event={selectedEvent}
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
      />

      <DayEventsModal
        date={selectedDayDate}
        events={selectedDayEvents}
        open={isDayModalOpen}
        onOpenChange={setIsDayModalOpen}
        onEventClick={handleEventClick}
      />
    </div>
  );
}
