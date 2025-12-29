import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  Eye,
  Loader2,
  Package,
  Plus,
  Search,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Order, useOrders } from "@/hooks/use-orders";
import { cn, formatCurrency } from "@/lib/utils";
import {
  deliveryTypeLabels,
  type OrderStatus,
  orderStatusColors,
  orderStatusLabels,
} from "@/types/order";

export const Route = createFileRoute("/orders/")({
  component: OrdersPage,
});

const ITEMS_PER_PAGE = 10;

const statusFilters: Array<{ value: OrderStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "RECEIVED", label: orderStatusLabels.RECEIVED },
  { value: "WASHING", label: orderStatusLabels.WASHING },
  { value: "READY", label: orderStatusLabels.READY },
  { value: "DELIVERED", label: orderStatusLabels.DELIVERED },
];

function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: orders = [], isLoading } = useOrders();

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((o: Order) => o.status === statusFilter);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (o: Order) =>
          o.code.toLowerCase().includes(lowerSearch) ||
          o.customer?.name.toLowerCase().includes(lowerSearch) ||
          o.customer?.phone.includes(search)
      );
    }

    return filtered;
  }, [orders, search, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(date);
  };

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Pedidos"
        description="Gerencie os pedidos da sua lavanderia"
      />

      <div className="flex-1 overflow-y-auto space-y-6 p-6">
        <Card
          className="animate-fade-in"
          style={{ animationFillMode: "forwards" }}
        >
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:items-center">
              <div className="relative w-full max-w-sm">
                <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, cliente..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={
                      statusFilter === filter.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setStatusFilter(filter.value);
                      setCurrentPage(1);
                    }}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
            <Button asChild className="gap-2">
              <Link to="/orders/new">
                <Plus className="h-4 w-4" />
                Novo Pedido
              </Link>
            </Button>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : paginatedOrders.length > 0 ? (
              <>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[120px]">Código</TableHead>
                        <TableHead className="w-[200px]">Cliente</TableHead>
                        <TableHead className="w-[100px]">Itens</TableHead>
                        <TableHead className="w-[120px]">Total</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[100px]">Entrega</TableHead>
                        <TableHead className="w-[100px]">Data</TableHead>
                        <TableHead className="w-[80px] text-right">
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOrders.map((order: Order, index: number) => (
                        <TableRow
                          key={order.id}
                          className={cn(
                            "animate-fade-in opacity-0",
                            `stagger-${Math.min(index + 1, 5)}`
                          )}
                          style={{ animationFillMode: "forwards" }}
                        >
                          <TableCell>
                            <span className="rounded-md bg-muted px-2 py-1 font-mono text-sm">
                              {order.code}
                            </span>
                          </TableCell>
                          <TableCell>
                            {order.isAnonymous ? (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>Cliente Avulso</span>
                              </div>
                            ) : order.customer ? (
                              <div>
                                <p className="font-medium">
                                  {order.customer.name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {order.customer.code}
                                </p>
                              </div>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span>{order.items.length}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(order.total)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs",
                                orderStatusColors[order.status]
                              )}
                            >
                              {orderStatusLabels[order.status]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground text-sm">
                              {deliveryTypeLabels[order.deliveryType]}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" asChild>
                                    <Link
                                      to="/orders/$orderId"
                                      params={{ orderId: order.id }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ver detalhes</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredOrders.length
                      )}{" "}
                      de {filteredOrders.length} pedidos
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-semibold text-lg">
                  Nenhum pedido encontrado
                </h3>
                <p className="mt-1 text-muted-foreground text-sm">
                  {search || statusFilter !== "ALL"
                    ? "Tente ajustar os filtros"
                    : "Comece criando seu primeiro pedido"}
                </p>
                {!search && statusFilter === "ALL" && (
                  <Button asChild className="mt-4 gap-2">
                    <Link to="/orders/new">
                      <Plus className="h-4 w-4" />
                      Criar Pedido
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
