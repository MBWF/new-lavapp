import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useCustomers } from "@/hooks/use-customers";
import { orderStatusLabels, type OrderStatus } from "@/types/order";
import type { CalendarFilters, OperationType } from "@/types/calendar";

interface CalendarFiltersProps {
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
}

const statusOptions: Array<{ value: OrderStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Todos os Status" },
  { value: "RECEIVED", label: orderStatusLabels["RECEIVED"] ?? "Recebido" },
  { value: "WASHING", label: orderStatusLabels["WASHING"] ?? "Em Lavagem" },
  { value: "READY", label: orderStatusLabels["READY"] ?? "Pronto" },
  { value: "DELIVERED", label: orderStatusLabels["DELIVERED"] ?? "Entregue" },
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
    filters.customerId !== "";

  const handleReset = () => {
    onFiltersChange({
      status: "ALL",
      operationType: "all",
      customerId: "",
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        Filtros:
      </div>

      <Select
        value={filters.status}
        onChange={(e) =>
          onFiltersChange({ ...filters, status: e.target.value })
        }
        className="w-[160px]"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select
        value={filters.operationType}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            operationType: e.target.value as OperationType,
          })
        }
        className="w-[160px]"
      >
        {operationOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select
        value={filters.customerId}
        onChange={(e) =>
          onFiltersChange({ ...filters, customerId: e.target.value })
        }
        className="w-[180px]"
      >
        <option value="">Todos os Clientes</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name}
          </option>
        ))}
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

