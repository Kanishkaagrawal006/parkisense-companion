import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DEMO_PATIENT, getTrendLabel, avg, NMS_CATEGORIES } from '@/lib/demoData';
import { ArrowLeft, Hand, Mic, PenTool, TrendingUp, TrendingDown, Minus, BedDouble, ClipboardCheck } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
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
  const [activeTab, setActiveTab] = useState<'tests' | 'sleep' | 'nms'>('tests');

  const data = DEMO_PATIENT.weeklyData;
  const tappingTrend = getTrendLabel(data.map(d => d.tapping_score));
  const spiralTrend = getTrendLabel(data.map(d => d.spiral_score));
  const speechTrend = getTrendLabel(data.map(d => d.speech_score));

  const testMeta = [
    { key: 'tapping_score', name: 'Tapping', icon: Hand, trend: tappingTrend, color: 'hsl(var(--primary))', avg: avg(data.map(d => d.tapping_score)), latest: data[data.length - 1].tapping_score },
    { key: 'speech_score', name: 'Speech', icon: Mic, trend: speechTrend, color: 'hsl(var(--success))', avg: avg(data.map(d => d.speech_score)), latest: data[data.length - 1].speech_score },
    { key: 'spiral_score', name: 'Spiral', icon: PenTool, trend: spiralTrend, color: 'hsl(var(--warning))', avg: avg(data.map(d => d.spiral_score)), latest: data[data.length - 1].spiral_score },
  ];

  const sleepData = DEMO_PATIENT.sleepRecords;
  const avgSleep = avg(sleepData.map(d => d.sleepHours));

  // Radar data for latest NMS record
  const latestNMS = DEMO_PATIENT.nmsRecords[DEMO_PATIENT.nmsRecords.length - 1];
  const radarData = NMS_CATEGORIES.map(c => ({
    category: c.label.split(' ')[0],
    value: latestNMS[c.key as keyof typeof latestNMS] as number,
    fullMark: 4,
  }));

  const tabs = [
    { key: 'tests' as const, label: 'Tests', icon: Hand },
    { key: 'sleep' as const, label: 'Sleep', icon: BedDouble },
    { key: 'nms' as const, label: 'NMS', icon: ClipboardCheck },
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
        {/* Tabs */}
        <div className="flex gap-2 bg-muted/50 rounded-2xl p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.key ? 'bg-card shadow-soft text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== TESTS TAB ===== */}
        {activeTab === 'tests' && (
          <div className="space-y-6 animate-fade-in">
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
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
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
          </div>
        )}

        {/* ===== SLEEP TAB ===== */}
        {activeTab === 'sleep' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-card">
                <CardContent className="pt-4 pb-4 text-center">
                  <BedDouble className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Avg Sleep</p>
                  <p className="text-2xl font-bold text-foreground">{avgSleep}h</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-card">
                <CardContent className="pt-4 pb-4 text-center">
                  <BedDouble className="w-6 h-6 mx-auto mb-1 text-success" />
                  <p className="text-xs text-muted-foreground">Last Night</p>
                  <p className="text-2xl font-bold text-foreground">{sleepData[sleepData.length - 1].sleepHours}h</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sleep Duration — Daily</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sleepData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={d => d.slice(5)} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' } }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                      <Bar dataKey="sleepHours" name="Sleep (hrs)" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== NMS TAB ===== */}
        {activeTab === 'nms' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">NMS Total Score — Weekly Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={DEMO_PATIENT.nmsRecords}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 24]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' } }} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="total" name="NMS Total" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Symptom Breakdown — Weekly</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DEMO_PATIENT.nmsRecords}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }} />
                      <Legend />
                      {NMS_CATEGORIES.map(c => (
                        <Bar key={c.key} dataKey={c.key} name={c.label.split('(')[0].trim()} fill={c.color} stackId="nms" />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Latest Week — Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <PolarRadiusAxis domain={[0, 4]} tick={{ fontSize: 10 }} />
                      <Radar name="NMS Score" dataKey="value" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default DemoProgress;
