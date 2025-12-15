import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@/components/layout/header';
import { OrderWizard } from '@/components/orders/order-wizard';

export const Route = createFileRoute('/orders/new')({
  component: NewOrderPage,
});

function NewOrderPage() {
  return (
    <div className="flex h-full flex-col">
      <Header
        title="Novo Pedido"
        description="Crie um novo pedido passo a passo"
      />
      <div className="flex-1 overflow-hidden">
        <OrderWizard />
      </div>
    </div>
  );
}
