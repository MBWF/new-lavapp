import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  ShoppingBag,
  DollarSign,
  Clock,
  Eye,
  Loader2,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useCustomer } from "@/hooks/use-customers";
import { useOrdersByCustomerId } from "@/hooks/use-orders";
import { useCustomerStats } from "@/hooks/use-customer-stats";
import { formatCurrency, formatPhone, cn } from "@/lib/utils";
import {
  orderStatusLabels,
  orderStatusColors,
  paymentMethodLabels,
  type OrderStatus,
} from "@/types/order";

export const Route = createFileRoute("/customers/$customerId/orders")({
  component: CustomerOrdersPage,
});

const ITEMS_PER_PAGE = 10;

function CustomerOrdersPage() {
  const { customerId } = Route.useParams();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">(
    "all"
  );

  const { data: customer, isLoading: isLoadingCustomer } =
    useCustomer(customerId);
  const { data, isLoading: isLoadingOrders } = useOrdersByCustomerId(
    customerId,
    page,
    ITEMS_PER_PAGE
  );
  const stats = useCustomerStats(customerId);

  const orders = data?.orders || [];
  const totalOrders = data?.total || 0;
  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "ALL" && order.status !== statusFilter) return false;
    if (paymentFilter === "paid" && !order.isPaid) return false;
    if (paymentFilter === "unpaid" && order.isPaid) return false;
    return true;
  });

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(date);
  };

  if (isLoadingCustomer) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">Cliente não encontrado</p>
        <Button asChild className="mt-4">
          <Link to="/customers">Voltar para Clientes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title={`Histórico de ${customer.name}`}
        description={`Pedidos anteriores do cliente ${customer.code}`}
      />

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" asChild className="gap-2 w-fit">
            <Link to="/customers">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Clientes
            </Link>
          </Button>

          <Button asChild className="gap-2 w-fit">
            <Link to="/orders/new">
              <Plus className="h-4 w-4" />
              Novo Pedido para {customer.name}
            </Link>
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <strong>Código:</strong> {customer.code}
                  </span>
                  <span className="flex items-center gap-1">
                    <strong>Telefone:</strong> {formatPhone(customer.phone)}
                  </span>
                  {customer.email && (
                    <span className="flex items-center gap-1">
                      <strong>Email:</strong> {customer.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Pedidos
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total Gasto
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalSpent)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Pendente
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.unpaidAmount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Último Pedido
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.lastOrderDate
                  ? formatDate(stats.lastOrderDate)
                  : "Nenhum"}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as OrderStatus | "ALL")
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos os status</SelectItem>
                    <SelectItem value="RECEIVED">
                      {orderStatusLabels.RECEIVED}
                    </SelectItem>
                    <SelectItem value="WASHING">
                      {orderStatusLabels.WASHING}
                    </SelectItem>
                    <SelectItem value="READY">
                      {orderStatusLabels.READY}
                    </SelectItem>
                    <SelectItem value="DELIVERED">
                      {orderStatusLabels.DELIVERED}
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                      {orderStatusLabels.CANCELLED}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={paymentFilter}
                  onValueChange={(value: any) => setPaymentFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos pagamentos</SelectItem>
                    <SelectItem value="paid">Pagos</SelectItem>
                    <SelectItem value="unpaid">Não pagos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length > 0 ? (
              <>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[120px]">Código</TableHead>
                        <TableHead className="w-[100px]">Data</TableHead>
                        <TableHead className="w-[80px]">Itens</TableHead>
                        <TableHead className="w-[120px]">Total</TableHead>
                        <TableHead className="w-[140px]">Pagamento</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[80px] text-right">
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <span className="rounded-md bg-muted px-2 py-1 font-mono text-sm">
                              {order.code}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {order.items.length}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(order.total)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant={order.isPaid ? "default" : "secondary"}
                                className={cn(
                                  "text-xs w-fit",
                                  order.isPaid
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                )}
                              >
                                {order.isPaid ? "Pago" : "Não Pago"}
                              </Badge>
                              {order.paymentMethod && (
                                <span className="text-muted-foreground text-xs">
                                  {paymentMethodLabels[order.paymentMethod]}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={cn(
                                "text-xs",
                                orderStatusColors[order.status]
                              )}
                            >
                              {orderStatusLabels[order.status]}
                            </Badge>
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
                      Página {page} de {totalPages} ({totalOrders} pedidos no
                      total)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                        className="gap-1"
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  Nenhum pedido encontrado com os filtros aplicados
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
