import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  Trash2,
  Activity,
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Layers,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { CacheStats } from '@/model/cache/CacheStats';
import { CacheInfo } from '@/model/cache/CacheInfo';
import cacheService from '@/services/cacheService';

const CacheManagementPage = () => {
  const [allStats, setAllStats] = useState<Record<string, CacheStats>>({});
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      const response = await cacheService.getStats();
      setAllStats(response);
      setLastUpdate(new Date());
    } catch (error) {
      toast.error('Failed to fetch cache statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCacheInfo = async () => {
    try {
      const response = await cacheService.getInfo();
      setCacheInfo(response);
    } catch (error) {
      console.error('Failed to fetch cache info', error);
    }
  };

  useEffect(() => {
    fetchAllStats();
    fetchCacheInfo();
    const interval = setInterval(() => {
      fetchAllStats();
      fetchCacheInfo();
    }, 30000); // Auto-refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleEvictCache = async (cacheName: string) => {
    if (!confirm(`Are you sure you want to evict all entries in ${cacheName}?`)) return;

    try {
      await cacheService.evictCache(cacheName);
      toast.success(`Cache ${cacheName} evicted successfully`);
      fetchAllStats();
    } catch (error) {
      toast.error(`Failed to evict cache ${cacheName}`);
    }
  };

  const handleEvictAll = async () => {
    if (!confirm('Are you sure you want to evict ALL caches?')) return;

    try {
      await cacheService.evictAll();
      toast.success('All caches evicted successfully');
      fetchAllStats();
      fetchCacheInfo();
    } catch (error) {
      toast.error('Failed to evict all caches');
    }
  };

  const handleEvictSpecific = async (type: string) => {
    if (!confirm(`Are you sure you want to evict all ${type} caches?`)) return;

    try {
      await cacheService.evictSpecific(type);
      toast.success(`${type} caches evicted successfully`);
      fetchAllStats();
    } catch (error) {
      toast.error(`Failed to evict ${type} caches`);
    }
  };

  const handleFlushWrites = async () => {
    try {
      const response = await cacheService.flushWrites();
      toast.success(
        `Flushed ${response.beforeSize - response.afterSize} pending writes`
      );
      fetchCacheInfo();
    } catch (error) {
      toast.error('Failed to flush write-behind buffer');
    }
  };


  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercent = (num: number) => {
    return `${(num * 100).toFixed(2)}%`;
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(2)}ms`;
  };

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 0.9) return 'text-green-600';
    if (hitRate >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Cache Control Center</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Real-time monitoring and management of application layer caches
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="shadow-sm hover:bg-primary/5 transition-all"
            onClick={() => {
              fetchAllStats();
              fetchCacheInfo();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Stats
          </Button>
          <Button
            variant="destructive"
            className="shadow-sm hover:bg-destructive/90 transition-all font-semibold"
            onClick={handleEvictAll}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Purge All
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Units</p>
                <p className="text-3xl font-bold mt-1 text-blue-600 font-mono">
                  {loading ? '...' : (cacheInfo?.totalCaches || 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500">
                <Database className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Buffer Size</p>
                <p className="text-3xl font-bold mt-1 text-amber-600 font-mono">
                  {loading ? '...' : (cacheInfo?.writeBehindBufferSize || 0)}
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-500">
                <Layers className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-rose-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sync Status</p>
                <div className="mt-2 text-rose-600">
                  {loading ? (
                    <span className="text-2xl font-bold font-mono">...</span>
                  ) : cacheInfo?.hasPendingWrites ? (
                    <Badge variant="destructive" className="animate-pulse px-3 py-1 uppercase text-[10px] tracking-widest">
                      Unsynced
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 uppercase text-[10px] tracking-widest border-emerald-200">
                      Synchronized
                    </Badge>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl transition-colors ${cacheInfo?.hasPendingWrites
                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500'
                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
                }`}>
                {cacheInfo?.hasPendingWrites ? (
                  <AlertCircle className="h-8 w-8" />
                ) : (
                  <CheckCircle className="h-8 w-8" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-l-4 border-l-indigo-500 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Uptime Status</p>
                <p className="text-xl font-bold mt-1 text-indigo-600 font-mono flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-500">
                <Zap className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-none bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            Global Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: 'users', label: 'Users', color: 'hover:bg-blue-500' },
              { id: 'courses', label: 'Courses', color: 'hover:bg-emerald-500' },
              { id: 'quizzes', label: 'Quizzes', color: 'hover:bg-amber-500' },
              { id: 'lessons', label: 'Lessons', color: 'hover:bg-purple-500' },
              { id: 'trees', label: 'Trees', color: 'hover:bg-rose-500' },
            ].map((action) => (
              <Button
                key={action.id}
                variant="outline"
                onClick={() => handleEvictSpecific(action.id)}
                className={`w-full bg-white/10 border-white/20 hover:text-white transition-all ${action.color}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Flush {action.label}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={handleFlushWrites}
              className="w-full bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500 hover:text-white transition-all text-yellow-400"
              disabled={!cacheInfo?.hasPendingWrites}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Write
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cache Statistics Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <div className="h-px flex-grow bg-gradient-to-r from-border to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          {Object.entries(allStats).map(([cacheName, stats]) => (
            <Card key={cacheName} className="group hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className="w-2 h-6 bg-primary rounded-full" />
                    {cacheName.split('.').pop() || cacheName}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">{cacheName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                  onClick={() => handleEvictCache(cacheName)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {/* Hit Rate Visualization */}
                <div className="mt-2 mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">Performance</span>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase text-muted-foreground leading-none mb-1">Hit Rate</span>
                        <span className={`text-2xl font-black font-mono leading-none ${getHitRateColor(stats.hitRate)}`}>
                          {formatPercent(stats.hitRate)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end border-l pl-4">
                        <span className="text-[10px] uppercase text-muted-foreground leading-none mb-1">Miss Rate</span>
                        <span className="text-2xl font-black font-mono leading-none text-rose-500">
                          {formatPercent(stats.missRate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 p-1 border shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${stats.hitRate >= 0.9
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : stats.hitRate >= 0.7
                          ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                          : 'bg-gradient-to-r from-rose-400 to-rose-600'
                        }`}
                      style={{ width: `${stats.hitRate * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-2 border-t mt-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cache Hits</p>
                    <p className="text-lg font-bold font-mono text-emerald-600">{formatNumber(stats.hitCount)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cache Misses</p>
                    <p className="text-lg font-bold font-mono text-rose-600">{formatNumber(stats.missCount)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Evictions</p>
                    <p className="text-lg font-bold font-mono text-amber-600">{formatNumber(stats.evictionCount)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 p-3 bg-muted/50 rounded-lg border border-dashed text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Load Delay:</span>
                    <span className="font-mono font-bold">{formatTime(stats.averageLoadPenalty)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Size:</span>
                    <span className="font-mono font-bold">{formatNumber(stats.estimatedSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Load Success:</span>
                    <span className="font-mono font-bold text-emerald-600">{formatNumber(stats.loadSuccessCount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Load Failure:</span>
                    <span className="font-mono font-bold text-rose-600">{formatNumber(stats.loadFailureCount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {Object.keys(allStats).length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 border rounded-2xl bg-muted/20 border-dashed">
            <Layers className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-xl font-medium text-muted-foreground">No active cache instances detected</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Caching layers will appear here once requested by the application</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CacheManagementPage;