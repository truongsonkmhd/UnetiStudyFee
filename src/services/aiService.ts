import BaseService from "./BaseService";

class AiService extends BaseService {
  private readonly base = "/class";

  /** GET /api/class/{id}/analytics/behavioral → ClusterResponseDTO */
  getBehavioral(classId: string) {
    return this.get(`${this.base}/${classId}/analytics/behavioral`);
  }

  /** GET /api/class/{id}/analytics/performance → ClusterResponseDTO */
  getPerformance(classId: string) {
    return this.get(`${this.base}/${classId}/analytics/performance`);
  }

  /** GET /api/class/{id}/analytics/risk-cluster → ClusterResponseDTO */
  getRiskCluster(classId: string) {
    return this.get(`${this.base}/${classId}/analytics/risk-cluster`);
  }

  /** GET /api/class/{id}/analytics/risk-predict → RiskPredictionResponseDTO */
  getRiskPredict(classId: string) {
    return this.get(`${this.base}/${classId}/analytics/risk-predict`);
  }

  /** Chạy tất cả 4 phân tích song song */
  runAll(classId: string) {
    return Promise.all([
      this.getBehavioral(classId),
      this.getPerformance(classId),
      this.getRiskCluster(classId),
      this.getRiskPredict(classId),
    ]);
  }
}

export default new AiService("");
