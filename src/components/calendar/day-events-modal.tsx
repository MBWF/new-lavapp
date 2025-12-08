import { Calendar } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CalendarEventCard } from "./calendar-event-card";
import type { CalendarEvent } from "@/types/calendar";

interface DayEventsModalProps {
	date: Date | null;
	events: CalendarEvent[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onEventClick: (event: CalendarEvent) => void;
}

export function DayEventsModal({
	date,
	events,
	open,
	onOpenChange,
	onEventClick,
}: DayEventsModalProps) {
	if (!date) return null;

	const formatDate = (d: Date): string => {
		return new Intl.DateTimeFormat("pt-BR", {
			weekday: "long",
			day: "2-digit",
			month: "long",
			year: "numeric",
		}).format(d);
	};

	const pickupEvents = events.filter((e) => e.type === "pickup");
	const deliveryEvents = events.filter((e) => e.type === "delivery");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 capitalize">
						<Calendar className="h-5 w-5" />
						{formatDate(date)}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{events.length === 0 ? (
						<p className="py-8 text-center text-muted-foreground">
							Nenhum pedido agendado para este dia
						</p>
					) : (
						<>
							{pickupEvents.length > 0 && (
								<div>
									<h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
										Coletas ({pickupEvents.length})
									</h3>
									<div className="space-y-2">
										{pickupEvents.map((event, index) => (
											<CalendarEventCard
												key={`pickup-${event.order.id}-${index}`}
												event={event}
												onClick={() => {
													onOpenChange(false);
													onEventClick(event);
												}}
											/>
										))}
									</div>
								</div>
							)}

							{deliveryEvents.length > 0 && (
								<div>
									<h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
										Entregas ({deliveryEvents.length})
									</h3>
									<div className="space-y-2">
										{deliveryEvents.map((event, index) => (
											<CalendarEventCard
												key={`delivery-${event.order.id}-${index}`}
												event={event}
												onClick={() => {
													onOpenChange(false);
													onEventClick(event);
												}}
											/>
										))}
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
