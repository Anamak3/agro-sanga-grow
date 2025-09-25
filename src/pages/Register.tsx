import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, User, Smartphone, Lock, FileText, MapPin, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .trim(),
  mobileNumber: z.string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits")
    .regex(/^[0-9]+$/, "Mobile number must contain only numbers"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),
  surveyNumber: z.string().optional(),
  farmArea: z.string()
    .min(1, "Farm area is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Farm area must be a positive number")
});

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    password: '',
    surveyNumber: '',
    farmArea: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    try {
      registerSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Create email from mobile number for Supabase auth
    const email = `${formData.mobileNumber}@agrosanga.local`;

    const { error } = await signUp(email, formData.password, {
      name: formData.name.trim(),
      mobileNumber: formData.mobileNumber,
      surveyNumber: formData.surveyNumber.trim() || null,
      farmArea: formData.farmArea
    });
    
    if (!error) {
      navigate('/login');
    }
  };

  const isFormValid = 
    formData.name.trim().length >= 2 && 
    formData.mobileNumber.length === 10 && 
    formData.password.length >= 6 && 
    parseFloat(formData.farmArea) > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        <Card className="card-natural">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
              <span className="text-3xl">🌱</span>
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Join AgroSanga</CardTitle>
            <CardDescription>
              Create your account to access AI-powered farming insights and recommendations
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="text-sm font-medium">
                  Mobile Number *
                </Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={formData.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      handleChange('mobileNumber', value);
                    }}
                    className="pl-10"
                    maxLength={10}
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="text-sm text-destructive">{errors.mobileNumber}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 6 chars)"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Survey Number */}
              <div className="space-y-2">
                <Label htmlFor="surveyNumber" className="text-sm font-medium">
                  Survey Number <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="surveyNumber"
                    type="text"
                    placeholder="Enter survey number if available"
                    value={formData.surveyNumber}
                    onChange={(e) => handleChange('surveyNumber', e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.surveyNumber && (
                  <p className="text-sm text-destructive">{errors.surveyNumber}</p>
                )}
              </div>

              {/* Farm Area */}
              <div className="space-y-2">
                <Label htmlFor="farmArea" className="text-sm font-medium">
                  Farm Area (in acres) *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="farmArea"
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="Enter farm area in acres"
                    value={formData.farmArea}
                    onChange={(e) => handleChange('farmArea', e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.farmArea && (
                  <p className="text-sm text-destructive">{errors.farmArea}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full btn-agriculture" 
                disabled={!isFormValid || loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;