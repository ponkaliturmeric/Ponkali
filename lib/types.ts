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
  /* ── CRM fields (see the schema notes in lib/db.ts) ── */
  /** Where the order came from: 'website' for checkout, 'whatsapp' etc. when typed in by hand. */
  source?: string;
  /** 'Unpaid' | 'Partial' | 'Paid' | 'Refunded' — money actually received. */
  payment_status?: string;
  amount_paid?: number;
  /** UPI txn id, cheque no., Razorpay payment id — whatever identifies the payment. */
  payment_ref?: string;
  discount?: number;
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

/**
 * A bulk / wholesale enquiry — someone asking for a quote rather than placing
 * an order. Worked through ENQUIRY_STATUSES (lib/crm.ts) until won or lost.
 */
export interface BulkEnquiry {
  id: number;
  created_at: string;
  updated_at: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  company?: string | null;
  city?: string | null;
  state?: string | null;
  source?: string | null;
  /** What they asked for, in their own words. */
  product?: string | null;
  /** Quantity as written, e.g. "50 kg" or "100 x 250g pouches". */
  quantity?: string | null;
  /** Numeric weight when known, for sizing the pipeline. */
  quantity_kg?: number | null;
  target_price?: number | null;
  quoted_price?: number | null;
  requirement?: string | null;
  status: string;
  follow_up_on?: string | null;
  notes?: string | null;
}
