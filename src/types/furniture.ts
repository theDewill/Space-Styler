export interface FurnitureItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  ctg: string;
  price: number;
  color: string;
  material: string;
  picture: string;
  m_code: string;
  model?: File;
}
