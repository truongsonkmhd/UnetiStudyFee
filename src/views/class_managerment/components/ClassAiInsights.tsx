import React, { useState, useCallback } from 'react';
import {
  Brain, X, Play, Wifi, WifiOff, RefreshCw,
  Users, Target, AlertTriangle, CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import aiService from '@/services/aiService';
import { toast } from 'sonner';

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────
interface ClusterItem {
  userId: string; username: string; fullName: string; avatar: string;
  clusterId: number; clusterLabel: string; clusterScore: number;
}
interface RiskItem {
  userId: string; username: string; fullName: string; avatar: string;
  riskLevel: string; riskProbability: number;
}
interface AnalyticsState {
  behavioral: ClusterItem[];
  performance: ClusterItem[];
  riskCluster: ClusterItem[];
  riskPredict: RiskItem[];
}

type TabKey = 'behavioral' | 'performance' | 'risk' | 'predict';

// ──────────────────────────────────────────────
// COLORS
// ──────────────────────────────────────────────
const CLUSTER_COLORS = ['#6c63ff', '#00d4aa', '#ff6b6b', '#ffd93d', '#f97316'];
const RISK_COLORS: Record<string, string> = {
  LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444',
  'On Track': '#10b981', 'Need Support': '#f59e0b', 'At Risk': '#ef4444',
};

function riskBadge(level: string) {
  const map: Record<string, string> = {
    HIGH: 'bg-red-500/15 text-red-400 border border-red-500/30',
    MEDIUM: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    LOW: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    'At Risk': 'bg-red-500/15 text-red-400 border border-red-500/30',
    'Need Support': 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    'On Track': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  };
  return map[level] || 'bg-violet-500/15 text-violet-400 border border-violet-500/30';
}

// ──────────────────────────────────────────────
// PARSERS
// ──────────────────────────────────────────────
function parseCluster(raw: any): ClusterItem[] {
  const items: any[] = raw?.results ?? [];
  return items.map((r: any) => ({
    userId: r.user_id || r.userId || '',
    username: r.username || '',
    fullName: r.full_name || r.fullName || r.username || r.user_id || '—',
    avatar: r.avatar || '',
    clusterId: r.cluster_id ?? r.clusterId ?? 0,
    clusterLabel: r.cluster_label || r.clusterLabel || `Nhóm ${r.cluster_id ?? 0}`,
    clusterScore: r.cluster_score ?? r.clusterScore ?? 0,
  }));
}

function parseRisk(raw: any): RiskItem[] {
  const items: any[] = raw?.results ?? [];
  return items.map((r: any) => {
    const prob = r.risk_probability ?? r.riskProbability ?? r.risk_prob ?? 0;
    const level = r.risk_level || r.riskLevel ||
      (prob > 0.7 ? 'HIGH' : prob > 0.3 ? 'MEDIUM' : 'LOW');
    return {
      userId: r.user_id || r.userId || '',
      username: r.username || '',
      fullName: r.full_name || r.fullName || r.username || r.user_id || '—',
      avatar: r.avatar || '',
      riskLevel: level,
      riskProbability: prob,
    };
  });
}

function groupCount(items: ClusterItem[]) {
  const m: Record<string, number> = {};
  items.forEach(i => { m[i.clusterLabel] = (m[i.clusterLabel] || 0) + 1; });
  return Object.entries(m).map(([name, value]) => ({ name, value }));
}

// ──────────────────────────────────────────────
// AVATAR
// ──────────────────────────────────────────────
const Avatar: React.FC<{ src?: string; name: string; size?: number }> = ({ src, name, size = 32 }) => (
  <div
    style={{ width: size, height: size, minWidth: size }}
    className="rounded-full overflow-hidden bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold text-xs"
  >
    {src
      ? <img src={src} alt="" className="w-full h-full object-cover" onError={e => { (e.target as any).style.display = 'none'; }} />
      : name.charAt(0).toUpperCase()}
  </div>
);

// ──────────────────────────────────────────────
// CLUSTER TABLE
// ──────────────────────────────────────────────
const ClusterTable: React.FC<{ items: ClusterItem[]; colorMap: Record<number, string> }> = ({ items, colorMap }) => (
  <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
    <table className="w-full text-sm">
      <thead className="sticky top-0" style={{ background: '#1a2235' }}>
        <tr>
          {['#', 'Học sinh', 'Nhóm', 'Score'].map(h => (
            <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.slice(0, 50).map((item, idx) => (
          <tr key={item.userId} className="hover:bg-white/5 transition-colors border-b border-white/5">
            <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{idx + 1}</td>
            <td className="px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <Avatar src={item.avatar} name={item.fullName} />
                <div>
                  <div className="font-medium text-slate-200 text-xs">{item.fullName}</div>
                  <div className="text-slate-500 text-[11px]">@{item.username}</div>
                </div>
              </div>
            </td>
            <td className="px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: colorMap[item.clusterId] || CLUSTER_COLORS[item.clusterId % CLUSTER_COLORS.length] }}>
                <span className="w-2 h-2 rounded-full inline-block"
                  style={{ background: colorMap[item.clusterId] || CLUSTER_COLORS[item.clusterId % CLUSTER_COLORS.length] }} />
                {item.clusterLabel}
              </span>
            </td>
            <td className="px-4 py-2.5 font-mono text-slate-400 text-xs">{item.clusterScore.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ──────────────────────────────────────────────
// RISK TABLE
// ──────────────────────────────────────────────
const RiskTable: React.FC<{ items: RiskItem[] }> = ({ items }) => {
  const sorted = [...items].sort((a, b) => b.riskProbability - a.riskProbability);
  return (
    <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
      <table className="w-full text-sm">
        <thead className="sticky top-0" style={{ background: '#1a2235' }}>
          <tr>
            {['Rank', 'Học sinh', 'Xác suất bỏ học', 'Mức độ'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.slice(0, 30).map((item, idx) => (
            <tr key={item.userId} className="hover:bg-white/5 transition-colors border-b border-white/5">
              <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">#{idx + 1}</td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <Avatar src={item.avatar} name={item.fullName} />
                  <div>
                    <div className="font-medium text-slate-200 text-xs">{item.fullName}</div>
                    <div className="text-slate-500 text-[11px]">@{item.username}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.riskProbability * 100).toFixed(0)}%`,
                        background: item.riskLevel === 'HIGH' ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                          : item.riskLevel === 'MEDIUM' ? 'linear-gradient(90deg,#f59e0b,#f97316)'
                            : 'linear-gradient(90deg,#10b981,#00d4aa)',
                      }} />
                  </div>
                  <span className="text-xs font-mono text-slate-300 min-w-[36px]">
                    {(item.riskProbability * 100).toFixed(1)}%
                  </span>
                </div>
              </td>
              <td className="px-4 py-2.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${riskBadge(item.riskLevel)}`}>
                  {item.riskLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ──────────────────────────────────────────────
// CUSTOM TOOLTIP
// ──────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 p-3 text-sm shadow-xl" style={{ background: '#131929' }}>
      {label && <p className="text-slate-400 mb-1 font-medium">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill || p.color }}>{p.name || p.dataKey}: <b>{p.value}</b></p>
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
interface Props { classId: string; className: string; onClose: () => void; }

const ClassAiInsights: React.FC<Props> = ({ classId, className, onClose }) => {
  const [tab, setTab] = useState<TabKey>('behavioral');
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [data, setData] = useState<AnalyticsState>({
    behavioral: [], performance: [], riskCluster: [], riskPredict: [],
  });

  const runAll = useCallback(async () => {
    try {
      setRunning(true);
      setStatus('idle');
      const [beh, perf, riskC, riskP] = await aiService.runAll(classId);
      setData({
        behavioral: parseCluster(beh),
        performance: parseCluster(perf),
        riskCluster: parseCluster(riskC),
        riskPredict: parseRisk(riskP),
      });
      setStatus('ok');
      toast.success(`Phân tích ${className} hoàn tất!`);
    } catch (e: any) {
      setStatus('error');
      toast.error('Phân tích thất bại: ' + (e?.message || 'Lỗi không xác định'));
    } finally {
      setRunning(false);
    }
  }, [classId, className]);

  // ── stats
  const totalStudents = data.behavioral.length || data.riskPredict.length || data.performance.length;
  const behavGroups = new Set(data.behavioral.map(i => i.clusterLabel)).size;
  const highRisk = data.riskPredict.filter(i => i.riskLevel === 'HIGH').length;
  const lowRisk = data.riskPredict.filter(i => i.riskLevel === 'LOW').length;

  // ── chart data
  const behavChart = groupCount(data.behavioral);
  const perfChart = groupCount(data.performance);
  const riskClusterChart = groupCount(data.riskCluster);
  const riskPredChart = (() => {
    const m: Record<string, number> = {};
    data.riskPredict.forEach(i => { m[i.riskLevel] = (m[i.riskLevel] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  })();

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'behavioral', label: 'Behavioral', icon: '🧠' },
    { key: 'performance', label: 'Performance', icon: '📊' },
    { key: 'risk', label: 'Risk Cluster', icon: '⚠️' },
    { key: 'predict', label: 'Risk Predict', icon: '🔮' },
  ];

  // color map by label
  const makeColorMap = (items: ClusterItem[]) => {
    const labels = [...new Set(items.map(i => i.clusterLabel))];
    const m: Record<number, string> = {};
    items.forEach(i => { m[i.clusterId] = CLUSTER_COLORS[labels.indexOf(i.clusterLabel) % CLUSTER_COLORS.length]; });
    return m;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: '#0b0f1a', fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER */}
      <div className="flex items-center justify-between px-8 py-4 border-b shrink-0"
        style={{ borderColor: '#1e2d45', background: 'linear-gradient(135deg,#0b0f1a,#131929)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg,#6c63ff,#00d4aa)' }}>🧠</div>
          <div>
            <div className="text-white font-bold text-base leading-tight">AI Analytics Dashboard</div>
            <div className="text-slate-400 text-xs flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3" />
              {className}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border"
            style={{ background: '#131929', borderColor: '#1e2d45' }}>
            {status === 'ok' ? <><Wifi className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Đã phân tích</span></>
              : status === 'error' ? <><WifiOff className="w-3 h-3 text-red-400" /><span className="text-red-400">Lỗi</span></>
                : <><div className="w-2 h-2 rounded-full bg-slate-500" /><span className="text-slate-400">Chưa phân tích</span></>}
          </div>

          {/* run */}
          <button onClick={runAll} disabled={running}
            className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', boxShadow: running ? 'none' : '0 8px 24px rgba(108,99,255,.35)' }}>
            {running
              ? <><RefreshCw className="w-4 h-4 animate-spin" />Đang phân tích…</>
              : <><Play className="w-4 h-4" />Chạy phân tích</>}
          </button>

          {/* close */}
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── BODY (scroll) */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-5 h-5" />, label: 'Tổng học sinh', value: totalStudents || '—', color: '#e2e8f0' },
            { icon: <Target className="w-5 h-5" />, label: 'Behavioral nhóm', value: behavGroups || '—', color: '#6c63ff' },
            { icon: <AlertTriangle className="w-5 h-5" />, label: 'Nguy cơ cao', value: highRisk || '—', color: '#ef4444' },
            { icon: <CheckCircle2 className="w-5 h-5" />, label: 'An toàn (LOW)', value: lowRisk || '—', color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-5 border transition-colors hover:border-violet-500/40"
              style={{ background: '#131929', borderColor: '#1e2d45' }}>
              <div style={{ color: s.color }} className="mb-2 opacity-70">{s.icon}</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">{s.label}</div>
              <div className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex gap-1 p-1 rounded-xl w-fit border" style={{ background: '#131929', borderColor: '#1e2d45' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={tab === t.key
                ? { background: 'linear-gradient(135deg,#6c63ff,#8b5cf6)', color: '#fff' }
                : { color: '#64748b' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── BEHAVIORAL */}
        {tab === 'behavioral' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Doughnut */}
              <div className="rounded-2xl border p-5" style={{ background: '#131929', borderColor: '#1e2d45' }}>
                <div className="text-sm font-semibold text-slate-200 mb-4">🍩 Phân bố nhóm hành vi</div>
                {behavChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={behavChart} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                        {behavChart.map((_, i) => <Cell key={i} fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={(v) => <span className="text-slate-300 text-xs">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
              {/* Bar */}
              <div className="rounded-2xl border p-5" style={{ background: '#131929', borderColor: '#1e2d45' }}>
                <div className="text-sm font-semibold text-slate-200 mb-4">📊 Số lượng mỗi nhóm</div>
                {behavChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={behavChart} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {behavChart.map((_, i) => <Cell key={i} fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
            </div>
            {/* Table */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#131929', borderColor: '#1e2d45' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#1e2d45' }}>
                <span className="text-sm font-semibold text-slate-200">📋 Chi tiết — Top 50 học sinh</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(108,99,255,.15)', color: '#6c63ff' }}>BEHAVIORAL</span>
              </div>
              {data.behavioral.length > 0
                ? <ClusterTable items={data.behavioral} colorMap={makeColorMap(data.behavioral)} />
                : <EmptyTable />}
            </div>
          </div>
        )}

        {/* ── PERFORMANCE */}
        {tab === 'performance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border p-5" style={{ background: '#131929', borderColor: '#1e2d45' }}>
                <div className="text-sm font-semibold text-slate-200 mb-4">🍩 Phân bố năng lực</div>
                {perfChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={perfChart} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                        {perfChart.map((_, i) => <Cell key={i} fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={(v) => <span className="text-slate-300 text-xs">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
              <div className="rounded-2xl border p-5" style={{ background: '#131929', borderColor: '#1e2d45' }}>
                <div className="text-sm font-semibold text-slate-200 mb-4">📊 Số lượng theo nhóm năng lực</div>
                {perfChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={perfChart} margin={{ top: 10, right: 10, left: -20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {perfChart.map((_, i) => <Cell key={i} fill={CLUSTER_COLORS[i % CLUSTER_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
            </div>
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#131929', borderColor: '#1e2d45' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#1e2d45' }}>
                <span className="text-sm font-semibold text-slate-200">📋 Top 50 học sinh — Năng lực</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(0,212,170,.15)', color: '#00d4aa' }}>PERFORMANCE</span>
              </div>
              {data.performance.length > 0
                ? <ClusterTable items={data.performance} colorMap={makeColorMap(data.performance)} />
                : <EmptyTable />}
            </div>
          </div>
        )}

        {/* ── RISK CLUSTER */}
        {tab === 'risk' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border p-5" style={{ background: '#131929', borderColor: '#1e2d45' }}>
                <div className="text-sm font-semibold text-slate-200 mb-4">🎯 Phân nhóm rủi ro (KMeans)</div>
                {riskClusterChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={riskClusterChart} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                        {riskClusterChart.map((e, i) => (
                          <Cell key={i} fill={RISK_COLORS[e.name] || CLUSTER_COLORS[i % CLUSTER_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={(v) => <span className="text-slate-300 text-xs">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
              <div className="rounded-2xl border p-5" style={{ background: '#131929', borderColor: '#1e2d45' }}>
                <div className="text-sm font-semibold text-slate-200 mb-4">📊 So sánh các nhóm</div>
                {riskClusterChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={riskClusterChart} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {riskClusterChart.map((e, i) => (
                          <Cell key={i} fill={RISK_COLORS[e.name] || CLUSTER_COLORS[i % CLUSTER_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
            </div>
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#131929', borderColor: '#1e2d45' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#1e2d45' }}>
                <span className="text-sm font-semibold text-slate-200">📋 Top 50 — Risk Clustering</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,107,107,.15)', color: '#ff6b6b' }}>RISK</span>
              </div>
              {data.riskCluster.length > 0
                ? <ClusterTable items={data.riskCluster} colorMap={makeColorMap(data.riskCluster)} />
                : <EmptyTable />}
            </div>
          </div>
        )}

        {/* ── RISK PREDICT */}
        {tab === 'predict' && (
          <div className="space-y-4">
            {/* Gauge */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '🟢 Low Risk', key: 'LOW', color: '#10b981', sub: 'học sinh an toàn' },
                { label: '🟡 Medium Risk', key: 'MEDIUM', color: '#f59e0b', sub: 'cần theo dõi' },
                { label: '🔴 High Risk', key: 'HIGH', color: '#ef4444', sub: 'nguy cơ bỏ học' },
              ].map(g => {
                const count = data.riskPredict.filter(i => i.riskLevel === g.key).length;
                return (
                  <div key={g.key} className="rounded-2xl border p-5" style={{ background: '#131929', borderColor: '#1e2d45' }}>
                    <div className="text-sm font-semibold text-slate-200 mb-3">{g.label}</div>
                    <div className="rounded-xl p-4 text-center"
                      style={{ background: `rgba(${g.color === '#10b981' ? '16,185,129' : g.color === '#f59e0b' ? '245,158,11' : '239,68,68'},.08)`, border: `1px solid ${g.color}30` }}>
                      <div className="text-4xl font-extrabold" style={{ color: g.color }}>{count || '—'}</div>
                      <div className="text-xs text-slate-500 mt-1">{g.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Risk distribution bar */}
              <div className="rounded-2xl border p-5" style={{ background: '#131929', borderColor: '#1e2d45' }}>
                <div className="text-sm font-semibold text-slate-200 mb-4">📊 Tỉ lệ rủi ro</div>
                {riskPredChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={riskPredChart} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {riskPredChart.map((e, i) => (
                          <Cell key={i} fill={RISK_COLORS[e.name] || CLUSTER_COLORS[i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>

              {/* Pie risk */}
              <div className="rounded-2xl border p-5" style={{ background: '#131929', borderColor: '#1e2d45' }}>
                <div className="text-sm font-semibold text-slate-200 mb-4">🍩 Phân bố xác suất</div>
                {riskPredChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={riskPredChart} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                        {riskPredChart.map((e, i) => (
                          <Cell key={i} fill={RISK_COLORS[e.name] || CLUSTER_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend formatter={(v) => <span className="text-slate-300 text-xs">{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <EmptyChart />}
              </div>
            </div>

            {/* Top risk table */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#131929', borderColor: '#1e2d45' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#1e2d45' }}>
                <span className="text-sm font-semibold text-slate-200">🔴 Top 30 học sinh nguy cơ cao nhất</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(239,68,68,.15)', color: '#ef4444' }}>RANDOM FOREST</span>
              </div>
              {data.riskPredict.length > 0
                ? <RiskTable items={data.riskPredict} />
                : <EmptyTable />}
            </div>
          </div>
        )}

        {/* empty state */}
        {status === 'idle' && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Brain className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-base font-semibold mb-1">Chưa có dữ liệu phân tích</p>
            <p className="text-sm">Nhấn <b className="text-violet-400">▶ Chạy phân tích</b> để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

// helpers
const EmptyChart = () => (
  <div className="flex flex-col items-center justify-center h-48 text-slate-600">
    <Brain className="w-8 h-8 mb-2 opacity-30" />
    <span className="text-sm">Nhấn "Chạy phân tích" để xem dữ liệu</span>
  </div>
);

const EmptyTable = () => (
  <div className="flex flex-col items-center justify-center py-10 text-slate-600">
    <span className="text-3xl mb-2">📭</span>
    <span className="text-sm">Chưa có dữ liệu</span>
  </div>
);

export default ClassAiInsights;
