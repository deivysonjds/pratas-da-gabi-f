export const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
export const fromDigits = (text: string) => Number(text.replace(/\D/g, '')) / 100;
export const parseBRL = (text: string) => fromDigits(text);
