import { products } from "./products";
import type { Product } from "./types";

const byId = new Map<string, Product>(products.map((p) => [p.id, p]));

export function getProductById(id: string): Product | undefined {
  return byId.get(id);
}
