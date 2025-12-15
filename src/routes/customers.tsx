import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Plus, Search, Pencil, Trash2, Users, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CustomerForm } from '@/components/customers/customer-form';
import { DeleteCustomerDialog } from '@/components/customers/delete-customer-dialog';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from '@/hooks/use-customers';
import { toast } from '@/hooks/use-toast';
import { formatPhone, cn } from '@/lib/utils';
import type { Customer } from '@/types/customer';
import type { CustomerFormData } from '@/schemas/customer-schema';

export const Route = createFileRoute('/customers')({
  component: CustomersPage,
});

const ITEMS_PER_PAGE = 10;

function CustomersPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;
    const lowerSearch = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.code.toLowerCase().includes(lowerSearch) ||
        c.phone.includes(search),
    );
  }, [customers, search]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

  const handleCreateCustomer = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (data: CustomerFormData) => {
    if (selectedCustomer) {
      await updateCustomer.mutateAsync(
        { id: selectedCustomer.id, ...data },
        {
          onSuccess: () => {
            toast({
              title: 'Cliente atualizado',
              description: 'As informações foram salvas com sucesso.',
              variant: 'success',
            });
            setIsFormOpen(false);
          },
          onError: () => {
            toast({
              title: 'Erro ao atualizar',
              description: 'Não foi possível atualizar o cliente.',
              variant: 'destructive',
            });
          },
        },
      );
    } else {
      await createCustomer.mutateAsync(data, {
        onSuccess: () => {
          toast({
            title: 'Cliente cadastrado',
            description: 'O novo cliente foi cadastrado com sucesso.',
            variant: 'success',
          });
          setIsFormOpen(false);
        },
        onError: () => {
          toast({
            title: 'Erro ao cadastrar',
            description: 'Não foi possível cadastrar o cliente.',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;

    await deleteCustomer.mutateAsync(selectedCustomer.id, {
      onSuccess: () => {
        toast({
          title: 'Cliente excluído',
          description: 'O cliente foi removido com sucesso.',
          variant: 'success',
        });
        setIsDeleteOpen(false);
        setSelectedCustomer(null);
      },
      onError: () => {
        toast({
          title: 'Erro ao excluir',
          description: 'Não foi possível excluir o cliente.',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Clientes"
        description="Gerencie os clientes da sua lavanderia"
      />

      <div className="flex-1 space-y-6 p-6">
        <Card
          className="animate-fade-in"
          style={{ animationFillMode: 'forwards' }}
        >
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código ou telefone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Button onClick={handleCreateCustomer} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : paginatedCustomers.length > 0 ? (
              <>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[300px]">Nome</TableHead>
                        <TableHead className="w-[120px]">Código</TableHead>
                        <TableHead className="w-[160px]">Telefone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="w-[100px] text-right">
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCustomers.map((customer, index) => (
                        <TableRow
                          key={customer.id}
                          className={cn(
                            'opacity-0 animate-fade-in',
                            `stagger-${Math.min(index + 1, 5)}`,
                          )}
                          style={{ animationFillMode: 'forwards' }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-xs font-semibold text-primary">
                                {customer.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <span className="font-medium">
                                {customer.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="rounded-md bg-muted px-2 py-1 font-mono text-sm">
                              {customer.code}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatPhone(customer.phone)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {customer.email || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditCustomer(customer)}
                                    aria-label="Editar cliente"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteCustomer(customer)
                                    }
                                    className="text-muted-foreground hover:text-destructive"
                                    aria-label="Excluir cliente"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Excluir</TooltipContent>
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
                    <p className="text-sm text-muted-foreground">
                      Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredCustomers.length,
                      )}{' '}
                      de {filteredCustomers.length} clientes
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
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? 'default' : 'outline'
                            }
                            size="sm"
                            className="w-9"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
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
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  Nenhum cliente encontrado
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search
                    ? 'Tente buscar com outros termos'
                    : 'Comece cadastrando seu primeiro cliente'}
                </p>
                {!search && (
                  <Button onClick={handleCreateCustomer} className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Cadastrar Cliente
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CustomerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        isLoading={createCustomer.isPending || updateCustomer.isPending}
        customer={selectedCustomer}
      />

      <DeleteCustomerDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteCustomer.isPending}
        customer={selectedCustomer}
      />
    </div>
  );
}
