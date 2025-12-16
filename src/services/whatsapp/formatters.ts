import { format } from 'date-fns';
import type { Order } from '../../supabase/queries';

export const formatOrderMessage = (order: Order): string => {
  const customerName = order.customer?.name || 'Cliente Anônimo';
  const deliveryTypeText =
    order.deliveryType === 'PICKUP' ? '🏪 Retirada' : '🚚 Entrega';

  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.piece.name} x${item.quantity} - R$ ${item.subtotal.toFixed(2)}`,
    )
    .join('\n');

  const pickupDate = format(order.pickupDate, 'dd/MM/yyyy');
  const deliveryDate = format(order.deliveryDate, 'dd/MM/yyyy');

  let message = `🎉 *Novo Pedido Criado!*\n\n`;
  message += `📋 *Código:* ${order.code}\n`;
  message += `👤 *Cliente:* ${customerName}\n\n`;

  message += `🧺 *Itens do Pedido:*\n${itemsList}\n\n`;

  message += `💰 *Total:* R$ ${order.total.toFixed(2)}\n\n`;

  message += `📅 *Coleta:* ${pickupDate} às ${order.pickupTime}\n`;
  message += `📅 *Entrega:* ${deliveryDate} às ${order.deliveryTime}\n`;
  message += `🚚 *Tipo:* ${deliveryTypeText}\n`;

  if (order.deliveryType === 'DELIVERY' && order.deliveryAddress) {
    message += `📍 *Endereço:* ${order.deliveryAddress}\n`;
  }

  if (order.notes) {
    message += `\n📝 *Observações:* ${order.notes}`;
  }

  if (order.specialInstructions) {
    message += `\n⚠️ *Instruções Especiais:* ${order.specialInstructions}`;
  }

  return message;
};
