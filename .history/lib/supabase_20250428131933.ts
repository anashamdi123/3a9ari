import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/constants/config';

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types based on our database schema
export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  size: number;
  phone_number: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}