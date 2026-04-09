import BaseService from "./BaseService";

class AiService extends BaseService {
  private readonly base = "/class";

  /** GET /api/class/{id}/analytics/behavioral → ClusterResponseDTO */
  getBehavioral(classId: string) {
    return this.get(`${this.base}/${classId}/analytics/behavioral`);
  }

  /** GET /api/class/{id}/analytics/risk-cluster → ClusterResponseDTO */
  getRiskCluster(classId: string) {
    return this.get(`${this.base}/${classId}/analytics/risk-cluster`);
  }

  /** GET /api/class/{id}/analytics/risk-predict → RiskPredictionResponseDTO */
  getRiskPredict(classId: string) {
    return this.get(`${this.base}/${classId}/analytics/risk-predict`);
  }

  /** Chạy tất cả 3 phân tích song song (bỏ Performance) */
  runAll(classId: string) {
    return Promise.all([
      this.getBehavioral(classId),
      this.getRiskCluster(classId),
      this.getRiskPredict(classId),
    ]);
  }

  /**
   * POST /api/class/{classId}/analytics/send-risk-email
   * Gửi email đánh giá/cảnh báo rủi ro đến học sinh
   */
  sendRiskEmail(
    classId: string,
    payload: {
      riskLevel: string;
      studentIds: string[];
      subject: string;
      emailBody: string;
    }
  ) {
    return this.post(`${this.base}/${classId}/analytics/send-risk-email`, payload);
  }
}

export default new AiService("");
