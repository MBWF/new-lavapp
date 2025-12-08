import { useState } from "react";
import { Search, Plus, UserX, Check } from "lucide-react";
import { useCustomers, useCreateCustomer } from "@/hooks/use-customers";
import { useOrderWizard } from "../order-wizard-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { formatPhone, cn } from "@/lib/utils";
import type { Customer } from "@/types/customer";

export function StepCustomer() {
	const { data, setCustomer } = useOrderWizard();
	const { data: customers = [], isLoading } = useCustomers();
	const createCustomer = useCreateCustomer();

	const [search, setSearch] = useState("");
	const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
	const [newCustomerName, setNewCustomerName] = useState("");
	const [newCustomerPhone, setNewCustomerPhone] = useState("");

	const filteredCustomers = customers.filter((c) => {
		const lowerSearch = search.toLowerCase();
		return (
			c.name.toLowerCase().includes(lowerSearch) ||
			c.phone.includes(search) ||
			c.code.toLowerCase().includes(lowerSearch)
		);
	});

	const handleSelectCustomer = (customer: Customer) => {
		setCustomer(customer, false);
	};

	const handleAnonymous = () => {
		setCustomer(null, true);
	};

	const handleCreateCustomer = async () => {
		if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;

		const newCustomer = await createCustomer.mutateAsync({
			name: newCustomerName,
			phone: newCustomerPhone,
		});

		setCustomer(newCustomer, false);
		setIsNewCustomerOpen(false);
		setNewCustomerName("");
		setNewCustomerPhone("");
	};

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold">Selecione o Cliente</h2>
				<p className="mt-1 text-muted-foreground">
					Busque um cliente existente, crie um novo ou continue como avulso
				</p>
			</div>

			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Buscar por nome, telefone ou código..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => setIsNewCustomerOpen(true)}
						className="gap-2"
					>
						<Plus className="h-4 w-4" />
						Novo Cliente
					</Button>
					<Button
						variant="secondary"
						onClick={handleAnonymous}
						className="gap-2"
					>
						<UserX className="h-4 w-4" />
						Cliente Avulso
					</Button>
				</div>
			</div>

			{data.isAnonymous && (
				<Card className="border-2 border-primary bg-primary/5">
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
								<UserX className="h-5 w-5 text-muted-foreground" />
							</div>
							<div>
								<p className="font-medium">Cliente Avulso</p>
								<p className="text-sm text-muted-foreground">
									Pedido sem cliente vinculado
								</p>
							</div>
						</div>
						<Check className="h-5 w-5 text-primary" />
					</CardContent>
				</Card>
			)}

			{data.customer && (
				<Card className="border-2 border-primary bg-primary/5">
					<CardContent className="flex items-center justify-between p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold text-primary">
								{data.customer.name
									.split(" ")
									.map((n) => n[0])
									.join("")
									.slice(0, 2)
									.toUpperCase()}
							</div>
							<div>
								<p className="font-medium">{data.customer.name}</p>
								<p className="text-sm text-muted-foreground">
									{formatPhone(data.customer.phone)} • {data.customer.code}
								</p>
							</div>
						</div>
						<Check className="h-5 w-5 text-primary" />
					</CardContent>
				</Card>
			)}

			<div className="space-y-2">
				<p className="text-sm font-medium text-muted-foreground">
					{isLoading
						? "Carregando clientes..."
						: `${filteredCustomers.length} cliente(s) encontrado(s)`}
				</p>
				<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
					{filteredCustomers.slice(0, 12).map((customer) => (
						<Card
							key={customer.id}
							className={cn(
								"cursor-pointer transition-all hover:border-primary/50 hover:shadow-md",
								data.customer?.id === customer.id && "border-2 border-primary",
							)}
							onClick={() => handleSelectCustomer(customer)}
						>
							<CardContent className="flex items-center gap-3 p-4">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold text-primary">
									{customer.name
										.split(" ")
										.map((n) => n[0])
										.join("")
										.slice(0, 2)
										.toUpperCase()}
								</div>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium">{customer.name}</p>
									<p className="truncate text-sm text-muted-foreground">
										{formatPhone(customer.phone)}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			<Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
				<DialogContent className="sm:max-w-[400px]">
					<DialogHeader>
						<DialogTitle>Cadastro Rápido de Cliente</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="quick-name">Nome *</Label>
							<Input
								id="quick-name"
								placeholder="Nome do cliente"
								value={newCustomerName}
								onChange={(e) => setNewCustomerName(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="quick-phone">Telefone *</Label>
							<Input
								id="quick-phone"
								placeholder="(00) 00000-0000"
								value={newCustomerPhone}
								onChange={(e) => setNewCustomerPhone(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsNewCustomerOpen(false)}
						>
							Cancelar
						</Button>
						<Button
							onClick={handleCreateCustomer}
							disabled={
								!newCustomerName.trim() ||
								!newCustomerPhone.trim() ||
								createCustomer.isPending
							}
						>
							Cadastrar e Selecionar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
