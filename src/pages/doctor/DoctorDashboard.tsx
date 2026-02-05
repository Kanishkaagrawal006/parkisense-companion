import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogOut, 
  Users, 
  Search, 
  ChevronRight,
  TrendingUp,
  Calendar,
  Hand,
  Mic,
  PenTool
} from 'lucide-react';

// Mock patient data
const mockPatients = [
  { id: '1', name: 'John Smith', age: 68, lastTest: '2024-01-15', testsCompleted: 5, status: 'stable' },
  { id: '2', name: 'Mary Johnson', age: 72, lastTest: '2024-01-14', testsCompleted: 8, status: 'attention' },
  { id: '3', name: 'Robert Williams', age: 65, lastTest: '2024-01-13', testsCompleted: 3, status: 'new' },
  { id: '4', name: 'Patricia Brown', age: 70, lastTest: '2024-01-12', testsCompleted: 12, status: 'stable' },
  { id: '5', name: 'James Davis', age: 75, lastTest: '2024-01-10', testsCompleted: 6, status: 'attention' },
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attention': return 'bg-warning text-warning-foreground';
      case 'new': return 'bg-primary text-primary-foreground';
      default: return 'bg-success text-success-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'attention': return 'Needs Attention';
      case 'new': return 'New Patient';
      default: return 'Stable';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-soft px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground hidden sm:block">
              Welcome, Dr. {user?.name?.split(' ').pop() || 'Doctor'}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 max-w-6xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-3xl p-6 shadow-card animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Patients</p>
                <p className="text-2xl font-bold text-foreground">{mockPatients.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-3xl p-6 shadow-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-success-light flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Tests This Week</p>
                <p className="text-2xl font-bold text-foreground">34</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-3xl p-6 shadow-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-warning-light flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Need Review</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-3xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground mb-4">Registered Patients</h2>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-input bg-background text-base focus:outline-none focus:border-primary transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="divide-y divide-border">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient.id === selectedPatient ? null : patient.id)}
                    className={`w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors text-left ${
                      selectedPatient === patient.id ? 'bg-primary-light' : ''
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-muted-foreground">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{patient.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(patient.status)}`}>
                          {getStatusLabel(patient.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Age: {patient.age} • {patient.testsCompleted} tests completed
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Patient Details / Quick View */}
          <div className="lg:col-span-1">
            {selectedPatient ? (
              <PatientDetails 
                patient={mockPatients.find(p => p.id === selectedPatient)!} 
              />
            ) : (
              <div className="bg-card rounded-3xl p-6 shadow-card text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Select a patient to view their test results and history
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Patient Details Component
const PatientDetails = ({ patient }: { patient: typeof mockPatients[0] }) => {
  // Mock test results
  const testResults = {
    tapping: { score: 78, trend: 'up', lastValue: 45 },
    speech: { score: 85, trend: 'stable', lastValue: 82 },
    spiral: { score: 72, trend: 'down', lastValue: 78 },
  };

  return (
    <div className="bg-card rounded-3xl shadow-card overflow-hidden animate-fade-in">
      <div className="p-6 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold">
            {patient.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <h3 className="text-xl font-bold">{patient.name}</h3>
        <p className="text-primary-foreground/80">Age: {patient.age} years</p>
      </div>

      <div className="p-6 space-y-4">
        <h4 className="font-semibold text-foreground">Latest Test Results</h4>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
              <Hand className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">Tapping Test</p>
              <p className="text-xs text-muted-foreground">{testResults.tapping.lastValue} taps/10s</p>
            </div>
            <span className="text-lg font-bold text-primary">{testResults.tapping.score}%</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center">
              <Mic className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">Speech Test</p>
              <p className="text-xs text-muted-foreground">Good clarity</p>
            </div>
            <span className="text-lg font-bold text-success">{testResults.speech.score}%</span>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-warning-light flex items-center justify-center">
              <PenTool className="w-5 h-5 text-warning" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">Spiral Drawing</p>
              <p className="text-xs text-muted-foreground">Minor tremor detected</p>
            </div>
            <span className="text-lg font-bold text-warning">{testResults.spiral.score}%</span>
          </div>
        </div>

        <Button variant="outline" className="w-full mt-4">
          View Full History
        </Button>
      </div>
    </div>
  );
};

export default DoctorDashboard;
