import { $Enums } from "@prisma/client";

export type ProductCategory =
  | "SHOES"
  | "ELECTRONICS"
  | "CLOTHES"
  | "GROCERIES"
  | "BOOKS"
  | "FURNITURE"
  | "BEAUTY"
  | "PETSUPPLIES";

export interface RegisterProduct {
  name: string;
  category: ProductCategory | undefined;
  price: number;
  quantity: number;
  description: string;
  image: string;
}

export interface HomeProductType {
  id: string;
  image: string;
  name: string;
  category: $Enums.ProductCategory;
  price: number;
}

export interface ProductDetailsType {
  id: string;
  name: string;
  image: string;
  category: $Enums.ProductCategory;
  price: number;
  quantity: number;
  description: string;
}

export interface ReviewType {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: {
    name: string;
  };
}

export interface AverageRatingType {
  count: number;
  averageRating: number | null;
}
