import { useNavigate } from '@tanstack/react-router';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateOrder } from '@/hooks/use-orders';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { OrderWizardProvider, useOrderWizard } from './order-wizard-context';
import { StepConfirmation } from './steps/step-confirmation';
import { StepCustomer } from './steps/step-customer';
import { StepDelivery } from './steps/step-delivery';
import { StepPieces } from './steps/step-pieces';

const steps = [
  { id: 1, title: 'Cliente', description: 'Selecione o cliente' },
  { id: 2, title: 'Peças', description: 'Adicione as peças' },
  { id: 3, title: 'Entrega', description: 'Configure a entrega' },
  { id: 4, title: 'Confirmação', description: 'Revise e confirme' },
];

function WizardContent() {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, data, canProceed, resetWizard } =
    useOrderWizard();
  const createOrder = useCreateOrder();

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirm = async () => {
    if (!canProceed()) return;

    try {
      const order = await createOrder.mutateAsync({
        customerId: data.customer?.id,
        isAnonymous: data.isAnonymous,
        items: data.items.map((item) => ({
          pieceId: item.piece.id,
          quantity: item.quantity,
          unitPrice: item.piece.price,
        })),
        deliveryType: data.deliveryType,
        pickupDate: data.pickupDate!,
        pickupTime: data.pickupTime,
        deliveryDate: data.deliveryDate!,
        deliveryTime: data.deliveryTime,
        deliveryAddress: data.deliveryAddress,
        notes: data.notes,
        specialInstructions: data.specialInstructions,
      });

      toast({
        title: 'Pedido criado com sucesso!',
        description: `Código do pedido: ${order.code}`,
        variant: 'success',
      });

      resetWizard();
      navigate({ to: '/orders/$orderId', params: { orderId: order.id } });
    } catch {
      toast({
        title: 'Erro ao criar pedido',
        description: 'Não foi possível criar o pedido. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-background/95 px-6 py-4 backdrop-blur">
        <nav className="mx-auto max-w-4xl">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => (
              <li key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() =>
                    step.id < currentStep && setCurrentStep(step.id)
                  }
                  disabled={step.id > currentStep}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                    step.id === currentStep && 'bg-primary/10 text-primary',
                    step.id < currentStep &&
                      'cursor-pointer text-muted-foreground hover:text-foreground',
                    step.id > currentStep &&
                      'cursor-not-allowed text-muted-foreground/50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full font-medium text-xs',
                      step.id === currentStep &&
                        'bg-primary text-primary-foreground',
                      step.id < currentStep && 'bg-primary/20 text-primary',
                      step.id > currentStep && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </span>
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl">
          {currentStep === 1 && <StepCustomer />}
          {currentStep === 2 && <StepPieces />}
          {currentStep === 3 && <StepDelivery />}
          {currentStep === 4 && <StepConfirmation />}
        </div>
      </div>

      <div className="border-t bg-background/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              Continuar
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={!canProceed() || createOrder.isPending}
              className="gap-2"
            >
              {createOrder.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Confirmar Pedido
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function OrderWizard() {
  return (
    <OrderWizardProvider>
      <WizardContent />
    </OrderWizardProvider>
  );
}
