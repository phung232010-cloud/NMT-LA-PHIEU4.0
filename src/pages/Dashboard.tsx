import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Users, Vote, TrendingUp, Trophy, Activity, ArrowLeft, Brain, Star, Zap, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import AppLayout from '@/components/AppLayout';

// AI Prediction Engine (client-side simulation)
function generatePredictions(candidates: { id: string; name: string; voteCount: number }[], totalVotes: number, ratings: any[]) {
  const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  const maxVotes = sorted[0]?.voteCount || 1;

  return sorted.map((c, idx) => {
    const voteShare = totalVotes > 0 ? c.voteCount / totalVotes : 0;
    const momentum = Math.max(0.1, voteShare + (Math.random() * 0.1 - 0.05));
    const candidateRatings = ratings.filter(r => r.candidateId === c.id);
    const avgRating = candidateRatings.length > 0
      ? candidateRatings.reduce((s: number, r: any) => s + r.rating, 0) / candidateRatings.length
      : 3;
    const ratingScore = avgRating / 5;
    const winProbability = Math.min(0.95, Math.max(0.02, voteShare * 0.6 + ratingScore * 0.25 + momentum * 0.15));
    const confidence = Math.min(98, Math.max(15, Math.round(
      (totalVotes > 20 ? 70 : totalVotes * 3.5) + (candidateRatings.length * 2) + (idx === 0 ? 10 : 0)
    )));
    const trendDirection = idx === 0 ? 'rising' : idx < sorted.length / 2 ? 'stable' : 'declining';

    return {
      id: c.id,
      name: c.name,
      shortName: c.name.split(' ').pop() || c.name,
      voteCount: c.voteCount,
      voteShare: Math.round(voteShare * 100),
      winProbability: Math.round(winProbability * 100),
      confidence,
      momentum: Math.round(momentum * 100),
      avgRating: Math.round(avgRating * 10) / 10,
      trendDirection,
      predictedFinalShare: Math.round((voteShare * 0.7 + winProbability * 0.3) * 100),
    };
  });
}

const COLORS = [
  'hsl(250, 80%, 62%)', 'hsl(190, 90%, 50%)', 'hsl(160, 70%, 45%)',
  'hsl(38, 92%, 55%)', 'hsl(340, 75%, 55%)', 'hsl(280, 70%, 60%)',
];

const tooltipStyle = {
  background: 'hsl(0, 0%, 100%)',
  border: '1px solid hsl(220, 13%, 90%)',
  borderRadius: '12px',
  color: 'hsl(222, 47%, 11%)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

export default function Dashboard() {
  const { groupId } = useParams<{ groupId: string }>();
  const { groups } = useAppStore();
  const group = groups.find(g => g.id === groupId);

  const predictions = useMemo(() => {
    if (!group) return [];
    const totalVotes = group.candidates.reduce((s, c) => s + c.voteCount, 0);
    return generatePredictions(group.candidates, totalVotes, group.ratings || []);
  }, [group]);

  if (!group) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Không tìm thấy nhóm</h2>
          <Link to="/my-groups" className="text-primary hover:underline">Quay lại</Link>
        </div>
      </AppLayout>
    );
  }

  const candidates = group.candidates;
  const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
  const totalVotes = candidates.reduce((s, c) => s + c.voteCount, 0);

  const barData = sorted.map(c => ({ name: c.name.split(' ').pop(), votes: c.voteCount }));
  const pieData = sorted.map(c => ({ name: c.name.split(' ').pop(), value: c.voteCount }));

  const trendData = Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}:00`,
    ...Object.fromEntries(sorted.slice(0, 4).map((c, ci) => [
      c.name.split(' ').pop(),
      Math.floor((c.voteCount / 12) * (i + 1) * (0.8 + Math.random() * 0.4)),
    ])),
  }));

  const radarData = predictions.map(p => ({
    name: p.shortName,
    'Phiếu bầu': p.voteShare,
    'Đánh giá': Math.round(p.avgRating * 20),
    'Dự đoán': p.winProbability,
    'Momentum': p.momentum,
  }));

  const statCards = [
    { icon: Users, label: 'Ứng viên', value: candidates.length, color: 'text-primary' },
    { icon: Vote, label: 'Tổng phiếu', value: totalVotes, color: 'text-accent' },
    { icon: Trophy, label: 'Dẫn đầu', value: sorted[0]?.name.split(' ').pop() || '-', color: 'text-green-600' },
    { icon: Activity, label: 'Người bầu', value: Object.keys(group.votes).length, color: 'text-orange-500' },
  ];

  const topPrediction = predictions[0];

  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/my-groups" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          <h1 className="text-3xl font-bold mb-2">📊 Dashboard: {group.name}</h1>
          <p className="text-muted-foreground mb-8">Thống kê bầu cử & AI Prediction</p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-5">
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* AI Prediction Banner */}
        {topPrediction && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-6 mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-primary" />
              <h3 className="font-bold text-lg">🤖 AI Prediction</h3>
              <span className="ml-auto text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                Độ tin cậy: {topPrediction.confidence}%
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {predictions.slice(0, 4).map((p, i) => (
                <div key={p.id} className="rounded-xl bg-background/60 p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="font-semibold text-sm truncate">{p.shortName}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">{p.winProbability}%</div>
                  <div className="text-xs text-muted-foreground">Xác suất thắng</div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3 h-3 text-orange-400" />
                    <span className="text-xs font-medium">{p.avgRating}/5</span>
                    <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      p.trendDirection === 'rising' ? 'bg-green-100 text-green-700' :
                      p.trendDirection === 'stable' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.trendDirection === 'rising' ? '↑ Tăng' : p.trendDirection === 'stable' ? '→ Ổn định' : '↓ Giảm'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Phân bố phiếu bầu</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
                <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Tỷ lệ phiếu bầu</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Area Chart - Trend */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Xu hướng bỏ phiếu theo thời gian</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                {sorted.slice(0, 4).map((c, i) => (
                  <linearGradient key={c.id} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" />
              <XAxis dataKey="time" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              {sorted.slice(0, 4).map((c, i) => (
                <Area key={c.id} type="monotone" dataKey={c.name.split(' ').pop()!} stroke={COLORS[i]} fillOpacity={1} fill={`url(#gradient-${i})`} strokeWidth={2} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-3">
            {sorted.slice(0, 4).map((c, i) => (
              <div key={c.id} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-muted-foreground">{c.name.split(' ').pop()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Prediction Details + Radar */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Prediction Score Table */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">AI Prediction Scores</h3>
            </div>
            <div className="space-y-3">
              {predictions.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-border/50">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground" style={{ background: COLORS[i % COLORS.length] }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{p.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${p.winProbability}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                      <span className="text-xs font-bold text-primary">{p.winProbability}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-orange-400" />
                      <span className="text-xs font-medium">{p.avgRating}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{p.voteCount} phiếu</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Radar Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Phân tích đa chiều</h3>
            </div>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={[
                  { metric: 'Phiếu bầu', ...Object.fromEntries(radarData.map(r => [r.name, r['Phiếu bầu']])) },
                  { metric: 'Đánh giá', ...Object.fromEntries(radarData.map(r => [r.name, r['Đánh giá']])) },
                  { metric: 'Dự đoán', ...Object.fromEntries(radarData.map(r => [r.name, r['Dự đoán']])) },
                  { metric: 'Momentum', ...Object.fromEntries(radarData.map(r => [r.name, r['Momentum']])) },
                ]}>
                  <PolarGrid stroke="hsl(220, 13%, 90%)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'hsl(215, 20%, 55%)' }} />
                  <PolarRadiusAxis tick={{ fontSize: 10 }} />
                  {radarData.slice(0, 4).map((r, i) => (
                    <Radar key={r.name} name={r.name} dataKey={r.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
                  ))}
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[320px] text-muted-foreground text-sm">Chưa có dữ liệu</div>
            )}
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {radarData.slice(0, 4).map((r, i) => (
                <div key={r.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{r.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
