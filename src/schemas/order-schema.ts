import { z } from 'zod';

export const orderItemSchema = z.object({
  pieceId: z.string().min(1, 'Peça é obrigatória'),
  quantity: z.number().int().positive('Quantidade deve ser maior que 0'),
});

export const deliveryInfoSchema = z
  .object({
    deliveryType: z.enum(['PICKUP', 'DELIVERY'], {
      errorMap: () => ({ message: 'Selecione o tipo de entrega' }),
    }),
    pickupDate: z.date({ required_error: 'Data de coleta é obrigatória' }),
    pickupTime: z.string().min(1, 'Horário de coleta é obrigatório'),
    deliveryDate: z.date({ required_error: 'Data de entrega é obrigatória' }),
    deliveryTime: z.string().min(1, 'Horário de entrega é obrigatório'),
    deliveryAddress: z.string().optional(),
    notes: z
      .string()
      .max(500, 'Observações devem ter no máximo 500 caracteres')
      .optional(),
    specialInstructions: z
      .string()
      .max(500, 'Instruções devem ter no máximo 500 caracteres')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.deliveryType === 'DELIVERY' && !data.deliveryAddress?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: 'Endereço é obrigatório para delivery',
      path: ['deliveryAddress'],
    },
  );

export const createOrderSchema = z.object({
  customerId: z.string().optional(),
  isAnonymous: z.boolean(),
  items: z.array(orderItemSchema).min(1, 'Adicione pelo menos uma peça'),
  deliveryType: z.enum(['PICKUP', 'DELIVERY']),
  pickupDate: z.date(),
  pickupTime: z.string(),
  deliveryDate: z.date(),
  deliveryTime: z.string(),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  specialInstructions: z.string().optional(),
  paymentMethod: z
    .enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX'])
    .optional(),
  isPaid: z.boolean().optional(),
});

export type OrderItemFormData = z.infer<typeof orderItemSchema>;
export type DeliveryInfoFormData = z.infer<typeof deliveryInfoSchema>;
export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
