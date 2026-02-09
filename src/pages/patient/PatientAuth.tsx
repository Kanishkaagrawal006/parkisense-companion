import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { ArrowLeft, Mail, Lock, User, Calendar, Ruler, Weight, Loader2 } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';

const PatientAuth = () => {
  const navigate = useNavigate();
  const { signUpPatient, loginPatient } = useFirebaseAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    weight: '',
    height: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && !formData.fullName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await loginPatient(formData.email, formData.password);
        if (error) {
          toast({ title: "Login Failed", description: error, variant: "destructive" });
          setIsLoading(false);
          return;
        }
        toast({ title: "Welcome back! 👋", description: "Successfully logged in." });
      } else {
        const { error } = await signUpPatient(formData.email, formData.password, {
          name: formData.fullName.trim(),
          phone: formData.phone || undefined,
          age: parseInt(formData.age) || undefined,
          weight: parseFloat(formData.weight) || undefined,
          height: parseFloat(formData.height) || undefined,
        });
        if (error) {
          toast({ title: "Sign Up Failed", description: error, variant: "destructive" });
          setIsLoading(false);
          return;
        }
        toast({ title: "Account Created! 🎉", description: "Welcome to ParkiSense." });
      }
      navigate('/patient/dashboard');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = isLogin
    ? formData.email && formData.password
    : formData.email && formData.password && formData.fullName && formData.confirmPassword;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Logo size="sm" />
      </div>

      <div className="max-w-md mx-auto animate-fade-in">
        <Card className="border-0 shadow-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin ? 'Login to continue your health journey' : 'Register to start tracking your health'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Full Name *
                </Label>
                <Input id="fullName" name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleInputChange} maxLength={100} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Password
              </Label>
              <Input id="password" name="password" type="password" placeholder="Enter your password" value={formData.password} onChange={handleInputChange} />
              {!isLogin && <p className="text-sm text-muted-foreground">Password must be at least 6 characters</p>}
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-base font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Confirm Password
                  </Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-medium flex items-center gap-2">
                    Phone Number
                  </Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+91 1234567890" value={formData.phone} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-base font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Age (years)
                  </Label>
                  <Input id="age" name="age" type="number" placeholder="Enter your age" value={formData.age} onChange={handleInputChange} min={1} max={150} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-base font-medium flex items-center gap-2">
                      <Weight className="w-4 h-4 text-muted-foreground" />
                      Weight (kg)
                    </Label>
                    <Input id="weight" name="weight" type="number" placeholder="e.g., 70" value={formData.weight} onChange={handleInputChange} min={1} max={500} step="0.1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-base font-medium flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-muted-foreground" />
                      Height (cm)
                    </Label>
                    <Input id="height" name="height" type="number" placeholder="e.g., 170" value={formData.height} onChange={handleInputChange} min={30} max={300} step="0.1" />
                  </div>
                </div>
              </>
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
                  setFormData({ fullName: '', email: '', password: '', confirmPassword: '', phone: '', age: '', weight: '', height: '' });
                }}
              >
                {isLogin ? "New here? Create an account" : "Already have an account? Login"}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground mt-6 text-sm">
          Your data is safe and private with us 🔒
        </p>
      </div>
    </div>
  );
};

export default PatientAuth;
