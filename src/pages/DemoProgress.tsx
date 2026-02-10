import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { DEMO_PATIENT, getTrendLabel, avg } from '@/lib/demoData';
import { ArrowLeft, Hand, Mic, PenTool, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const trendIcon = (label: string) => {
  if (label === 'Improving') return <TrendingUp className="w-4 h-4 text-success" />;
  if (label === 'Deteriorating') return <TrendingDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const trendColor = (label: string) => {
  if (label === 'Improving') return 'text-success';
  if (label === 'Deteriorating') return 'text-destructive';
  return 'text-muted-foreground';
};

const DemoProgress = () => {
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'tapping' | 'speech' | 'spiral'>('all');

  const data = DEMO_PATIENT.weeklyData;
  const tappingTrend = getTrendLabel(data.map(d => d.tapping_score));
  const spiralTrend = getTrendLabel(data.map(d => d.spiral_score));
  const speechTrend = getTrendLabel(data.map(d => d.speech_score));

  const tabs = [
    { key: 'all' as const, label: 'All Tests' },
    { key: 'tapping' as const, label: 'Tapping' },
    { key: 'speech' as const, label: 'Speech' },
    { key: 'spiral' as const, label: 'Spiral' },
  ];

  const testMeta = [
    { key: 'tapping_score', name: 'Tapping', icon: Hand, trend: tappingTrend, color: 'hsl(var(--primary))', avg: avg(data.map(d => d.tapping_score)), latest: data[data.length - 1].tapping_score },
    { key: 'speech_score', name: 'Speech', icon: Mic, trend: speechTrend, color: 'hsl(var(--success))', avg: avg(data.map(d => d.speech_score)), latest: data[data.length - 1].speech_score },
    { key: 'spiral_score', name: 'Spiral', icon: PenTool, trend: spiralTrend, color: 'hsl(var(--warning))', avg: avg(data.map(d => d.spiral_score)), latest: data[data.length - 1].spiral_score },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-soft px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Demo Progress</h1>
            <p className="text-sm text-muted-foreground">Patient: {DEMO_PATIENT.name} (demo data)</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 max-w-3xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          {testMeta.map(t => (
            <Card key={t.key} className="border-0 shadow-card">
              <CardContent className="pt-4 pb-4 text-center">
                <t.icon className="w-6 h-6 mx-auto mb-1" style={{ color: t.color }} />
                <p className="text-xs text-muted-foreground">{t.name}</p>
                <p className="text-2xl font-bold text-foreground">{t.latest}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {trendIcon(t.trend)}
                  <span className={`text-xs font-medium ${trendColor(t.trend)}`}>{t.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-muted/50 rounded-2xl p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-card shadow-soft text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Combined Chart */}
        {activeTab === 'all' && (
          <Card className="border-0 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Weekly Performance — All Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' } }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="tapping_score" name="Tapping" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="speech_score" name="Speech" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="spiral_score" name="Spiral" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Individual test charts */}
        {activeTab !== 'all' && (() => {
          const meta = testMeta.find(t => t.key === `${activeTab}_score`)!;
          const dataKey = `${activeTab}_score`;
          return (
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <meta.icon className="w-5 h-5" style={{ color: meta.color }} />
                  {meta.name} Test — Weekly Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' } }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                      <Bar dataKey={dataKey} name={meta.name} fill={meta.color} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between items-center bg-muted/50 rounded-xl p-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-xl font-bold text-foreground">{meta.avg}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Trend</p>
                    <div className="flex items-center gap-1">
                      {trendIcon(meta.trend)}
                      <span className={`font-semibold ${trendColor(meta.trend)}`}>{meta.trend}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}
      </main>
    </div>
  );
};

export default DemoProgress;
