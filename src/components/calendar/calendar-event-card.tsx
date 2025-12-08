import { Package, Truck, Clock, User } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { orderStatusLabels, orderStatusColors } from "@/types/order";
import { isOverdue } from "@/hooks/use-calendar";
import type { CalendarEvent } from "@/types/calendar";

interface CalendarEventCardProps {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: () => void;
}

export function CalendarEventCard({ event, compact = false, onClick }: CalendarEventCardProps) {
  const { order, type, time } = event;
  const overdue = isOverdue(order, type);

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-colors",
          type === "pickup"
            ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50",
          overdue && "ring-2 ring-red-500"
        )}
      >
        {type === "pickup" ? (
          <Package className="h-3 w-3 shrink-0" />
        ) : (
          <Truck className="h-3 w-3 shrink-0" />
        )}
        <span className="truncate font-medium">
          {order.isAnonymous ? "Avulso" : order.customer?.name.split(" ")[0]}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-1 rounded-lg border p-2 text-left transition-all hover:shadow-md",
        type === "pickup"
          ? "border-blue-200 bg-blue-50 hover:border-blue-300 dark:border-blue-800 dark:bg-blue-900/20"
          : "border-green-200 bg-green-50 hover:border-green-300 dark:border-green-800 dark:bg-green-900/20",
        overdue && "ring-2 ring-red-500"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {type === "pickup" ? (
            <Package className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          ) : (
            <Truck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          )}
          <span className="text-xs font-medium text-muted-foreground">
            {type === "pickup" ? "Coleta" : "Entrega"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {time}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate text-sm font-medium">
          {order.isAnonymous ? "Cliente Avulso" : order.customer?.name}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
            orderStatusColors[order.status]
          )}
        >
          {orderStatusLabels[order.status]}
        </span>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(order.total)}
        </span>
      </div>

      {overdue && (
        <div className="flex items-center gap-1 text-[10px] font-medium text-red-600 dark:text-red-400">
          <Clock className="h-3 w-3" />
          Atrasado
        </div>
      )}
    </button>
  );
}

