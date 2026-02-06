import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { getPatientTestResults, getPatientMedicationLogs, TestResult, MedicationLog } from '@/lib/firestore';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Hand, 
  Mic, 
  PenTool, 
  Pill,
  Calendar,
  Award,
  Activity,
  Loader2
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const PatientProgress = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useFirebaseAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'medication'>('overview');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/patient/auth');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [tests, meds] = await Promise.all([
        getPatientTestResults(user.id),
        getPatientMedicationLogs(user.id),
      ]);
      setTestResults(tests);
      setMedicationLogs(meds);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate test statistics
  const getTestStats = (testType: 'tapping' | 'speech' | 'spiral'): { 
    average: number; 
    trend: 'up' | 'down' | 'stable'; 
    count: number; 
    latest: number 
  } => {
    const tests = testResults.filter(t => t.testType === testType);
    if (tests.length === 0) return { average: 0, trend: 'stable' as const, count: 0, latest: 0 };

    const scores = tests.map(t => t.score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const latest = scores[0] || 0;
    
    // Calculate trend (compare last 3 to previous 3)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (tests.length >= 4) {
      const recent = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const previous = scores.slice(3, 6).reduce((a, b) => a + b, 0) / Math.min(3, scores.length - 3);
      if (recent > previous * 1.05) trend = 'up';
      else if (recent < previous * 0.95) trend = 'down';
    }

    return { average: Math.round(average), trend, count: tests.length, latest: Math.round(latest) };
  };

  // Calculate medication adherence
  const getMedicationStats = () => {
    const last7Days = medicationLogs.filter(log => {
      if (!log.createdAt) return false;
      const daysDiff = (Date.now() - log.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    const taken = last7Days.filter(log => log.taken).length;
    const total = last7Days.length;
    const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 0;

    return { taken, total, adherenceRate };
  };

  // Prepare chart data
  const getChartData = () => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const dayTests = testResults.filter(t => {
        if (!t.createdAt) return false;
        return t.createdAt >= dayStart && t.createdAt <= dayEnd;
      });

      const tappingScore = dayTests.find(t => t.testType === 'tapping')?.score || null;
      const speechScore = dayTests.find(t => t.testType === 'speech')?.score || null;
      const spiralScore = dayTests.find(t => t.testType === 'spiral')?.score || null;

      const dayMeds = medicationLogs.filter(m => {
        if (!m.createdAt) return false;
        return m.createdAt >= dayStart && m.createdAt <= dayEnd;
      });
      const medsTotal = dayMeds.length;
      const medsTaken = dayMeds.filter(m => m.taken).length;
      const adherence = medsTotal > 0 ? Math.round((medsTaken / medsTotal) * 100) : null;

      return {
        date: format(date, 'MMM d'),
        tapping: tappingScore,
        speech: speechScore,
        spiral: spiralScore,
        adherence,
      };
    });

    return last14Days;
  };

  const tappingStats = getTestStats('tapping');
  const speechStats = getTestStats('speech');
  const spiralStats = getTestStats('spiral');
  const medStats = getMedicationStats();
  const chartData = getChartData();

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">My Progress</h1>
            <p className="text-sm text-muted-foreground">Track your health journey</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 max-w-lg mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-muted/50 rounded-2xl p-1">
          {(['overview', 'tests', 'medication'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-card shadow-soft text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Overall Score Card */}
            <Card className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-primary-foreground/80 text-sm">Overall Health Score</p>
                    <p className="text-4xl font-bold">
                      {Math.round((tappingStats.average + speechStats.average + spiralStats.average) / 3) || '--'}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-primary-foreground/80">
                  Based on {tappingStats.count + speechStats.count + spiralStats.count} total tests
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-card">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Tests Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {testResults.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="w-4 h-4 text-success" />
                    <span className="text-sm text-muted-foreground">Med Adherence</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {medStats.adherenceRate}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Trend Chart */}
            {chartData.some(d => d.tapping || d.speech || d.spiral) && (
              <Card className="border-0 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }} 
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{ fontSize: 10 }} 
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="tapping" 
                          stroke="hsl(var(--primary))" 
                          fill="url(#colorScore)"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                          connectNulls
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-4 animate-fade-in">
            {/* Test Summary Cards */}
            {([
              { type: 'tapping' as const, name: 'Tapping Test', icon: Hand, stats: tappingStats, color: 'primary' },
              { type: 'speech' as const, name: 'Speech Test', icon: Mic, stats: speechStats, color: 'success' },
              { type: 'spiral' as const, name: 'Spiral Drawing', icon: PenTool, stats: spiralStats, color: 'warning' },
            ] as const).map((test) => (
              <Card key={test.type} className="border-0 shadow-card">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-${test.color}-light flex items-center justify-center`}>
                      <test.icon className={`w-7 h-7 text-${test.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{test.name}</h3>
                        {getTrendIcon(test.stats.trend)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {test.stats.count} tests completed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">
                        {test.stats.latest || '--'}
                      </p>
                      <p className="text-xs text-muted-foreground">Latest</p>
                    </div>
                  </div>
                  {test.stats.count > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Average Score</span>
                        <span className="font-medium">{test.stats.average}%</span>
                      </div>
                      <Progress value={test.stats.average} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Recent Test History */}
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Tests</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No tests completed yet. Start with a test from your dashboard!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {testResults.slice(0, 5).map((test) => (
                      <div key={test.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          {test.testType === 'tapping' && <Hand className="w-4 h-4 text-primary" />}
                          {test.testType === 'speech' && <Mic className="w-4 h-4 text-success" />}
                          {test.testType === 'spiral' && <PenTool className="w-4 h-4 text-warning" />}
                          <div>
                            <p className="font-medium text-sm capitalize">{test.testType} Test</p>
                            <p className="text-xs text-muted-foreground">
                              {test.createdAt ? format(test.createdAt, 'MMM d, yyyy h:mm a') : 'Unknown date'}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-foreground">{test.score}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'medication' && (
          <div className="space-y-4 animate-fade-in">
            {/* Adherence Overview */}
            <Card className="border-0 shadow-card bg-success-light">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full bg-white flex items-center justify-center mb-4 shadow-soft">
                    <span className="text-3xl font-bold text-success">{medStats.adherenceRate}%</span>
                  </div>
                  <h3 className="font-semibold text-foreground">Weekly Adherence Rate</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {medStats.taken} of {medStats.total} doses taken
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Adherence Chart */}
            {chartData.some(d => d.adherence !== null) && (
              <Card className="border-0 shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Daily Adherence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }} 
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{ fontSize: 10 }} 
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="adherence" 
                          stroke="hsl(var(--success))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--success))', strokeWidth: 0, r: 3 }}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medication History */}
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Recent Medication Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {medicationLogs.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No medication logs yet. Mark your medications as taken on your dashboard!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {medicationLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            log.taken ? 'bg-success-light' : 'bg-destructive/10'
                          }`}>
                            <Pill className={`w-4 h-4 ${log.taken ? 'text-success' : 'text-destructive'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{log.medicationName}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.scheduledTime ? format(log.scheduledTime, 'MMM d, h:mm a') : 'Unknown'}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${log.taken ? 'text-success' : 'text-destructive'}`}>
                          {log.taken ? 'Taken' : 'Missed'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Encouragement */}
        <div className="mt-8 text-center p-6 bg-primary-light rounded-3xl">
          <p className="text-primary font-semibold text-lg">
            💪 Keep up the great work! Every test helps track your progress.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PatientProgress;
