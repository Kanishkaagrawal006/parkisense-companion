import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { getAllPatients, getPatientTestResults, PatientData, TestResult } from '@/lib/firestore';
import { 
  LogOut, 
  Users, 
  Search, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Hand,
  Mic,
  PenTool,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useFirebaseAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [selectedPatientTests, setSelectedPatientTests] = useState<TestResult[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/doctor/auth');
      return;
    }

    if (user && user.role !== 'doctor') {
      navigate('/');
      return;
    }

    if (user) {
      loadPatients();
    }
  }, [user, authLoading]);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      const data = await getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePatientSelect = async (patient: PatientData) => {
    if (selectedPatient?.id === patient.id) {
      setSelectedPatient(null);
      setSelectedPatientTests([]);
      return;
    }

    setSelectedPatient(patient);
    setLoadingTests(true);
    
    try {
      const tests = await getPatientTestResults(patient.id);
      setSelectedPatientTests(tests);
    } catch (error) {
      console.error('Error loading patient tests:', error);
    } finally {
      setLoadingTests(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalTests = patients.reduce((sum, p) => sum + (p.testCount || 0), 0);
  const recentPatients = patients.filter(p => {
    if (!p.lastTestDate) return false;
    const daysDiff = (Date.now() - p.lastTestDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  }).length;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                <p className="text-2xl font-bold text-foreground">{patients.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-3xl p-6 shadow-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-success-light flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Tests</p>
                <p className="text-2xl font-bold text-foreground">{totalTests}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-3xl p-6 shadow-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-warning-light flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Active This Week</p>
                <p className="text-2xl font-bold text-foreground">{recentPatients}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-3xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Registered Patients</h2>
                  <Button variant="ghost" size="icon" onClick={loadPatients}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
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
              
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {filteredPatients.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {patients.length === 0 
                        ? "No patients registered yet. Patients will appear here once they sign up." 
                        : "No patients match your search."}
                    </p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      className={`w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors text-left ${
                        selectedPatient?.id === patient.id ? 'bg-primary-light' : ''
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
                          {patient.testCount === 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {patient.age ? `Age: ${patient.age} • ` : ''}{patient.testCount || 0} tests
                          {patient.lastTestDate && ` • Last: ${format(patient.lastTestDate, 'MMM d')}`}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Patient Details / Quick View */}
          <div className="lg:col-span-1">
            {selectedPatient ? (
              <PatientDetails 
                patient={selectedPatient}
                tests={selectedPatientTests}
                isLoading={loadingTests}
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
const PatientDetails = ({ 
  patient, 
  tests,
  isLoading 
}: { 
  patient: PatientData;
  tests: TestResult[];
  isLoading: boolean;
}) => {
  // Calculate stats by test type
  const getLatestTest = (type: 'tapping' | 'speech' | 'spiral') => {
    const typeTests = tests.filter(t => t.testType === type);
    if (typeTests.length === 0) return null;
    return typeTests[0];
  };

  const getTrend = (type: 'tapping' | 'speech' | 'spiral') => {
    const typeTests = tests.filter(t => t.testType === type);
    if (typeTests.length < 2) return 'stable';
    const latest = typeTests[0].score;
    const previous = typeTests[1].score;
    if (latest > previous * 1.05) return 'up';
    if (latest < previous * 0.95) return 'down';
    return 'stable';
  };

  const tappingTest = getLatestTest('tapping');
  const speechTest = getLatestTest('speech');
  const spiralTest = getLatestTest('spiral');

  return (
    <div className="bg-card rounded-3xl shadow-card overflow-hidden animate-fade-in">
      <div className="p-6 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold">
            {patient.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <h3 className="text-xl font-bold">{patient.name}</h3>
        <p className="text-primary-foreground/80">
          {patient.age ? `Age: ${patient.age} years` : patient.email}
        </p>
        {patient.phone && (
          <p className="text-primary-foreground/60 text-sm">{patient.phone}</p>
        )}
      </div>

      <div className="p-6 space-y-4">
        <h4 className="font-semibold text-foreground">Latest Test Results</h4>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : tests.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No tests completed yet
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                <Hand className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Tapping Test</p>
                <p className="text-xs text-muted-foreground">
                  {tappingTest ? format(tappingTest.createdAt!, 'MMM d') : 'Not taken'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {getTrend('tapping') === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
                {getTrend('tapping') === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
                <span className="text-lg font-bold text-primary">
                  {tappingTest?.score || '--'}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center">
                <Mic className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Speech Test</p>
                <p className="text-xs text-muted-foreground">
                  {speechTest ? format(speechTest.createdAt!, 'MMM d') : 'Not taken'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {getTrend('speech') === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
                {getTrend('speech') === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
                <span className="text-lg font-bold text-success">
                  {speechTest?.score || '--'}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-warning-light flex items-center justify-center">
                <PenTool className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Spiral Drawing</p>
                <p className="text-xs text-muted-foreground">
                  {spiralTest ? format(spiralTest.createdAt!, 'MMM d') : 'Not taken'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {getTrend('spiral') === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
                {getTrend('spiral') === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
                <span className="text-lg font-bold text-warning">
                  {spiralTest?.score || '--'}%
                </span>
              </div>
            </div>
          </div>
        )}

        {tests.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground mb-3">Test History</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tests.slice(0, 10).map((test) => (
                <div key={test.id} className="flex items-center justify-between text-sm py-1">
                  <div className="flex items-center gap-2">
                    {test.testType === 'tapping' && <Hand className="w-3 h-3 text-primary" />}
                    {test.testType === 'speech' && <Mic className="w-3 h-3 text-success" />}
                    {test.testType === 'spiral' && <PenTool className="w-3 h-3 text-warning" />}
                    <span className="text-muted-foreground capitalize">{test.testType}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {test.createdAt && format(test.createdAt, 'MMM d, h:mm a')}
                    </span>
                    <span className="font-medium">{test.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
