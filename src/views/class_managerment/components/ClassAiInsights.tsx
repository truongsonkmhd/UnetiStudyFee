import React, { useState, useCallback } from 'react';
import {
  Brain, X, Play, Wifi, WifiOff, RefreshCw,
  Users, Target, AlertTriangle, CheckCircle2,
  ChevronRight, Mail, Send, Loader2,
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
  riskCluster: ClusterItem[];
  riskPredict: RiskItem[];
}

type TabKey = 'behavioral' | 'risk' | 'predict';

interface EmailModalState {
  open: boolean;
  riskLevel: string;
  recipients: RiskItem[];
  subject: string;
  body: string;
}

// ──────────────────────────────────────────────
// COLORS
// ──────────────────────────────────────────────
const CLUSTER_COLORS = ['#6c63ff', '#00d4aa', '#ff6b6b', '#ffd93d', '#f97316'];
const RISK_COLORS: Record<string, string> = {
  LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444',
  'THẤP': '#10b981', 'TRUNG BÌNH': '#f59e0b', 'CAO': '#ef4444',
  'On Track': '#10b981', 'Need Support': '#f59e0b', 'At Risk': '#ef4444',
  'Đúng tiến độ': '#10b981', 'Cần hỗ trợ': '#f59e0b', 'Nguy cơ cao': '#ef4444',
};

function riskBadge(level: string) {
  const map: Record<string, string> = {
    HIGH: 'bg-red-500/15 text-red-400 border border-red-500/30',
    CAO: 'bg-red-500/15 text-red-400 border border-red-500/30',
    MEDIUM: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    'TRUNG BÌNH': 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    LOW: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    THẤP: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    'At Risk': 'bg-red-500/15 text-red-400 border border-red-500/30',
    'Need Support': 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    'On Track': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    'Nguy cơ cao': 'bg-red-500/15 text-red-400 border border-red-500/30',
    'Cần hỗ trợ': 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    'Đúng tiến độ': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  };
  return map[level] || 'bg-violet-500/15 text-violet-400 border border-violet-500/30';
}

// ──────────────────────────────────────────────
// PARSERS
// ──────────────────────────────────────────────
function parseCluster(raw: any): ClusterItem[] {
  const items: any[] = (raw?.data?.results || raw?.results) ?? [];
  const transMap: Record<string, string> = {
    'On Track': 'Đúng tiến độ',
    'Need Support': 'Cần hỗ trợ',
    'At Risk': 'Nguy cơ cao'
  };

  const parsed = items.map((r: any) => {
    let lbl = r.cluster_label || r.clusterLabel || `Nhóm ${r.cluster_id ?? 0}`;
    lbl = transMap[lbl] || lbl;

    return {
      userId: r.user_id || r.userId || '',
      username: r.username || '',
      fullName: r.full_name || r.fullName || r.username || r.user_id || '—',
      avatar: r.avatar || '',
      clusterId: r.cluster_id ?? r.clusterId ?? 0,
      clusterLabel: lbl,
      clusterScore: r.cluster_score ?? r.clusterScore ?? 0,
    };
  });

  // Calculate a meaningful deterministic 1-10 score based on K-Means distance
  // Principles:
  // - Close to centroid (small distance) = Strong representative of that cluster.
  // - Good clusters: Score approaches 10 if distance is small.
  // - Bad clusters: Score approaches 1 if distance is small.
  parsed.forEach(p => {
    const rawDist = p.clusterScore; // original K-Means distance
    const lbl = p.clusterLabel.toLowerCase();

    let baseScore = 6.0;

    // Group 1: Good
    if (lbl.includes('chăm') || lbl.includes('tốt') || lbl.includes('tiến độ')) {
      // 10.0 is perfect. Subtract distance (scaled) to penalize being at the edge. Min 8.0.
      p.clusterScore = Math.max(8.0, 10.0 - (rawDist * 0.3));
    }
    // Group 2: Bad
    else if (lbl.includes('lười') || lbl.includes('nguy cơ') || lbl.includes('risk')) {
      // 1.0 is profoundly bad. Add distance (scaled) as they move away from the worst core. Max 4.5.
      p.clusterScore = Math.min(4.5, 1.0 + (rawDist * 0.3));
    }
    // Group 3: Average / Need Support / Late but consistent
    else {
      // Base is 6.0. Can fluctuate between 4.5 and 7.9.
      // We do a simple hash-like bounding using the distance.
      const variance = (rawDist % 3.0) - 1.5; // range [-1.5, 1.5]
      p.clusterScore = Math.max(4.6, Math.min(7.9, 6.5 + variance));
    }
  });

  return parsed;
}

function parseRisk(raw: any, knownUsers: ClusterItem[] = []): RiskItem[] {
  const items: any[] = (raw?.data?.results || raw?.results) ?? [];
  const userMap = new Map<string, ClusterItem>();
  knownUsers.forEach(u => userMap.set(u.userId, u));

  return items.map((r: any) => {
    const prob = r.risk_probability ?? r.riskProbability ?? r.risk_prob ?? 0;
    let level = r.risk_level || r.riskLevel ||
      (prob > 0.7 ? 'HIGH' : prob > 0.3 ? 'MEDIUM' : 'LOW');

    const transMap: Record<string, string> = {
      'HIGH': 'CAO',
      'MEDIUM': 'TRUNG BÌNH',
      'LOW': 'THẤP',
      'High': 'CAO',
      'Medium': 'TRUNG BÌNH',
      'Low': 'THẤP'
    };
    level = transMap[level] || level;

    const uid = r.user_id || r.userId || '';
    const known = userMap.get(uid);

    return {
      userId: uid,
      username: r.username || known?.username || '',
      fullName: r.full_name || r.fullName || known?.fullName || r.username || known?.username || uid || '—',
      avatar: r.avatar || known?.avatar || '',
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

function buildEmailTemplate(riskLevel: string, className: string): { subject: string; body: string } {
  const isHigh = riskLevel === 'CAO' || riskLevel === 'HIGH';
  const isLow = riskLevel === 'THẤP' || riskLevel === 'LOW';
  if (isHigh) {
    return {
      subject: `[Cảnh báo học tập] Tình trạng học tập trong lớp "${className}"`,
      body: `Kính gửi bạn học sinh,

Hệ thống AI phân tích của chúng tôi đã phát hiện bạn đang có nguy cơ cao gặp khó khăn trong lớp học "${className}".

Một số dấu hiệu được ghi nhận:
• Tỉ lệ hoàn thành bài học còn thấp
• Thời gian không hoạt động kéo dài
• Điểm trung bình các bài kiểm tra chưa đạt kỳ vọng

Chúng tôi rất quan tâm đến kết quả học tập của bạn và mong bạn:
1. Dành thêm thời gian ôn luyện các bài chưa hoàn thành
2. Liên hệ trực tiếp với giáo viên nếu cần hỗ trợ
3. Tham gia tích cực hơn vào các buổi học trực tuyến

Nếu bạn gặp bất kỳ khó khăn nào, đừng ngần ngại liên hệ với giáo viên phụ trách.

Chúc bạn học tập tiến bộ!
Đội ngũ giảng dạy — ${className}`,
    };
  } else if (isLow) {
    return {
      subject: `[Khen thưởng] Thành tích học tập xuất sắc — Lớp "${className}"`,
      body: `Kính gửi bạn học sinh,

Chúng tôi vui mừng thông báo rằng hệ thống AI ghi nhận bạn đang có thành tích học tập rất tốt trong lớp "${className}"!

Những điểm nổi bật của bạn:
• Tỉ lệ hoàn thành bài học cao
• Điểm số các bài kiểm tra ổn định
• Tham gia học tập đều đặn và tích cực

Hãy tiếp tục duy trì phong độ học tập tuyệt vời này! Bạn đang là tấm gương tốt cho cả lớp.

Chúc bạn tiếp tục học tập thật hiệu quả!
Đội ngũ giảng dạy — ${className}`,
    };
  } else {
    return {
      subject: `[Thông báo] Cập nhật tình trạng học tập — Lớp "${className}"`,
      body: `Kính gửi bạn học sinh,

Đây là thông báo cập nhật tình trạng học tập của bạn trong lớp "${className}".

Hệ thống AI ghi nhận bạn đang ở mức học tập trung bình. Để cải thiện kết quả:
• Ôn lại các bài học còn tồn đọng
• Tham gia đầy đủ các buổi học
• Liên hệ giáo viên nếu cần giải đáp thắc mắc

Chúng tôi tin tưởng bạn có thể đạt được kết quả tốt hơn!

Đội ngũ giảng dạy — ${className}`,
    };
  }
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
          {['#', 'Học sinh', 'Nhóm', 'Điểm số'].map(h => (
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

const RiskTable: React.FC<{ items: RiskItem[]; onSendOne?: (item: RiskItem) => void }> = ({ items, onSendOne }) => {
  const sorted = [...items].sort((a, b) => b.riskProbability - a.riskProbability);
  return (
    <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
      <table className="w-full text-sm">
        <thead className="sticky top-0" style={{ background: '#1a2235' }}>
          <tr>
            {['Hạng', 'Học sinh', 'Xác suất bỏ học', 'Mức độ', 'Hành động'].map(h => (
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
                        background: (item.riskLevel === 'HIGH' || item.riskLevel === 'CAO') ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                          : (item.riskLevel === 'MEDIUM' || item.riskLevel === 'TRUNG BÌNH') ? 'linear-gradient(90deg,#f59e0b,#f97316)'
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
                  {item.riskLevel === 'HIGH' ? 'CAO' : item.riskLevel === 'MEDIUM' ? 'TRUNG BÌNH' : item.riskLevel === 'LOW' ? 'THẤP' : item.riskLevel}
                </span>
              </td>
              <td className="px-4 py-2.5">
                {onSendOne && (
                  <button
                    onClick={() => onSendOne(item)}
                    title="Gửi email cho học sinh này"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:scale-105"
                    style={{ background: 'rgba(108,99,255,0.15)', color: '#a78bfa', border: '1px solid rgba(108,99,255,0.3)' }}
                  >
                    <Mail className="w-3 h-3" />
                    Gửi
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


// ──────────────────────────────────────────────
// EMAIL MODAL
// ──────────────────────────────────────────────
interface EmailModalProps {
  state: EmailModalState;
  sending: boolean;
  onClose: () => void;
  onSubjectChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  onSend: () => void;
}
const EmailModal: React.FC<EmailModalProps> = ({ state, sending, onClose, onSubjectChange, onBodyChange, onSend }) => {
  if (!state.open) return null;
  const isHigh = state.riskLevel === 'CAO' || state.riskLevel === 'HIGH';
  const isLow = state.riskLevel === 'THẤP' || state.riskLevel === 'LOW';
  const accentColor = isHigh ? '#ef4444' : isLow ? '#10b981' : '#f59e0b';
  const accentBg = isHigh ? 'rgba(239,68,68,0.08)' : isLow ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)';
  const label = isHigh ? '🔴 Rủi ro CAO' : isLow ? '🟢 Rủi ro THẤP' : '🟡 Rủi ro TRUNG BÌNH';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-2xl rounded-2xl border flex flex-col" style={{ background: '#0f1724', borderColor: '#1e2d45', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1e2d45' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accentBg, border: `1px solid ${accentColor}30` }}>
              <Mail className="w-4 h-4" style={{ color: accentColor }} />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Gửi email đánh giá</div>
              <div className="text-xs" style={{ color: accentColor }}>{label} — {state.recipients.length} học sinh</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Recipients */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Người nhận ({state.recipients.length})</div>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl" style={{ background: '#131929', border: '1px solid #1e2d45' }}>
              {state.recipients.slice(0, 20).map(r => (
                <span key={r.userId} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30` }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: accentColor }} />
                  {r.fullName || r.username}
                </span>
              ))}
              {state.recipients.length > 20 && (
                <span className="text-[11px] text-slate-500 px-2 py-0.5">+{state.recipients.length - 20} khác...</span>
              )}
            </div>
          </div>
          {/* Subject */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Tiêu đề email</label>
            <input
              value={state.subject}
              onChange={e => onSubjectChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 outline-none focus:ring-2 transition-all"
              style={{ background: '#131929', border: '1px solid #1e2d45' }}
            />
          </div>
          {/* Body */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Nội dung email</label>
            <textarea
              rows={10}
              value={state.body}
              onChange={e => onBodyChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-slate-200 outline-none resize-none font-mono leading-relaxed transition-all"
              style={{ background: '#131929', border: '1px solid #1e2d45' }}
            />
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: '#1e2d45' }}>
          <button onClick={onClose} disabled={sending}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50">
            Hủy
          </button>
          <button onClick={onSend} disabled={sending}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: `linear-gradient(135deg,${accentColor},${isHigh ? '#dc2626' : isLow ? '#059669' : '#d97706'})`, boxShadow: sending ? 'none' : `0 8px 20px ${accentColor}40` }}>
            {sending ? <><Loader2 className="w-4 h-4 animate-spin" />Đang gửi...</> : <><Send className="w-4 h-4" />Gửi {state.recipients.length} email</>}
          </button>
        </div>
      </div>
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
  const [status, setStatus] = useState<'idle' | 'ok' | 'error' | 'insufficient'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [data, setData] = useState<AnalyticsState>({
    behavioral: [], riskCluster: [], riskPredict: [],
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailModal, setEmailModal] = useState<EmailModalState>({
    open: false, riskLevel: '', recipients: [], subject: '', body: '',
  });

  const runAll = useCallback(async () => {
    try {
      setRunning(true);
      setStatus('idle');
      setErrorMsg('');
      const [beh, riskC, riskP] = await aiService.runAll(classId);

      const behaviorItems = parseCluster(beh);
      setData({
        behavioral: behaviorItems,
        riskCluster: parseCluster(riskC),
        riskPredict: parseRisk(riskP, behaviorItems),
      });

      setStatus('ok');
      toast.success(`Phân tích ${className} hoàn tất!`);
    } catch (e: any) {
      const msg: string = e?.response?.data?.message || e?.message || 'Lỗi không xác định';
      const isColdStart = msg.includes('ngày') || msg.includes('Cần ít nhất') || msg.includes('chưa đủ dữ liệu');
      if (isColdStart) {
        setStatus('insufficient');
        setErrorMsg(msg);
      } else {
        setStatus('error');
        toast.error('Phân tích thất bại: ' + msg);
      }
    } finally {
      setRunning(false);
    }
  }, [classId, className]);

  const openEmailModal = useCallback((riskLevel: string, recipients: RiskItem[]) => {
    const { subject, body } = buildEmailTemplate(riskLevel, className);
    setEmailModal({ open: true, riskLevel, recipients, subject, body });
  }, [className]);

  const handleSendEmail = useCallback(async () => {
    try {
      setSendingEmail(true);
      await aiService.sendRiskEmail(classId, {
        riskLevel: emailModal.riskLevel,
        studentIds: emailModal.recipients.map(r => r.userId),
        subject: emailModal.subject,
        emailBody: emailModal.body,
      });
      toast.success(`Đã gửi ${emailModal.recipients.length} email thành công!`);
      setEmailModal(prev => ({ ...prev, open: false }));
    } catch (e: any) {
      toast.error('Gửi email thất bại: ' + (e?.message || 'Lỗi không xác định'));
    } finally {
      setSendingEmail(false);
    }
  }, [classId, emailModal]);

  // ── stats
  const totalStudents = data.behavioral.length || data.riskPredict.length;
  const behavGroups = new Set(data.behavioral.map(i => i.clusterLabel)).size;
  const highRisk = data.riskPredict.filter(i => i.riskLevel === 'HIGH' || i.riskLevel === 'CAO').length;
  const lowRisk = data.riskPredict.filter(i => i.riskLevel === 'LOW' || i.riskLevel === 'THẤP').length;

  // ── chart data
  const behavChart = groupCount(data.behavioral);
  const riskClusterChart = groupCount(data.riskCluster);
  const riskPredChart = (() => {
    const m: Record<string, number> = {};
    data.riskPredict.forEach(i => { m[i.riskLevel] = (m[i.riskLevel] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  })();

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'behavioral', label: 'Hành vi', icon: '🧠' },
    { key: 'risk', label: 'Nhóm rủi ro', icon: '⚠️' },
    { key: 'predict', label: 'Dự báo rủi ro', icon: '🔮' },
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
            <div className="text-white font-bold text-base leading-tight">Bảng điều khiển phân tích tiến độ học sinh bằng Ai</div>
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
            {status === 'ok'
              ? <><Wifi className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Đã phân tích</span></>
              : status === 'error' ? <><WifiOff className="w-3 h-3 text-red-400" /><span className="text-red-400">Lỗi</span></>
                : status === 'insufficient' ? <><div className="w-2 h-2 rounded-full bg-blue-400" /><span className="text-blue-400">Chưa đủ dữ liệu</span></>
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
            { icon: <Target className="w-5 h-5" />, label: 'Nhóm hành vi', value: behavGroups || '—', color: '#6c63ff' },
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

        {/* TABS — 3 tabs only */}
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
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(108,99,255,.15)', color: '#6c63ff' }}>HÀNH VI</span>
              </div>
              {data.behavioral.length > 0
                ? <ClusterTable items={data.behavioral} colorMap={makeColorMap(data.behavioral)} />
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
                <span className="text-sm font-semibold text-slate-200">📋 Top 50 — Phân loại rủi ro</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,107,107,.15)', color: '#ff6b6b' }}>RỦI RO</span>
              </div>
              {data.riskCluster.length > 0
                ? <ClusterTable items={data.riskCluster} colorMap={makeColorMap(data.riskCluster)} />
                : <EmptyTable />}
            </div>
          </div>
        )}

        {tab === 'predict' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '🟢 Rủi ro Thấp', key: 'THẤP', color: '#10b981', sub: 'học sinh an toàn' },
                { label: '🟡 Rủi ro Trung bình', key: 'TRUNG BÌNH', color: '#f59e0b', sub: 'cần theo dõi' },
                { label: '🔴 Rủi ro Cao', key: 'CAO', color: '#ef4444', sub: 'nguy cơ bỏ học' },
              ].map(g => {
                const count = data.riskPredict.filter(i => i.riskLevel === g.key || i.riskLevel === (g.key === 'CAO' ? 'HIGH' : g.key === 'TRUNG BÌNH' ? 'MEDIUM' : 'LOW')).length;
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
                <div className="flex items-center gap-2">
                  {data.riskPredict.length > 0 && (
                    <>
                      <button
                        onClick={() => {
                          const highStudents = data.riskPredict.filter(i => i.riskLevel === 'CAO' || i.riskLevel === 'HIGH');
                          if (highStudents.length > 0) openEmailModal('CAO', highStudents);
                          else toast.error('Không có học sinh nguy cơ CAO');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Gửi email h/s CAO
                      </button>
                      <button
                        onClick={() => {
                          const lowStudents = data.riskPredict.filter(i => i.riskLevel === 'THẤP' || i.riskLevel === 'LOW');
                          if (lowStudents.length > 0) openEmailModal('THẤP', lowStudents);
                          else toast.error('Không có học sinh rủi ro THẤP');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Gửi email h/s THẤP
                      </button>
                    </>
                  )}
                </div>
              </div>
              {data.riskPredict.length > 0
                ? <RiskTable items={data.riskPredict} onSendOne={(item) => openEmailModal(item.riskLevel, [item])} />
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

        {/* Cold Start — lớp mới chưa đủ dữ liệu */}
        {status === 'insufficient' && (
          <div className="rounded-2xl border p-8 flex flex-col items-center text-center gap-4"
            style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.25)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(59,130,246,0.12)' }}>⏳</div>
            <div>
              <p className="text-blue-300 font-bold text-base mb-2">Lớp học chưa đủ dữ liệu để phân tích AI</p>
              <p className="text-slate-400 text-sm max-w-lg leading-relaxed">{errorMsg}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full max-w-lg mt-2">
              {[
                { icon: '📅', label: 'Cần ít nhất', value: '3 ngày hoạt động' },
                { icon: '📚', label: 'Cần có', value: 'Học sinh học bài' },
                { icon: '📊', label: 'Để AI', value: 'So sánh có ý nghĩa' },
              ].map(tip => (
                <div key={tip.label} className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div className="text-xl mb-1">{tip.icon}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{tip.label}</div>
                  <div className="text-xs font-semibold text-blue-300 mt-0.5">{tip.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EMAIL MODAL */}
      <EmailModal
        state={emailModal}
        sending={sendingEmail}
        onClose={() => setEmailModal(prev => ({ ...prev, open: false }))}
        onSubjectChange={v => setEmailModal(prev => ({ ...prev, subject: v }))}
        onBodyChange={v => setEmailModal(prev => ({ ...prev, body: v }))}
        onSend={handleSendEmail}
      />
    </div>
  );
};

// helpers
const EmptyChart = () => (
  <div className="flex flex-col items-center justify-center h-48 text-slate-600">
    <Brain className="w-8 h-8 mb-2 opacity-30" />
    <span className="text-sm">Nhấn &quot;Chạy phân tích&quot; để xem dữ liệu</span>
  </div>
);

const EmptyTable = () => (
  <div className="flex flex-col items-center justify-center py-10 text-slate-600">
    <span className="text-3xl mb-2">📭</span>
    <span className="text-sm">Chưa có dữ liệu</span>
  </div>
);

export default ClassAiInsights;
