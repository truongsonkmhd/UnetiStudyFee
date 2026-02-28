export interface CacheStats {
    hitCount: number;
    missCount: number;
    loadSuccessCount: number;
    loadFailureCount: number;
    evictionCount: number;
    estimatedSize: number;
    hitRate: number;
    missRate: number;
    averageLoadPenalty: number; 
}
