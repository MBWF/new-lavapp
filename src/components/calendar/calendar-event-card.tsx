import { Clock, Package, Truck, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { isOverdue } from "@/hooks/use-calendar";
import { cn, formatCurrency } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";
import { orderStatusColors, orderStatusLabels } from "@/types/order";

interface CalendarEventCardProps {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: () => void;
}

export function CalendarEventCard({
  event,
  compact = false,
  onClick,
}: CalendarEventCardProps) {
  const { order, type, time } = event;
  const overdue = isOverdue(order, type);
  const { canViewPrices } = useAuth();

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
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
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
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
          <span className="font-medium text-muted-foreground text-xs">
            {type === "pickup" ? "Coleta" : "Entrega"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <Clock className="h-3 w-3" />
          {time}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <User className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate font-medium text-sm">
          {order.isAnonymous ? "Cliente Avulso" : order.customer?.name}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-1.5 py-0.5 font-medium text-[10px]",
            orderStatusColors[order.status]
          )}
        >
          {orderStatusLabels[order.status]}
        </span>
        {canViewPrices && (
          <span className="font-semibold text-emerald-600 text-xs dark:text-emerald-400">
            {formatCurrency(order.total)}
          </span>
        )}
      </div>

      {overdue && (
        <div className="flex items-center gap-1 font-medium text-[10px] text-red-600 dark:text-red-400">
          <Clock className="h-3 w-3" />
          Atrasado
        </div>
      )}
    </button>
  );
}
