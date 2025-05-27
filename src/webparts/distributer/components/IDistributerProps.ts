export interface IDistributerProps {
  userGuid: string;
  refresh?: number;
  searchQuery?: string;
  updateCartCount?: () => void;
}

export interface Image {
  name: string;
  url: string;
}

export interface CartProps {
  userGuid: string;
  refresh?: boolean;
}

export interface CartItemProps {
  product: Product;
  onDelete: (id: number) => void;
}

export interface CrudFormProps {
  title: string;
  isEditing: boolean;
  onChange: (event: React.FormEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface Item {
  Id: number;
  Title: string;
  Code: string;
}

export interface CartListProps {
  products: Product[];
  onDelete: (id: number) => void;
}

export interface CrudMessageProps {
  message: string;
}

export interface CardListProps {
  items: Item[];
  onDelete: (id: number) => void;
}

export interface Product {
  Price: string;
  codegoods: string;
  size: string;
  color: string;
  productgroup: string;
  IdCode: string;
  image: string;
  Id: number;
  Title: string;
  Code: string;
  djne: string;
  Inventory: string;
  cart: (id: number, title: string) => void;
  updateCartCount?: () => void;
}

export interface ProductsDivProps {
  products: Product[];
  cart: (id: number, title: string) => void;
  image: any;
  updateCartCount?: () => void;
}

export interface CounterProps {
  product?: Product;
  onDelete: (id: number) => void;
}

export interface SearchBarProps {
  value: string;
  onChange: (event: React.FormEvent<HTMLInputElement>) => void;
}

export interface FilterBarProps {
  products?: Product[];
  onFilterChange: (filters: Partial<FilterBarState>) => void;
}

export interface FilterBarState {
  productgroup: string | number | string[];
  size: string;
  color: string;
  subcategory: string;
}

export interface ZarSimProduct {
  Image: string;
  Title: string;
  Code: string;
  Type: string;
  Count: number;
  Status: string;
  RequestedAmount: number;
  Inventory: number;
  date_farvardin: string;
  order0: string;
  serial: string;
  IdCode: string;
  size: string;
  color: string;
  productgroup: string;
  thermalclass: string;
  ghotreshte: number;
  number_x002f_stringdiameter: string;
  percentage: number;
  Price: string;
  Modified: string;
  Created: string;
  Author: string;
  Editor: string;
}
