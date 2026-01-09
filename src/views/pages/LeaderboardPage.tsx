import React, { useMemo, useState } from "react";

// ================= Types =================
interface Player {
  id: string;
  account: string;
  ho: string;
  ten: string;
  courseName: string;
  groupName: string;
  lop: string;
  avatarUrl?: string;
  correct: number;
  submitted: number;
}

// ================= Mock Data =================
const N = 68;
function makeMock(i: number): Player {
  const hoArr = [
    "Nguyễn",
    "Trần",
    "Lê",
    "Phạm",
    "Hoàng",
    "Vũ",
    "Đặng",
    "Bùi",
    "Đỗ",
    "Phan",
  ];
  const tenArr = [
    "Việt Anh",
    "Đăng Thịnh",
    "Đức Hùng",
    "Mai Thanh",
    "Trọng Hiếu",
    "Thị Hiền",
    "Thảo",
    "Thành",
    "Tuấn Anh",
    "Minh",
  ];
  const ho = hoArr[i % hoArr.length];
  const ten = tenArr[(i * 3) % tenArr.length];
  const correctBase = Math.max(40, 160 - Math.floor(i * 1.5));
  const submitted = correctBase + (i % 3);
  return {
    id: `p${i}`,
    account: `B22DCCN${String(15 + i).padStart(3, "0")}`,
    ho,
    ten,
    courseName: "Cấu trúc dữ liệu và giải thuật",
    groupName: "Nhóm 01",
    lop: [
      "D22TPTDPT1",
      "D22CNPM06",
      "D22HTTT06",
      "D22HTTT04",
      "D22HTTT03",
      "D22CNPM01",
      "D22CNPM03",
    ][i % 7],
    avatarUrl:
      i % 7 === 0 ? `https://i.pravatar.cc/100?img=${(i % 70) + 1}` : undefined,
    correct: correctBase,
    submitted,
  };
}

const RAW: Player[] = Array.from({ length: N }, (_, i) => makeMock(i + 1));

// ================= Helpers =================
function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function rowTone(rank: number): string {
  if (rank <= 10) return "bg-green-200 hover:bg-green-300";
  if (rank <= 20) return "bg-red-100 hover:bg-red-200";
  if (rank <= 30) return "bg-red-200 hover:bg-red-300";
  if (rank <= 40) return "bg-red-300 hover:bg-red-400";
  if (rank <= 50) return "bg-red-400/60 hover:bg-red-400";
  return "hover:bg-gray-50";
}

// ================= Podium Card =================
function PodiumCard({
  rank,
  fullName,
  account,
  course,
  group,
  avatarUrl,
  correct,
  submitted,
}: {
  rank: 1 | 2 | 3;
  fullName: string;
  account: string;
  course: string;
  group: string;
  avatarUrl?: string;
  correct: number;
  submitted: number;
}) {
  const bg =
    rank === 1 ? "bg-[#F9E97B]" : rank === 2 ? "bg-[#EDEDED]" : "bg-[#F6CFB6]";

  // số sao theo hạng
  const stars = rank === 1 ? "⭐⭐⭐" : rank === 2 ? "⭐⭐" : "⭐";

  return (
    <div
      className={`relative rounded-2xl ${bg} border p-6 flex flex-col items-center text-center`}
      style={{ boxShadow: "0 10px 26px rgba(0,0,0,0.10)" }}
    >
      {/* Avatar + huy hiệu */}
      <div className="-mt-10 mb-2">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-300 to-blue-300" />
          <div className="absolute inset-1 rounded-full bg-white/90" />
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center border border-white shadow">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          {/* sao */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 text-xl">
            {stars}
          </div>
        </div>
      </div>

      <div className="text-[18px] font-semibold leading-tight">{fullName}</div>
      <div className="text-xs text-gray-600 font-medium tracking-wide">
        {account}
      </div>
      <div className="text-xs text-gray-600 mt-1">
        {course} – <span className="underline">{group}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 items-center w-full max-w-[260px]">
        <div className="text-green-600 text-[22px] font-semibold text-right pr-3">
          {correct}
        </div>
        <div className="h-10 w-px bg-gray-400 mx-auto" />
        <div className="text-blue-600 text-[22px] font-semibold text-left pl-3">
          {submitted}
        </div>
      </div>
      <div className="grid grid-cols-3 w-full max-w-[260px] -mt-1 text-[13px]">
        <div className="text-green-700 text-right pr-3">Làm đúng</div>
        <div />
        <div className="text-blue-700 text-left pl-3">Đã nộp</div>
      </div>
    </div>
  );
}

// ================= Component =================
export default function LeaderboardPage() {
  const [region, setRegion] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const ranked = useMemo(() => {
    const sorted = [...RAW].sort((a, b) => {
      if (b.correct !== a.correct) return b.correct - a.correct;
      if (a.submitted !== b.submitted) return a.submitted - b.submitted;
      return `${a.ho} ${a.ten}`.localeCompare(`${b.ho} ${b.ten}`, "vi");
    });
    return sorted.map((p, idx) => ({ ...p, rank: idx + 1 }));
  }, [region]);

  const totalPages = Math.max(1, Math.ceil(ranked.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = ranked.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    document
      .getElementById("leaderboard-table-top")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const rawTop3 = ranked.slice(0, 3);

  return (
    <div className="min-h-screen w-full bg-gray-50 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-xl sm:text-2xl font-semibold">Bảng xếp hạng</h1>

        {/* Podium: center highest */}
        <div className="mt-6 flex justify-center items-end gap-6">
          {rawTop3[1] && (
            <div className="w-56 transform scale-90">
              <PodiumCard
                rank={2}
                fullName={`${rawTop3[1].ho} ${rawTop3[1].ten}`}
                account={rawTop3[1].account}
                course={rawTop3[1].courseName}
                group={rawTop3[1].groupName}
                avatarUrl={rawTop3[1].avatarUrl}
                correct={rawTop3[1].correct}
                submitted={rawTop3[1].submitted}
              />
            </div>
          )}
          {rawTop3[0] && (
            <div className="w-56 transform scale-110">
              <PodiumCard
                rank={1}
                fullName={`${rawTop3[0].ho} ${rawTop3[0].ten}`}
                account={rawTop3[0].account}
                course={rawTop3[0].courseName}
                group={rawTop3[0].groupName}
                avatarUrl={rawTop3[0].avatarUrl}
                correct={rawTop3[0].correct}
                submitted={rawTop3[0].submitted}
              />
            </div>
          )}
          {rawTop3[2] && (
            <div className="w-56 transform scale-90">
              <PodiumCard
                rank={3}
                fullName={`${rawTop3[2].ho} ${rawTop3[2].ten}`}
                account={rawTop3[2].account}
                course={rawTop3[2].courseName}
                group={rawTop3[2].groupName}
                avatarUrl={rawTop3[2].avatarUrl}
                correct={rawTop3[2].correct}
                submitted={rawTop3[2].submitted}
              />
            </div>
          )}
        </div>

        {/* Table */}
        <div className="mt-8 bg-white rounded-xl border shadow-sm overflow-hidden">
          <div id="leaderboard-table-top" />
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr className="text-left">
                <th className="px-3 py-2 w-14 text-center">STT</th>
                <th className="px-3 py-2">Ảnh đại diện</th>
                <th className="px-3 py-2">Tài khoản</th>
                <th className="px-3 py-2">Họ</th>
                <th className="px-3 py-2">Tên</th>
                <th className="px-3 py-2">Lớp học</th>
                <th className="px-3 py-2">Lớp</th>
                <th className="px-3 py-2 text-center">Làm đúng</th>
                <th className="px-3 py-2 text-center">Đã nộp</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((p) => (
                <tr
                  key={p.id}
                  className={classNames("border-b", rowTone((p as any).rank))}
                >
                  <td className="px-3 py-2 text-center font-medium">
                    {(p as any).rank}
                  </td>
                  <td className="px-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {p.avatarUrl ? (
                        <img
                          src={p.avatarUrl}
                          alt={`${p.ho} ${p.ten}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono">{p.account}</td>
                  <td className="px-3 py-2">{p.ho}</td>
                  <td className="px-3 py-2 font-medium">{p.ten}</td>
                  <td className="px-3 py-2">
                    <div>{p.courseName}</div>
                    <div className="text-blue-600 underline">{p.groupName}</div>
                  </td>
                  <td className="px-3 py-2">{p.lop}</td>
                  <td className="px-3 py-2 text-center font-semibold text-green-700">
                    {p.correct}
                  </td>
                  <td className="px-3 py-2 text-center text-blue-700">
                    {p.submitted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 py-4">
            <button
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 px-3 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              ◀
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                if (totalPages <= 7) return true;
                if (p === 1 || p === totalPages) return true;
                if (Math.abs(p - currentPage) <= 1) return true;
                if (p === 3 || p === totalPages - 2) return true;
                return false;
              })
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const needDots = prev && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {needDots && <span className="px-1">…</span>}
                    <button
                      onClick={() => goTo(p)}
                      className={`h-9 w-9 rounded-md border text-sm ${
                        p === currentPage
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => goTo(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-9 px-3 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
