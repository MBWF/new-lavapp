import { formatOrderMessage } from '../services/whatsapp/formatters';
import type { Order } from '../supabase/queries';

// Default recipient number
const DEFAULT_RECIPIENT = '+5583996367773';

export interface SendWhatsAppMessageParams {
  to: string;
  text: string;
}

export interface SendOrderWhatsAppParams {
  order: Order;
  to?: string;
}

/**
 * Opens WhatsApp Web with a pre-filled message
 * @param phone - Phone number in international format (e.g., +5583996367773)
 * @param message - The message text
 */
const openWhatsApp = (phone: string, message: string) => {
  // Remove any non-digit characters except the plus sign
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);

  // WhatsApp Web URL format
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  // Open in new window
  window.open(whatsappUrl, '_blank');
};

export const useWhatsApp = () => {
  const sendMessage = (params: SendWhatsAppMessageParams) => {
    openWhatsApp(params.to, params.text);
  };

  const sendOrderNotification = (params: SendOrderWhatsAppParams) => {
    const message = formatOrderMessage(params.order);
    const recipient = params.to || DEFAULT_RECIPIENT;
    openWhatsApp(recipient, message);
  };

  return {
    sendMessage,
    sendOrderNotification,
  };
};
