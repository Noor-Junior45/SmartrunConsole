export type ProductCategory = 'electrical' | 'construction';

export type DiscountType = 'percentage' | 'flat';
export type CategoryScope = 'all' | 'electrical' | 'construction';
export type OfferScopeMode = 'all' | 'category' | 'specific' | 'current_product';

export interface Offer {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  max_discount?: number | null;
  category_scope: CategoryScope;
  banner_image?: string | null;
  valid_from: string;
  valid_until?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Computed / Joined relation fields for UI
  product_count?: number;
  product_ids?: string[];
}

export interface OfferProduct {
  offer_id: string;
  product_id: string;
  created_at?: string;
}

export interface OfferFormData {
  code: string;
  title: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  category_scope: CategoryScope;
  banner_image: string | null;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  scope_mode: OfferScopeMode;
  selected_product_ids: string[];
}

export interface ColorVariant {
  id?: string;
  color: string;
  name?: string;
  hex?: string;
  price?: number | null;
  mrp?: number | null;
  discount_percent?: number | null;
  image_urls?: string[];
  image_url?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  mrp: number | null;
  discount_percent?: number | null; // read-only from DB
  unit: string;
  stock_quantity: number;
  in_stock: boolean;
  image_urls: string[];
  rating_avg?: number | null;
  rating_count?: number | null;
  delivery_minutes: number;
  description: string;
  specifications: Record<string, string>;
  faqs: Array<{ q: string; a: string }>;
  tags: string[];
  colors?: string[] | null;
  color_variants?: ColorVariant[] | null;
  is_emergency: boolean;
  is_best_seller: boolean;
  created_at?: string;
  updated_at?: string;
}

// Payload for insert & update - strictly excludes id and discount_percent
export interface ProductFormData {
  name: string;
  brand: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  mrp: number | null;
  unit: string;
  stock_quantity: number;
  in_stock: boolean;
  image_urls: string[];
  delivery_minutes: number;
  description: string;
  specifications: Record<string, string>;
  faqs: Array<{ q: string; a: string }>;
  tags: string[];
  colors?: string[];
  color_variants?: ColorVariant[];
  is_emergency: boolean;
  is_best_seller: boolean;
}

export type TechnicianSector =
  | 'Electrician'
  | 'Plumber'
  | 'HVAC Technician'
  | 'Carpenter'
  | 'Mason'
  | 'Painter'
  | 'Appliance Repair'
  | 'Security & CCTV'
  | 'Solar & Inverter'
  | 'General Maintenance';

export type TechnicianStatus = 'available' | 'busy' | 'offline';
export type VerificationStatus = 'verified' | 'pending' | 'under_review' | 'rejected';

export interface Technician {
  id: string;
  name: string;
  title: string;
  badge_id?: string | null;
  experience_years: number;
  primary_sector: string;
  sub_sectors?: string[];
  photo?: string | null;
  rating?: number;
  reviews_count?: number;
  completed_jobs?: number;
  verification_status: VerificationStatus;
  license_number?: string | null;
  issuing_authority?: string | null;
  status: TechnicianStatus;
  status_text?: string | null;
  phone: string;
  email?: string | null;
  whatsapp?: string | null;
  emergency_support: boolean;
  service_areas?: string[];
  working_hours?: string | null;
  starting_rate: number;
  rate_unit?: string | null;
  about?: string;
  ai_description?: string | null;
  certifications?: string[];
  skills?: string[];
  tools_carried?: string[];
  recent_reviews?: any[];
  joined_date?: string | null;
  featured: boolean;
  created_at?: string;
}

export interface TechnicianFormData {
  name: string;
  title: string;
  badge_id: string | null;
  experience_years: number;
  primary_sector: string;
  sub_sectors: string[];
  photo: string | null;
  rating: number;
  reviews_count: number;
  completed_jobs: number;
  verification_status: VerificationStatus;
  license_number: string | null;
  issuing_authority: string | null;
  status: TechnicianStatus;
  status_text: string | null;
  phone: string;
  email: string | null;
  whatsapp: string | null;
  emergency_support: boolean;
  service_areas: string[];
  working_hours: string | null;
  starting_rate: number;
  rate_unit: string | null;
  about: string;
  ai_description: string | null;
  certifications: string[];
  skills: string[];
  tools_carried: string[];
  featured: boolean;
}

export interface SpecificationItem {
  id: string;
  key: string;
  value: string;
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role?: string;
}

export type AdminCheck =
  | { kind: 'admin' }
  | { kind: 'not_admin' }
  | { kind: 'error'; message: string };

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
