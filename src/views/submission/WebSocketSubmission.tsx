import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import SockJS from "sockjs-client";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { console } from "inspector";

// ================== Types ==================
type Verdict =
  | "PENDING"
  | "RUNNING"
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "COMPILATION_ERROR"
  | "RUNTIME_ERROR"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | string;

type SubmissionDTO = {
  submissionId?: string;
  verdict?: Verdict;
  passedTestcases?: number;
  totalTestcases?: number;
  score?: number;
  runtimeMs?: number | null;
  memoryKb?: number | null;
  language?: string | null;
  submittedAt?: string | number | Date | null;
};

type WsStatusMessage = { status: Verdict };
type WsMessage = SubmissionDTO & Partial<WsStatusMessage>;

type ApiResponse<T> = {
  data: T;
  message?: string;
  status?: number;
};

type VerdictConfig = {
  icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
  animate?: string;
};

const VERDICT_CONFIG: Record<string, VerdictConfig> = {
  PENDING: { icon: Clock, color: "text-gray-500", bg: "bg-gray-100", label: "Đang chờ" },
  RUNNING: { icon: Loader2, color: "text-blue-500", bg: "bg-blue-100", label: "Đang chấm", animate: "animate-spin" },
  ACCEPTED: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100", label: "Accepted" },
  WRONG_ANSWER: { icon: XCircle, color: "text-red-500", bg: "bg-red-100", label: "Wrong Answer" },
  COMPILATION_ERROR: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-100", label: "Compilation Error" },
  RUNTIME_ERROR: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-100", label: "Runtime Error" },
  TIME_LIMIT_EXCEEDED: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-100", label: "TLE" },
  MEMORY_LIMIT_EXCEEDED: { icon: AlertCircle, color: "text-purple-500", bg: "bg-purple-100", label: "MLE" },
};

// ===== helper: parse JWT payload (không verify signature, chỉ decode để lấy userId) =====
function getUserIdFromJwt(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    // trong token của bạn đang là "userID" (chữ D hoa) -> map luôn cả 2
    return (json.userId ?? json.userID ?? json.userID ?? null) as string | null;
  } catch {
    return null;
  }
}

export default function ClassManagementDashboardWebSocketSubmission() {
  const [submission, setSubmission] = useState<SubmissionDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);

  // ====== Config ======
  const wsUrl = "http://localhost:8097/ws-submission";
  const submitUrl = "http://localhost:8097/api/judge/submitMQ";

  // ❗ ĐỪNG hardcode token trong code thật. Tạm thời theo bạn đưa.
  const token =
    "eyJhbGciOiJIUzI1NiJ9.eyJjbGFzc0lkIjoiREhUSTE2QTNITiIsInNjb3BlIjoiUk9MRV9URUFDSEVSIFVQREFURV9EQVRBIFVQTE9BRF9EQVRBIENSRUFURV9EQVRBIFZJRVdfREFUQSIsInVzZXJOYW1lIjoidHJ1b25nc29ua21oZDIiLCJ1c2VySUQiOiI2OTM3MzA5Zi1jOTU0LTRlYmMtYTE2Yy03MmIyYjgyYWY4NjkiLCJzdWIiOiJ0cnVvbmdzb25rbWhkMiIsImlhdCI6MTc2ODc5ODg2MiwiZXhwIjoxNzY4ODg1MjYyfQ.yXi0KBQ_zG72M7w7nNHMgMK_j1asKU2SpQc4l73qPpw";

  const userId = useMemo(() => {
    // trong payload token của bạn là "userID" -> hàm đã handle
    return getUserIdFromJwt(token) ?? "6937309f-c954-4ebc-a16c-72b2b82af869";
  }, [token]);

  const addLog = (message: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${ts}] ${message}`]);
  };

  // ================== Connect WebSocket (map theo code JS) ==================
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as any,
      reconnectDelay: 3000,

      // (optional) nếu bạn muốn gửi token ở STOMP CONNECT headers:
      // connectHeaders: { Authorization: `Bearer ${token}` },

      onConnect: () => {
        setIsConnected(true);
        addLog("✅ WebSocket connected");

        // Subscribe đúng như code JS
        const dest = `/queue/submission/${userId}`;
        addLog(`📡 Subscribe: ${dest}`);

        subscriptionRef.current = client.subscribe(dest, (message: IMessage) => {
          let data: WsMessage;
          try {
            data = JSON.parse(message.body) as WsMessage;
          } catch (e) {
            addLog("❌ Invalid JSON: " + String(e));
            return;
          }

          addLog(`📨 Received: ${data.verdict ?? data.status ?? "UNKNOWN"}`);

          // Full result
          if (data.submissionId && data.verdict) {
            setSubmission(data);
            return;
          }

          // Status-only update
          if (data.status) {
            setSubmission((prev) => (prev ? { ...prev, verdict: data.status } : prev));
          }
        });

        stompClientRef.current = client;
      },

      onWebSocketClose: () => {
        setIsConnected(false);
        addLog("❌ WebSocket closed");
      },
      onDisconnect: () => {
        setIsConnected(false);
        addLog("❌ WebSocket disconnected");
      },
      onWebSocketError: () => {
        setIsConnected(false);
        addLog("❌ WebSocket error");
      },
      onStompError: (frame) => {
        setIsConnected(false);
        addLog("❌ STOMP error: " + (frame.headers["message"] ?? "unknown"));
        if (frame.body) addLog("❌ Details: " + frame.body);
      },
    });

    stompClientRef.current = client;
    client.activate();

    return () => {
      try {
        subscriptionRef.current?.unsubscribe();
      } catch {}
      subscriptionRef.current = null;

      try {
        stompClientRef.current?.deactivate();
      } catch {}
      stompClientRef.current = null;
    };
  }, [wsUrl, userId, token]);

  // ================== Submit (map theo code JS) ==================
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmission(null);
    addLog("🚀 Submitting code...");

    try {
      const response = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ token vào API submit
        },
        body: JSON.stringify({
          exerciseId: "1453710e-4e61-428a-8254-4b602d5b5a37",
          sourceCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long a = sc.nextLong();
        long b = sc.nextLong();
        System.out.println(a + b);
        sc.close();
    }
}`,
          language: "java",
        }),
      });

      const json = (await response.json()) as ApiResponse<SubmissionDTO>;

      if (!response.ok) {
        addLog(`❌ Submit failed: HTTP ${response.status}`);
        return;
      }

      if (!json?.data?.submissionId) {
        addLog("❌ Submit response missing submissionId");
        return;
      }

      setSubmission(json.data);
      addLog(`✅ Submitted: ${json.data.submissionId.slice(0, 8)}...`);
      addLog("⏳ Waiting for judge result via WebSocket...");
    } catch (err: any) {
      addLog("❌ Submit error: " + (err?.message ?? String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSubmission = () => {
    if (!submission) return null;

    const verdict = submission.verdict ?? "PENDING";
    const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.PENDING;
    const Icon = config.icon;

    const done = !["PENDING", "RUNNING"].includes(String(verdict));
    const submittedAt = submission.submittedAt != null ? new Date(submission.submittedAt) : null;

    return (
      <div className="mt-6 p-6 bg-white rounded-lg shadow-lg border-2 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Kết quả chấm</h3>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-gray-500 font-mono">
              {submission.submissionId?.slice(0, 13)}
            </span>
          </div>
        </div>

        <div className={`flex items-center gap-4 p-5 rounded-xl ${config.bg} mb-6 shadow-sm`}>
          <Icon className={`w-8 h-8 ${config.color} ${config.animate || ""}`} />
          <div className="flex-1">
            <div className={`font-bold text-lg ${config.color}`}>{config.label}</div>
            <div className="text-sm text-gray-600 mt-1">
              {verdict === "PENDING" && "⏳ Đang xếp hàng..."}
              {verdict === "RUNNING" && "🔄 Đang chấm bài, vui lòng đợi..."}
              {done && <>✅ Hoàn thành lúc {submittedAt ? submittedAt.toLocaleTimeString() : "(unknown)"}</>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm">
            <div className="text-xs text-blue-600 font-semibold mb-1">Test Cases</div>
            <div className="text-3xl font-bold text-blue-700">
              {submission.passedTestcases ?? 0} / {submission.totalTestcases ?? 0}
            </div>
            <div className="text-xs text-blue-500 mt-1">
              {(submission.totalTestcases ?? 0) > 0 &&
                `${Math.round(((submission.passedTestcases ?? 0) / (submission.totalTestcases ?? 1)) * 100)}%`}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm">
            <div className="text-xs text-green-600 font-semibold mb-1">Điểm số</div>
            <div className="text-3xl font-bold text-green-700">{submission.score ?? 0}</div>
            <div className="text-xs text-green-500 mt-1">points</div>
          </div>

          {submission.runtimeMs != null && (
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm">
              <div className="text-xs text-purple-600 font-semibold mb-1">Runtime</div>
              <div className="text-xl font-bold text-purple-700">{submission.runtimeMs} ms</div>
            </div>
          )}

          {submission.memoryKb != null && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg shadow-sm">
              <div className="text-xs text-orange-600 font-semibold mb-1">Memory</div>
              <div className="text-xl font-bold text-orange-700">{(submission.memoryKb / 1024).toFixed(2)} MB</div>
            </div>
          )}
        </div>

        {done && (
          <div className="mt-6 pt-4 border-t-2 border-gray-200">
            {verdict === "ACCEPTED" ? (
              <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                <CheckCircle className="w-6 h-6" />
                <div>
                  <div className="font-bold">Chúc mừng!</div>
                  <div className="text-sm">Bạn đã giải đúng bài này với {submission.score ?? 0} điểm!</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-lg">
                <XCircle className="w-6 h-6" />
                <div>
                  <div className="font-bold">Chưa đúng</div>
                  <div className="text-sm">Hãy kiểm tra lại code và thử lại nhé!</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl shadow-2xl mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">WebSocket Judge System</h1>
              <p className="text-blue-100">Realtime submission results với WebSocket</p>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              {isConnected ? (
                <>
                  <Wifi className="w-5 h-5 text-green-300" />
                  <span className="text-sm font-semibold">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-300" />
                  <span className="text-sm font-semibold">Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !isConnected}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                     disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl
                     shadow-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Đang submit...
            </>
          ) : (
            <>🚀 Submit Code (A + B Problem)</>
          )}
        </button>

        {renderSubmission()}

        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-800">📋 Activity Logs</h4>
            <button onClick={() => setLogs([])} className="text-xs text-gray-500 hover:text-red-500">
              Clear
            </button>
          </div>

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs max-h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
          <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            WebSocket Flow
          </h4>
          <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
            <li>
              <strong>Connect WebSocket</strong> → Subscribe to <code>/queue/submission/{userId}</code>
            </li>
            <li>
              <strong>Submit Code</strong> → POST /submitMQ → Nhận submissionId (PENDING)
            </li>
            <li>
              <strong>Backend chấm bài</strong> → RabbitMQ Consumer xử lý
            </li>
            <li>
              <strong>Consumer push qua WebSocket</strong>:
              <ul className="ml-6 mt-1 space-y-1 list-disc">
                <li>Status: RUNNING</li>
                <li>Result: ACCEPTED/WA với score, testcases</li>
              </ul>
            </li>
            <li>
              <strong>Frontend nhận realtime</strong> → Không cần polling!
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
