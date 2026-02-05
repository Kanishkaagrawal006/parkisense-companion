import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { ArrowLeft, Phone, User, Calendar, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const PatientAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    age: '',
    gender: '',
  });
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendOtp = () => {
    setShowOtp(true);
  };

  const handleVerifyOtp = () => {
    if (otp !== '123456') {
      return; // Invalid OTP
    }
    login({
      id: '1',
      name: isLogin ? 'Patient User' : formData.fullName,
      role: 'patient',
      phone: formData.phone,
      age: parseInt(formData.age) || undefined,
      gender: formData.gender,
    });
    navigate('/patient/dashboard');
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
            <CardTitle className="text-2xl">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </CardTitle>
            <CardDescription className="text-base">
              {isLogin 
                ? 'Enter your phone number to continue' 
                : 'We need a few details to get started'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-4">
            {!isLogin && !showOtp && (
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
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={showOtp}
              />
            </div>

            {showOtp && (
              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="otp" className="text-base font-medium">
                  Enter OTP sent to your phone
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em]"
                />
                <div className="bg-primary-light border border-primary/20 rounded-xl p-3 text-center">
                  <p className="text-primary font-medium">Demo OTP: 123456</p>
                </div>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Didn't receive? <button className="text-primary font-medium">Resend OTP</button>
                </p>
              </div>
            )}

            <Button
              size="lg"
              className="w-full mt-6"
              onClick={showOtp ? handleVerifyOtp : handleSendOtp}
              disabled={!formData.phone || (!isLogin && !showOtp && !formData.fullName)}
            >
              {showOtp ? 'Verify & Continue' : 'Send OTP'}
            </Button>

            <div className="text-center pt-4">
              <button
                className="text-primary font-medium text-lg"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setShowOtp(false);
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
