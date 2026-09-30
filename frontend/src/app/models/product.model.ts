export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

export interface UpdateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}
