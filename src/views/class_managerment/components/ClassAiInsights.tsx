import React, { useState, useEffect } from 'react';
import { Brain, PieChart as PieChartIcon, AlertTriangle, RefreshCw, User, CheckCircle2, Search } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import aiService from '@/services/aiService';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { emptyIcon } from '@/assets';
import { motion } from 'framer-motion';

interface AiInsight {
    userId: string;
    username: string;
    fullName: string;
    avatar: string;
    insightValue: string;
    score: number;
}

interface ClassAiInsightsProps {
    classId: string;
    className: string;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

const ClassAiInsights: React.FC<ClassAiInsightsProps> = ({ classId, className }) => {
    const [insightType, setInsightType] = useState<'CLUSTER' | 'RISK'>('CLUSTER');
    const [insights, setInsights] = useState<AiInsight[]>([]);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const data = await aiService.getInsights(classId, insightType);
            setInsights(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching insights:', err);
            toast.error('Không thể tải dữ liệu AI');
            setInsights([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRunAnalysis = async () => {
        try {
            setAnalyzing(true);
            await aiService.triggerAnalysis(classId, insightType);
            toast.success('Phân tích AI hoàn tất');
            fetchInsights();
        } catch (err) {
            console.error('Error running analysis:', err);
            toast.error('Phân tích AI thất bại');
        } finally {
            setAnalyzing(false);
        }
    };

    useEffect(() => {
        if (classId) fetchInsights();
    }, [classId, insightType]);

    const getChartData = () => {
        if (!Array.isArray(insights)) return [];
        const counts: Record<string, number> = {};
        insights.forEach(item => {
            if (item && item.insightValue) {
                counts[item.insightValue] = (counts[item.insightValue] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    };

    const filteredInsights = Array.isArray(insights)
        ? insights.filter(item =>
            (item.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.username || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const chartData = getChartData();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border">
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <button
                        onClick={() => setInsightType('CLUSTER')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${insightType === 'CLUSTER' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <PieChartIcon className="w-4 h-4" />
                        Phân nhóm học viên
                    </button>
                    <button
                        onClick={() => setInsightType('RISK')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${insightType === 'RISK' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Dự đoán rủi ro
                    </button>
                </div>

                <button
                    onClick={handleRunAnalysis}
                    disabled={analyzing}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-bold"
                >
                    <Brain className={`w-4 h-4 ${analyzing ? 'animate-pulse' : ''}`} />
                    {analyzing ? 'Đang phân tích...' : 'Chạy phân tích AI'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-card rounded-xl border border-border p-6">
                    <h4 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-primary" />
                        Biểu đồ phân phối
                    </h4>
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
                            </div>
                        ) : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Legend verticalAlign="bottom" align="center" />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState
                                title="Chưa có dữ liệu phân tích"
                                description="Vui lòng thực hiện phân tích dữ liệu cho lớp học này trước."
                                iconSize="w-24 h-24"
                            />
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                        <h4 className="font-bold text-foreground">Chi tiết học viên</h4>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Tìm học viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-md text-xs focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr>
                                    <th className="px-4 py-3 text-left">Học viên</th>
                                    <th className="px-4 py-3 text-left">{insightType === 'CLUSTER' ? 'Phân nhóm' : 'Mức độ rủi ro'}</th>
                                    <th className="px-4 py-3 text-right">{insightType === 'CLUSTER' ? 'Độ tin cậy' : 'Xác suất rủi ro'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Đang tải...</td>
                                    </tr>
                                ) : filteredInsights.length > 0 ? (
                                    filteredInsights.map((item) => (
                                        <tr key={item.userId} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {item.avatar ? <img src={item.avatar} alt="" className="w-full h-full rounded-full" /> : item.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground">{item.fullName}</div>
                                                        <div className="text-xs text-muted-foreground">@{item.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.insightValue.toLowerCase().includes('risk') || item.insightValue === 'HIGH'
                                                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                                    : item.insightValue === 'MEDIUM' || item.insightValue.toLowerCase().includes('chậm')
                                                        ? 'bg-warning/10 text-warning border border-warning/20'
                                                        : 'bg-primary/10 text-primary border border-primary/20'
                                                    }`}>
                                                    {item.insightValue}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono font-medium">
                                                {(item.score * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="relative group">
                                                    <motion.div
                                                        animate={{ y: [0, -8, 0] }}
                                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                        className="w-20 h-20 bg-card rounded-2xl flex items-center justify-center border border-border/50 overflow-hidden relative z-10"
                                                    >
                                                        <motion.img
                                                            src={emptyIcon}
                                                            alt="Empty"
                                                            className="w-12 h-12 object-contain"
                                                            animate={{ rotate: [-2, 2, -2] }}
                                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                        />
                                                    </motion.div>

                                                </div>
                                                <span className="font-bold uppercase tracking-widest text-[10px]">Không tìm thấy học viên nào</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassAiInsights;
