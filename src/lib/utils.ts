import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
	const cleaned = phone.replace(/\D/g, "");
	if (cleaned.length === 11) {
		return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
	}
	if (cleaned.length === 10) {
		return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
	}
	return phone;
}

export function generateCode(name: string): string {
	const initials = name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 3);
	const random = Math.floor(Math.random() * 1000)
		.toString()
		.padStart(3, "0");
	return `${initials}${random}`;
}

export function formatCurrency(value: number): string {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
}
