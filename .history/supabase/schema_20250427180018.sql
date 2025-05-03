-- Create custom types
CREATE TYPE property_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE property_type AS ENUM ('apartment', 'villa', 'land', 'commercial');

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create properties table
CREATE TABLE public.properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    property_type property_type NOT NULL,
    size DECIMAL(10,2) NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    location TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    address TEXT,
    images TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    status property_status DEFAULT 'pending',
    phone_number TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create favorites table
CREATE TABLE public.favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    property_id UUID REFERENCES public.properties(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, property_id)
);

-- Create Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Properties are viewable by everyone" 
    ON public.properties FOR SELECT 
    USING (true);

CREATE POLICY "Users can create properties" 
    ON public.properties FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own properties" 
    ON public.properties FOR UPDATE 
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own properties" 
    ON public.properties FOR DELETE 
    USING (auth.uid() = owner_id);

-- Favorites policies
CREATE POLICY "Users can view their own favorites" 
    ON public.favorites FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add to favorites" 
    ON public.favorites FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from favorites" 
    ON public.favorites FOR DELETE 
    USING (auth.uid() = user_id);

-- Create functions and triggers
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

-- Trigger for new user creation
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