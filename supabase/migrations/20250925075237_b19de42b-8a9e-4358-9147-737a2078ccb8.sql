-- Create user profiles table with farm details
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL UNIQUE,
  survey_number TEXT,
  farm_area DECIMAL(10,2) NOT NULL, -- in acres
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create yield predictions table
CREATE TABLE public.yield_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  soil_data JSONB NOT NULL,
  predicted_yield DECIMAL(10,2) NOT NULL,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for yield predictions
ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for yield predictions
CREATE POLICY "Users can view their own predictions" 
ON public.yield_predictions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions" 
ON public.yield_predictions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create crop recommendations table
CREATE TABLE public.crop_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommended_crops TEXT[] NOT NULL,
  fertilizer_info JSONB NOT NULL,
  pest_disease_info JSONB NOT NULL,
  weather_data JSONB NOT NULL,
  farm_area DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for crop recommendations
ALTER TABLE public.crop_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for crop recommendations
CREATE POLICY "Users can view their own recommendations" 
ON public.crop_recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations" 
ON public.crop_recommendations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for soil report uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('soil-reports', 'soil-reports', false);

-- Create storage policies for soil reports
CREATE POLICY "Users can view their own soil reports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'soil-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own soil reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'soil-reports' AND auth.uid()::text = (storage.foldername(name))[1]);