import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { ArrowLeft, Phone, User, Calendar, UserCircle, Mail, Lock, Loader2 } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';

const PatientAuth = () => {
  const navigate = useNavigate();
  const { signUpPatient, loginPatient, isLoading: authLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    gender: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await loginPatient(formData.email, formData.password);
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
          title: "Welcome back! 👋",
          description: "Successfully logged in.",
        });
      } else {
        const { error } = await signUpPatient(formData.email, formData.password, {
          name: formData.fullName,
          phone: formData.phone,
          age: parseInt(formData.age) || undefined,
          gender: formData.gender,
          email: formData.email,
        });
        if (error) {
          toast({
            title: "Sign Up Failed",
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
      navigate('/patient/dashboard');
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
    : formData.email && formData.password && formData.fullName;

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
            <CardTitle className="text-2xl">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin 
                ? 'Enter your credentials to continue' 
                : 'We need a few details to get started'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-base font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-base font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Age
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-base font-medium flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-muted-foreground" />
                      Gender
                    </Label>
                    <select
                      id="gender"
                      name="gender"
                      className="flex h-14 w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-lg focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </>
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
                placeholder="Enter your email"
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
                    phone: '',
                    age: '',
                    gender: '',
                  });
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
