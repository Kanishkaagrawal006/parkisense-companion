import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Logo from '@/components/Logo';
import { ArrowLeft, Phone, User, Calendar, Ruler, Weight, Loader2 } from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { ConfirmationResult } from 'firebase/auth';

type AuthStep = 'phone' | 'otp' | 'profile';

const PatientAuth = () => {
  const navigate = useNavigate();
  const { sendOTP, verifyOTPAndSignUp, verifyOTPAndLogin, isLoading: authLoading } = useFirebaseAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<AuthStep>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    age: '',
    weight: '',
    height: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatPhoneNumber = (phone: string) => {
    // Ensure phone number starts with country code
    if (!phone.startsWith('+')) {
      return `+91${phone}`; // Default to India, adjust as needed
    }
    return phone;
  };

  const handleSendOTP = async () => {
    if (!formData.phone) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formattedPhone = formatPhoneNumber(formData.phone);
    
    const { error, confirmationResult: result } = await sendOTP(formattedPhone, 'recaptcha-container');
    
    if (error) {
      toast({
        title: "Failed to send OTP",
        description: error,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (result) {
      setConfirmationResult(result);
      setStep('otp');
      toast({
        title: "OTP Sent! 📱",
        description: "Please check your phone for the verification code",
      });
    }
    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!confirmationResult || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    if (isLogin) {
      const { error } = await verifyOTPAndLogin(otp, confirmationResult);
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
      navigate('/patient/dashboard');
    } else {
      // For signup, proceed to profile step
      setStep('profile');
    }
    setIsLoading(false);
  };

  const handleCompleteSignup = async () => {
    if (!confirmationResult) return;

    // Validate inputs
    if (!formData.fullName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const { error } = await verifyOTPAndSignUp(otp, confirmationResult, {
      name: formData.fullName.trim(),
      phone: formatPhoneNumber(formData.phone),
      age: parseInt(formData.age) || undefined,
      weight: parseFloat(formData.weight) || undefined,
      height: parseFloat(formData.height) || undefined,
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
    navigate('/patient/dashboard');
    setIsLoading(false);
  };

  const resetForm = () => {
    setStep('phone');
    setOtp('');
    setConfirmationResult(null);
    setFormData({
      fullName: '',
      phone: '',
      age: '',
      weight: '',
      height: '',
    });
  };

  const renderPhoneStep = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-base font-medium flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          Phone Number
        </Label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 bg-muted rounded-l-xl border-2 border-r-0 border-input">
            <span className="text-muted-foreground">+91</span>
          </div>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone.replace('+91', '')}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="rounded-l-none"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          We'll send you a verification code
        </p>
      </div>

      <div id="recaptcha-container"></div>

      <Button
        size="lg"
        className="w-full mt-6"
        onClick={handleSendOTP}
        disabled={!formData.phone || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Sending OTP...
          </>
        ) : (
          'Send OTP'
        )}
      </Button>
    </>
  );

  const renderOTPStep = () => (
    <>
      <div className="space-y-4 text-center">
        <div className="space-y-2">
          <Label className="text-base font-medium">Enter Verification Code</Label>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to {formatPhoneNumber(formData.phone)}
          </p>
        </div>

        <div className="flex justify-center py-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          className="text-primary font-medium text-sm"
          onClick={() => {
            setStep('phone');
            setOtp('');
          }}
        >
          Change phone number
        </button>
      </div>

      <Button
        size="lg"
        className="w-full mt-6"
        onClick={handleVerifyOTP}
        disabled={otp.length !== 6 || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify OTP'
        )}
      </Button>
    </>
  );

  const renderProfileStep = () => (
    <>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-base font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Full Name *
          </Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleInputChange}
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age" className="text-base font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Age (years)
          </Label>
          <Input
            id="age"
            name="age"
            type="number"
            placeholder="Enter your age"
            value={formData.age}
            onChange={handleInputChange}
            min={1}
            max={150}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-base font-medium flex items-center gap-2">
              <Weight className="w-4 h-4 text-muted-foreground" />
              Weight (kg)
            </Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              placeholder="e.g., 70"
              value={formData.weight}
              onChange={handleInputChange}
              min={1}
              max={500}
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="text-base font-medium flex items-center gap-2">
              <Ruler className="w-4 h-4 text-muted-foreground" />
              Height (cm)
            </Label>
            <Input
              id="height"
              name="height"
              type="number"
              placeholder="e.g., 170"
              value={formData.height}
              onChange={handleInputChange}
              min={30}
              max={300}
              step="0.1"
            />
          </div>
        </div>
      </div>

      <Button
        size="lg"
        className="w-full mt-6"
        onClick={handleCompleteSignup}
        disabled={!formData.fullName.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>
    </>
  );

  const getStepTitle = () => {
    if (step === 'phone') return isLogin ? 'Welcome back!' : 'Create your account';
    if (step === 'otp') return 'Verify your phone';
    return 'Complete your profile';
  };

  const getStepDescription = () => {
    if (step === 'phone') return isLogin ? 'Enter your phone number to login' : 'We need your phone number to get started';
    if (step === 'otp') return 'Enter the code we sent to your phone';
    return 'Just a few more details';
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            if (step !== 'phone') {
              setStep('phone');
              setOtp('');
            } else {
              navigate('/');
            }
          }}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Logo size="sm" />
      </div>

      <div className="max-w-md mx-auto animate-fade-in">
        <Card className="border-0 shadow-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-base">
              {getStepDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-4">
            {step === 'phone' && renderPhoneStep()}
            {step === 'otp' && renderOTPStep()}
            {step === 'profile' && renderProfileStep()}

            {step === 'phone' && (
              <div className="text-center pt-4">
                <button
                  className="text-primary font-medium text-lg"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    resetForm();
                  }}
                >
                  {isLogin ? "New here? Create an account" : "Already have an account? Login"}
                </button>
              </div>
            )}
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