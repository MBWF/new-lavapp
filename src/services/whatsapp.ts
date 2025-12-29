import type { Order } from "@/supabase/queries/orders";
import { formatCurrency } from "@/lib/utils";

/**
 * Gets the company WhatsApp number from environment variable
 */
function getCompanyWhatsAppNumber(): string {
	const phone = import.meta.env.VITE_WHATSAPP_NUMBER;
	if (!phone) {
		console.warn("VITE_WHATSAPP_NUMBER not configured");
		return "";
	}
	// Clean and add Brazil country code if needed
	const cleaned = phone.replace(/\D/g, "");
	if (cleaned.length === 11 || cleaned.length === 10) {
		return `55${cleaned}`;
	}
	return cleaned;
}

/**
 * Formats the date in Brazilian format
 */
function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(date);
}

/**
 * Generates the message for a newly created order
 */
export function formatOrderCreatedMessage(order: Order): string {
	const itemsList = order.items
		.map(
			(item) =>
				`  • ${item.quantity}x ${item.piece.name} - ${formatCurrency(item.subtotal)}`,
		)
		.join("\n");

	const deliveryInfo =
		order.deliveryType === "DELIVERY"
			? `📍 Entrega no endereço cadastrado`
			: `📍 Retirada na loja`;

	return `🧺 *LavApp - Novo Pedido*

Olá${order.customer?.name ? `, ${order.customer.name.split(" ")[0]}` : ""}! Seu pedido foi registrado.

📋 *Código:* ${order.code}

📦 *Itens:*
${itemsList}

💰 *Total:* ${formatCurrency(order.total)}

📅 *Previsão de entrega:* ${formatDate(order.deliveryDate)} às ${order.deliveryTime}
${deliveryInfo}

Acompanhe seu pedido em: lavapp.com/consultas

Obrigado por escolher a LavApp! 🧺`;
}

/**
 * Generates the message for an order that is ready
 */
export function formatOrderReadyMessage(order: Order): string {
	const pickupInfo =
		order.deliveryType === "DELIVERY"
			? `🚚 Seu pedido será entregue no endereço cadastrado.`
			: `📍 Retire seu pedido na loja.`;

	return `✅ *LavApp - Pedido Pronto!*

Olá${order.customer?.name ? `, ${order.customer.name.split(" ")[0]}` : ""}! 

Seu pedido *${order.code}* está pronto! 🎉

${pickupInfo}

💰 *Total a pagar:* ${formatCurrency(order.total)}

Obrigado por escolher a LavApp! 🧺`;
}

/**
 * Opens WhatsApp with a pre-filled message using the company's WhatsApp number
 */
export function openWhatsApp(message: string): boolean {
	const companyPhone = getCompanyWhatsAppNumber();
	if (!companyPhone) {
		return false;
	}
	const encodedMessage = encodeURIComponent(message);
	const url = `https://wa.me/${companyPhone}?text=${encodedMessage}`;
	window.open(url, "_blank");
	return true;
}

/**
 * Sends WhatsApp notification for a new order
 */
export function sendOrderCreatedNotification(order: Order): boolean {
	const message = formatOrderCreatedMessage(order);
	return openWhatsApp(message);
}

/**
 * Sends WhatsApp notification for an order that is ready
 */
export function sendOrderReadyNotification(order: Order): boolean {
	const message = formatOrderReadyMessage(order);
	return openWhatsApp(message);
}

