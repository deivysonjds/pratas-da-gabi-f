import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  price: z.coerce.number().min(1, 'O preço deve ser maior que 0'),
  stock: z.coerce.number().min(0, 'O estoque não pode ser negativo'),
  category: z.string().min(1, 'Selecione uma categoria'),
  image: z.any().optional(), // Para o input de arquivo
});

export type ProductFormData = z.infer<typeof productSchema>;