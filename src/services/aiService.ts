import BaseService from "./BaseService";

class AiService extends BaseService {
    private readonly endpoint = "/admin/ai";

    triggerAnalysis(classId: string, type: "CLUSTER" | "RISK") {
        return this.post(`${this.endpoint}/classes/${classId}/analyze?type=${type}`, {});
    }

    getInsights(classId: string, type: "CLUSTER" | "RISK") {
        return this.get(`${this.endpoint}/classes/${classId}/insights?type=${type}`);
    }
}

export default new AiService("");
