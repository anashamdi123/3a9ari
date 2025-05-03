-- Create custom types
CREATE TYPE property_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE property_type AS ENUM ('apartment', 'villa', 'land', 'commercial');

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create properties table
CREATE TABLE public.properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL, -- 'apartment', 'villa', 'land'
    size NUMERIC NOT NULL,
    location TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    phone_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create favorites table
CREATE TABLE public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    property_id UUID REFERENCES public.properties(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, property_id)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Basic security policies
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable update for users based on id" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read access for all properties" ON public.properties FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Enable update for property owners" ON public.properties FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Enable delete for property owners" ON public.properties FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Enable read access for user's favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for authenticated users" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable delete for users" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.email
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 