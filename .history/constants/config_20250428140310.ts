// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate Supabase configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };

// App configuration
export const APP_NAME = '3a9ari';
export const CURRENCY = 'ريال';
export const AREA_UNIT = 'متر مربع';