import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	User,
	UserX,
	Package,
	Calendar,
	MapPin,
	FileText,
	Store,
	Truck,
	Clock,
	Trash2,
	Loader2,
	AlertTriangle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select } from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	useOrder,
	useUpdateOrderStatus,
	useDeleteOrder,
} from "@/hooks/use-orders";
import { toast } from "@/hooks/use-toast";
import { formatCurrency, formatPhone, cn } from "@/lib/utils";
import {
	orderStatusLabels,
	deliveryTypeLabels,
	type OrderStatus,
} from "@/types/order";
import { sendOrderReadyNotification } from "@/services/whatsapp";

export const Route = createFileRoute("/orders/$orderId")({
	component: OrderDetailsPage,
});

function OrderDetailsPage() {
	const { orderId } = Route.useParams();
	const navigate = useNavigate();
	const { data: order, isLoading } = useOrder(orderId);
	const updateStatus = useUpdateOrderStatus();
	const deleteOrder = useDeleteOrder();

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const formatDate = (date: Date): string => {
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}).format(date);
	};

	const formatDateTime = (date: Date): string => {
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	const handleStatusChange = async (newStatus: string) => {
		if (!order) return;

		try {
			const updatedOrder = await updateStatus.mutateAsync({
				id: order.id,
				status: newStatus as OrderStatus,
			});
			toast({
				title: "Status atualizado",
				description: `Pedido alterado para ${orderStatusLabels[newStatus as OrderStatus]}`,
				variant: "success",
			});

			// Send WhatsApp notification if status changed to READY
			if (newStatus === "READY" && sendOrderReadyNotification(updatedOrder)) {
				toast({
					title: "WhatsApp",
					description: "Abrindo WhatsApp para avisar o cliente que o pedido está pronto...",
				});
			}
		} catch {
			toast({
				title: "Erro ao atualizar",
				description: "Não foi possível atualizar o status.",
				variant: "destructive",
			});
		}
	};

	const handleDelete = async () => {
		if (!order) return;

		try {
			await deleteOrder.mutateAsync(order.id);
			toast({
				title: "Pedido excluído",
				description: "O pedido foi removido com sucesso.",
				variant: "success",
			});
			navigate({ to: "/orders" });
		} catch {
			toast({
				title: "Erro ao excluir",
				description: "Não é possível excluir pedidos finalizados.",
				variant: "destructive",
			});
		}
		setIsDeleteOpen(false);
	};

	const canDelete =
		order && order.status !== "DELIVERED" && order.status !== "CANCELLED";

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!order) {
		return (
			<div className="flex h-full flex-col items-center justify-center">
				<p className="text-lg text-muted-foreground">Pedido não encontrado</p>
				<Button asChild className="mt-4">
					<Link to="/orders">Voltar para Pedidos</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			<Header
				title={`Pedido ${order.code}`}
				description={`Criado em ${formatDateTime(order.createdAt)}`}
			/>

			<div className="flex-1 space-y-6 p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<Button variant="outline" asChild className="gap-2">
						<Link to="/orders">
							<ArrowLeft className="h-4 w-4" />
							Voltar
						</Link>
					</Button>

					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">Status:</span>
							<Select
								value={order.status}
								onChange={(e) => handleStatusChange(e.target.value)}
								disabled={updateStatus.isPending}
								className="w-[160px]"
							>
								<option value="RECEIVED">Recebido</option>
								<option value="WASHING">Em Lavagem</option>
								<option value="READY">Pronto</option>
								<option value="DELIVERED">Entregue</option>
								<option value="CANCELLED">Cancelado</option>
							</Select>
						</div>

						{canDelete && (
							<Button
								variant="outline"
								onClick={() => setIsDeleteOpen(true)}
								className="gap-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
							>
								<Trash2 className="h-4 w-4" />
								Excluir
							</Button>
						)}
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					<div className="space-y-6 lg:col-span-2">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base">
									<Package className="h-5 w-5" />
									Itens do Pedido
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{order.items.map((item) => (
										<div
											key={item.id}
											className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
										>
											<div className="flex items-center gap-3">
												<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
													<Package className="h-4 w-4 text-primary" />
												</div>
												<div>
													<p className="font-medium">{item.piece.name}</p>
													<p className="text-sm text-muted-foreground">
														{item.quantity}x {formatCurrency(item.unitPrice)}
													</p>
												</div>
											</div>
											<span className="font-semibold">
												{formatCurrency(item.subtotal)}
											</span>
										</div>
									))}
								</div>

								<Separator className="my-4" />

								<div className="flex items-center justify-between">
									<span className="text-lg font-semibold">Total</span>
									<span className="text-2xl font-bold text-primary">
										{formatCurrency(order.total)}
									</span>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base">
									{order.deliveryType === "PICKUP" ? (
										<Store className="h-5 w-5" />
									) : (
										<Truck className="h-5 w-5" />
									)}
									Informações de Entrega
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-2">
									<span
										className={cn(
											"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
											order.deliveryType === "DELIVERY"
												? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
												: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
										)}
									>
										{deliveryTypeLabels[order.deliveryType]}
									</span>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-1">
										<p className="text-sm text-muted-foreground">Coleta</p>
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<span>
												{formatDate(order.pickupDate)} às {order.pickupTime}
											</span>
										</div>
									</div>
									<div className="space-y-1">
										<p className="text-sm text-muted-foreground">Entrega</p>
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<span>
												{formatDate(order.deliveryDate)} às {order.deliveryTime}
											</span>
										</div>
									</div>
								</div>

								{order.deliveryType === "DELIVERY" && order.deliveryAddress && (
									<div className="space-y-1">
										<p className="text-sm text-muted-foreground">Endereço</p>
										<div className="flex items-start gap-2">
											<MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
											<span>{order.deliveryAddress}</span>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						{(order.notes || order.specialInstructions) && (
							<Card>
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-base">
										<FileText className="h-5 w-5" />
										Observações
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{order.notes && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Observações Gerais
											</p>
											<p className="mt-1">{order.notes}</p>
										</div>
									)}
									{order.specialInstructions && (
										<div>
											<p className="text-sm font-medium text-muted-foreground">
												Instruções Especiais
											</p>
											<p className="mt-1">{order.specialInstructions}</p>
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>

					<div className="space-y-6">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base">
									{order.isAnonymous ? (
										<UserX className="h-5 w-5" />
									) : (
										<User className="h-5 w-5" />
									)}
									Cliente
								</CardTitle>
							</CardHeader>
							<CardContent>
								{order.isAnonymous ? (
									<div className="flex items-center gap-3">
										<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
											<UserX className="h-6 w-6 text-muted-foreground" />
										</div>
										<div>
											<p className="font-medium">Cliente Avulso</p>
											<p className="text-sm text-muted-foreground">
												Sem cadastro vinculado
											</p>
										</div>
									</div>
								) : order.customer ? (
									<div className="flex items-center gap-3">
										<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold text-primary">
											{order.customer.name
												.split(" ")
												.map((n) => n[0])
												.join("")
												.slice(0, 2)
												.toUpperCase()}
										</div>
										<div>
											<p className="font-medium">{order.customer.name}</p>
											<p className="text-sm text-muted-foreground">
												{formatPhone(order.customer.phone)}
											</p>
											<p className="text-xs text-muted-foreground">
												{order.customer.code}
											</p>
										</div>
									</div>
								) : null}
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="flex items-center gap-2 text-base">
									<Clock className="h-5 w-5" />
									Histórico
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{order.history.map((entry) => (
										<div
											key={entry.id}
											className="flex items-start gap-3 border-l-2 border-muted pl-3"
										>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium">
													{entry.description}
												</p>
												<p className="text-xs text-muted-foreground">
													{formatDateTime(entry.createdAt)}
												</p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
							<AlertTriangle className="h-6 w-6 text-destructive" />
						</div>
						<DialogTitle className="text-center text-xl">
							Excluir Pedido
						</DialogTitle>
						<DialogDescription className="text-center">
							Tem certeza que deseja excluir o pedido{" "}
							<span className="font-semibold text-foreground">
								{order.code}
							</span>
							? Esta ação não pode ser desfeita.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 pt-4 sm:justify-center">
						<Button
							variant="outline"
							onClick={() => setIsDeleteOpen(false)}
							disabled={deleteOrder.isPending}
						>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={deleteOrder.isPending}
						>
							{deleteOrder.isPending && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Excluir
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
