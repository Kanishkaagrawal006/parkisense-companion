import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { ArrowLeft, Mail, Lock, User, Stethoscope } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DoctorAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    login({
      id: '2',
      name: isLogin ? 'Dr. Smith' : formData.fullName,
      role: 'doctor',
      email: formData.email,
    });
    navigate('/doctor/dashboard');
  };

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
              disabled={!formData.email || !formData.password}
            >
              {isLogin ? 'Login' : 'Create Account'}
            </Button>

            <div className="text-center pt-4">
              <button
                className="text-primary font-medium text-lg"
                onClick={() => setIsLogin(!isLogin)}
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
