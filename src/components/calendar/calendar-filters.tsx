import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomers } from "@/hooks/use-customers";
import { orderStatusLabels, type OrderStatus } from "@/types/order";
import type { CalendarFilters, OperationType } from "@/types/calendar";

interface CalendarFiltersProps {
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
}

const statusOptions: Array<{ value: OrderStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Todos os Status" },
  { value: "RECEIVED", label: orderStatusLabels.RECEIVED as string },
  { value: "WASHING", label: orderStatusLabels.WASHING as string },
  { value: "READY", label: orderStatusLabels.READY as string },
  { value: "DELIVERED", label: orderStatusLabels.DELIVERED as string },
];

const operationOptions: Array<{ value: OperationType; label: string }> = [
  { value: "all", label: "Coletas e Entregas" },
  { value: "pickup", label: "Apenas Coletas" },
  { value: "delivery", label: "Apenas Entregas" },
];

export function CalendarFiltersComponent({
  filters,
  onFiltersChange,
}: CalendarFiltersProps) {
  const { data: customers = [] } = useCustomers();

  const hasActiveFilters =
    filters.status !== "ALL" ||
    filters.operationType !== "all" ||
    filters.customerId !== "all";

  const handleReset = () => {
    onFiltersChange({
      status: "ALL",
      operationType: "all",
      customerId: "all",
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Filter className="h-4 w-4" />
        Filtros:
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, status: value })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={filters.operationType}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            operationType: value as OperationType,
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operationOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.customerId}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, customerId: value })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Todos os Clientes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Clientes</SelectItem>
          {customers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1 text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Limpar
        </Button>
      )}
    </div>
  );
}
