import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { getAllPatients, getPatientTestResults, getPatientMedicationLogs, getMedicationAdherence, PatientData, TestResult } from '@/lib/firestore';
import { downloadPatientReport } from '@/lib/generatePdf';
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
  RefreshCw,
  Download,
  Pill,
  AlertTriangle,
  CheckCircle2,
  Minus,
} from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DEMO_PATIENT, getTrendLabel } from '@/lib/demoData';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useFirebaseAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [selectedPatientTests, setSelectedPatientTests] = useState<TestResult[]>([]);
  const [selectedPatientAdherence, setSelectedPatientAdherence] = useState<{ taken: number; total: number; rate: number }>({ taken: 0, total: 0, rate: 0 });
  const [loadingTests, setLoadingTests] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState<'weekly' | 'monthly' | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/doctor/auth');
      return;
    }
    if (user && user.role !== 'doctor') {
      navigate('/');
      return;
    }
    if (user) loadPatients();
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
      const [tests, adherence] = await Promise.all([
        getPatientTestResults(patient.id),
        getMedicationAdherence(patient.id, 7),
      ]);
      setSelectedPatientTests(tests);
      setSelectedPatientAdherence({ taken: adherence.totalTaken, total: adherence.totalScheduled, rate: Math.round(adherence.adherenceRate) });
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoadingTests(false);
    }
  };

  const handleDownloadPdf = async (period: 'weekly' | 'monthly') => {
    if (!selectedPatient) return;
    setDownloadingPdf(period);
    try {
      const days = period === 'weekly' ? 7 : 30;
      const [tests, meds, adherence] = await Promise.all([
        getPatientTestResults(selectedPatient.id),
        getPatientMedicationLogs(selectedPatient.id),
        getMedicationAdherence(selectedPatient.id, days),
      ]);

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const filteredTests = tests.filter(t => t.createdAt && t.createdAt >= cutoff);

      downloadPatientReport({
        patient: {
          name: selectedPatient.name,
          age: selectedPatient.age,
          email: selectedPatient.email,
          phone: selectedPatient.phone,
        },
        testResults: filteredTests,
        medicationAdherence: { taken: adherence.totalTaken, total: adherence.totalScheduled, rate: Math.round(adherence.adherenceRate) },
        period,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloadingPdf(null);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                        ? "No patients registered yet." 
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
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">New</span>
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

          {/* Patient Details */}
          <div className="lg:col-span-1">
            {selectedPatient ? (
              <PatientDetails 
                patient={selectedPatient}
                tests={selectedPatientTests}
                adherence={selectedPatientAdherence}
                isLoading={loadingTests}
                onDownloadPdf={handleDownloadPdf}
                downloadingPdf={downloadingPdf}
              />
            ) : (
              <div className="bg-card rounded-3xl p-6 shadow-card text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Select a patient to view their details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Demo Patient Monitoring Section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-foreground mb-4">📊 Demo Patient Monitoring — {DEMO_PATIENT.name}</h2>
          <p className="text-sm text-muted-foreground mb-6">Static demo data showing weekly test trends over 6 weeks. This section will be replaced with live Firebase data in production.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Combined Line Chart */}
            <div className="bg-card rounded-3xl p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">All Tests — Weekly Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={DEMO_PATIENT.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="tapping_score" name="Tapping" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="speech_score" name="Speech" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="spiral_score" name="Spiral" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart comparison */}
            <div className="bg-card rounded-3xl p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Score Comparison per Week</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEMO_PATIENT.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                    <Legend />
                    <Bar dataKey="tapping_score" name="Tapping" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="speech_score" name="Speech" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spiral_score" name="Spiral" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Trend Summary */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {([
              { name: 'Tapping', scores: DEMO_PATIENT.weeklyData.map(d => d.tapping_score), icon: Hand, color: 'text-primary' },
              { name: 'Speech', scores: DEMO_PATIENT.weeklyData.map(d => d.speech_score), icon: Mic, color: 'text-success' },
              { name: 'Spiral', scores: DEMO_PATIENT.weeklyData.map(d => d.spiral_score), icon: PenTool, color: 'text-warning' },
            ]).map(t => {
              const trend = getTrendLabel(t.scores);
              return (
                <div key={t.name} className="bg-card rounded-2xl p-4 shadow-card text-center">
                  <t.icon className={`w-6 h-6 mx-auto mb-2 ${t.color}`} />
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className={`text-xs font-semibold mt-1 ${trend === 'Improving' ? 'text-success' : trend === 'Deteriorating' ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {trend}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

const PatientDetails = ({ 
  patient, 
  tests,
  adherence,
  isLoading,
  onDownloadPdf,
  downloadingPdf,
}: { 
  patient: PatientData;
  tests: TestResult[];
  adherence: { taken: number; total: number; rate: number };
  isLoading: boolean;
  onDownloadPdf: (period: 'weekly' | 'monthly') => void;
  downloadingPdf: 'weekly' | 'monthly' | null;
}) => {
  const getLatestTest = (type: 'tapping' | 'speech' | 'spiral') => {
    return tests.filter(t => t.testType === type)[0] || null;
  };

  const getTrend = (type: 'tapping' | 'speech' | 'spiral'): 'up' | 'down' | 'stable' => {
    const typeTests = tests.filter(t => t.testType === type);
    if (typeTests.length < 2) return 'stable';
    const latest = typeTests[0].score;
    const previous = typeTests[1].score;
    if (latest > previous * 1.05) return 'up';
    if (latest < previous * 0.95) return 'down';
    return 'stable';
  };

  // Overall health assessment
  const getOverallStatus = () => {
    const trends = (['tapping', 'speech', 'spiral'] as const).map(t => getTrend(t));
    const declining = trends.filter(t => t === 'down').length;
    const improving = trends.filter(t => t === 'up').length;

    if (declining >= 2) return { status: 'declining', label: 'Needs Attention', color: 'text-destructive', icon: AlertTriangle, bg: 'bg-destructive/10' };
    if (improving >= 2) return { status: 'improving', label: 'Improving', color: 'text-success', icon: CheckCircle2, bg: 'bg-success/10' };
    return { status: 'stable', label: 'Stable', color: 'text-muted-foreground', icon: Minus, bg: 'bg-muted' };
  };

  const tappingTest = getLatestTest('tapping');
  const speechTest = getLatestTest('speech');
  const spiralTest = getLatestTest('spiral');
  const overallStatus = getOverallStatus();

  return (
    <div className="bg-card rounded-3xl shadow-card overflow-hidden animate-fade-in">
      {/* Patient header */}
      <div className="p-6 bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold">{patient.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <h3 className="text-xl font-bold">{patient.name}</h3>
        <p className="text-primary-foreground/80">
          {patient.age ? `Age: ${patient.age} years` : patient.email}
        </p>
        {patient.phone && <p className="text-primary-foreground/60 text-sm">{patient.phone}</p>}
      </div>

      <div className="p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Overall Status */}
            {tests.length >= 2 && (
              <div className={`flex items-center gap-3 p-3 rounded-xl ${overallStatus.bg}`}>
                <overallStatus.icon className={`w-5 h-5 ${overallStatus.color}`} />
                <div>
                  <p className={`font-semibold text-sm ${overallStatus.color}`}>{overallStatus.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {overallStatus.status === 'declining' 
                      ? 'Multiple test scores are declining. Consider a check-in.'
                      : overallStatus.status === 'improving'
                      ? 'Patient shows improvement across tests.'
                      : 'Scores are relatively stable.'}
                  </p>
                </div>
              </div>
            )}

            {/* Medication Adherence */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center">
                <Pill className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Medication Adherence</p>
                <p className="text-xs text-muted-foreground">
                  {adherence.total > 0 ? `${adherence.taken}/${adherence.total} doses (7 days)` : 'No data'}
                </p>
              </div>
              <span className={`text-lg font-bold ${adherence.rate >= 80 ? 'text-success' : adherence.rate >= 50 ? 'text-warning' : 'text-destructive'}`}>
                {adherence.total > 0 ? `${adherence.rate}%` : '--'}
              </span>
            </div>

            {/* Test Results */}
            <h4 className="font-semibold text-foreground">Latest Test Results</h4>
            {tests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No tests completed yet</p>
            ) : (
              <div className="space-y-3">
                {([
                  { type: 'tapping' as const, test: tappingTest, icon: Hand, color: 'text-primary', bg: 'bg-primary-light' },
                  { type: 'speech' as const, test: speechTest, icon: Mic, color: 'text-success', bg: 'bg-success-light' },
                  { type: 'spiral' as const, test: spiralTest, icon: PenTool, color: 'text-warning', bg: 'bg-warning-light' },
                ]).map(({ type, test, icon: Icon, color, bg }) => (
                  <div key={type} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm capitalize">{type} Test</p>
                      <p className="text-xs text-muted-foreground">
                        {test ? format(test.createdAt!, 'MMM d') : 'Not taken'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrend(type) === 'up' && <TrendingUp className="w-4 h-4 text-success" />}
                      {getTrend(type) === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
                      <span className={`text-lg font-bold ${color}`}>{test?.score || '--'}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PDF Download Buttons */}
            <div className="pt-4 border-t border-border space-y-2">
              <h4 className="font-semibold text-foreground text-sm">Download Reports</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadPdf('weekly')}
                  disabled={downloadingPdf !== null}
                  className="text-xs"
                >
                  {downloadingPdf === 'weekly' ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Download className="w-3 h-3 mr-1" />}
                  Weekly PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadPdf('monthly')}
                  disabled={downloadingPdf !== null}
                  className="text-xs"
                >
                  {downloadingPdf === 'monthly' ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Download className="w-3 h-3 mr-1" />}
                  Monthly PDF
                </Button>
              </div>
            </div>

            {/* Test History */}
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
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
