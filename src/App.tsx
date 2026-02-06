import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseAuthProvider } from "@/contexts/FirebaseAuthContext";
import { MedicationProvider } from "@/contexts/MedicationContext";

// Pages
import Welcome from "./pages/Welcome";
import PatientAuth from "./pages/patient/PatientAuth";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientProgress from "./pages/patient/PatientProgress";
import TappingTest from "./pages/patient/tests/TappingTest";
import SpeechTest from "./pages/patient/tests/SpeechTest";
import SpiralTest from "./pages/patient/tests/SpiralTest";
import DoctorAuth from "./pages/doctor/DoctorAuth";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseAuthProvider>
      <MedicationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Welcome / Landing */}
              <Route path="/" element={<Welcome />} />
              
              {/* Patient Routes */}
              <Route path="/patient/auth" element={<PatientAuth />} />
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/progress" element={<PatientProgress />} />
              <Route path="/patient/test/tapping" element={<TappingTest />} />
              <Route path="/patient/test/speech" element={<SpeechTest />} />
              <Route path="/patient/test/spiral" element={<SpiralTest />} />
              
              {/* Doctor Routes */}
              <Route path="/doctor/auth" element={<DoctorAuth />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MedicationProvider>
    </FirebaseAuthProvider>
  </QueryClientProvider>
);

export default App;
