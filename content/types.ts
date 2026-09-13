export type ProductType = "clothing" | "footwear" | "accessories";
export type Gender = "men" | "women" | "unisex" | "kids";
export type SizeType = "alpha" | "numeric" | "shoe";
export type Stock = "in_stock" | "low" | "out";
export type Badge = "new" | "sale";
export type Fit = "regular" | "slim" | "oversized";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  size: string; // "M", "32", "9" — meaning derived from sizeType
  color: string; // matches ProductColor.name
  stock: Stock;
}

export interface ClothingExtras {
  material: string;
  fit: Fit;
  care: string;
}

export interface FootwearExtras {
  upper: string;
  sole: string;
  closure: string;
  use: string;
}

export interface AccessoryExtras {
  material: string;
  dimensions: string;
  details: string;
}

export interface Product {
  id: string;
  slug: string;
  brand: string;
  name: string;
  productType: ProductType;
  category: string;
  subcategory: string;
  gender: Gender;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: Badge;
  stock: Stock;
  tags: string[];
  description: string;
  features: string[];
  images: { main: string; alt?: string };
  colors: ProductColor[];
  sizeType?: SizeType; // absent for accessories that need no size
  variants: ProductVariant[];
  clothingExtras?: ClothingExtras;
  footwearExtras?: FootwearExtras;
  accessoryExtras?: AccessoryExtras;
}
