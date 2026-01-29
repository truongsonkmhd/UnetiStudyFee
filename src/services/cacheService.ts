import apiService from "@/apis/apiService";
import { CacheStats } from "@/model/cache/CacheStats";
import { CacheInfo } from "@/model/cache/CacheInfo";
import { FlushResponse } from "@/model/cache/FlushResponse";

const CACHE_BASE_ENDPOINT = "/admin/managerment-cache";

const cacheService = {
  getStats: (): Promise<Record<string, CacheStats>> => {
    return apiService.get<Record<string, CacheStats>>(`${CACHE_BASE_ENDPOINT}/stats`);
  },

  getInfo: (): Promise<CacheInfo> => {
    return apiService.get<CacheInfo>(`${CACHE_BASE_ENDPOINT}/info`);
  },

  evictCache: (cacheName: string): Promise<void> => {
    return apiService.delete(`${CACHE_BASE_ENDPOINT}/evict/${cacheName}`);
  },

  evictAll: (): Promise<void> => {
    return apiService.delete(`${CACHE_BASE_ENDPOINT}/evict-all`);
  },

  evictSpecific: (type: string): Promise<void> => {
    const endpoints: Record<string, string> = {
      users: `${CACHE_BASE_ENDPOINT}/evict/users`,
      courses: `${CACHE_BASE_ENDPOINT}/evict/courses`,
      quizzes: `${CACHE_BASE_ENDPOINT}/evict/quizzes`,
      lessons: `${CACHE_BASE_ENDPOINT}/evict/lessons`,
      trees: `${CACHE_BASE_ENDPOINT}/evict/published-trees`,
    };
    return apiService.delete(endpoints[type]);
  },

  flushWrites: (): Promise<FlushResponse> => {
    return apiService.post<FlushResponse>(`${CACHE_BASE_ENDPOINT}/flush-writes`);
  },
};

export default cacheService;
