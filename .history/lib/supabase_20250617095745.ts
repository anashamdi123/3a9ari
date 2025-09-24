import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

// Types based on our database schema
export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number;
  price_unit?:'tnd' | 'tnd/m²'|'tnd/hectare';
  location: string;
  size: number;
  size_unit?: 'm²' | 'hectare';
  phone_number: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  category: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}