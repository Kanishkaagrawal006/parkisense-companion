import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { ArrowLeft, Mail, Lock, User, Stethoscope, Loader2 } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';

const DoctorAuth = () => {
  const navigate = useNavigate();
  const { signUpDoctor, loginDoctor } = useFirebaseAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    // Validate passwords match for signup
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await loginDoctor(formData.email, formData.password);
        if (error) {
          toast({
            title: "Login Failed",
            description: error,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        toast({
          title: "Welcome back, Doctor! 👨‍⚕️",
          description: "Successfully logged in.",
        });
      } else {
        const { error } = await signUpDoctor(formData.email, formData.password, formData.fullName);
        if (error) {
          toast({
            title: "Registration Failed",
            description: error,
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        toast({
          title: "Account Created! 🎉",
          description: "Welcome to ParkiSense.",
        });
      }
      navigate('/doctor/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = isLogin 
    ? formData.email && formData.password
    : formData.email && formData.password && formData.fullName && formData.confirmPassword;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Logo size="sm" />
      </div>

      <div className="max-w-md mx-auto animate-fade-in">
        <Card className="border-0 shadow-card">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isLogin ? 'Doctor Login' : 'Doctor Registration'}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin 
                ? 'Access your patient dashboard' 
                : 'Create your professional account'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Dr. John Smith"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="doctor@hospital.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {!isLogin && (
                <p className="text-sm text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <Button
              size="lg"
              className="w-full mt-6"
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </Button>

            <div className="text-center pt-4">
              <button
                className="text-primary font-medium text-lg"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({
                    fullName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                  });
                }}
              >
                {isLogin ? "New doctor? Register here" : "Already registered? Login"}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground mt-6 text-sm">
          Secure access for healthcare professionals 🏥
        </p>
      </div>
    </div>
  );
};

export default DoctorAuth;
