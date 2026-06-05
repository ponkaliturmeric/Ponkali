export interface Product {
  id: number;
  slug: string;
  name: string;
  weight: string;
  price: number;
  original_price?: number;
  in_stock: number;
  is_bestseller: number;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  order_id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  email?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  payment_method: string;
  upi_id?: string;
  subtotal: number;
  shipping: number;
  cod_charge: number;
  total: number;
  status: string;
  notes?: string;
  items?: OrderItem[];
  item_count?: number;
}

export interface OrderItem {
  id: number;
  order_id: string;
  product_name: string;
  weight: string;
  quantity: number;
  price: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}
