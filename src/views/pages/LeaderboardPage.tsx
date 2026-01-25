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
  if (rank <= 10) return "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400";
  if (rank <= 20) return "bg-rose-500/5 hover:bg-rose-500/10";
  if (rank <= 30) return "bg-rose-500/10 hover:bg-rose-500/15";
  if (rank <= 40) return "bg-rose-500/15 hover:bg-rose-500/20";
  if (rank <= 50) return "bg-rose-500/20 hover:bg-rose-500/25";
  return "hover:bg-muted/50";
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
    rank === 1 ? "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800" :
      rank === 2 ? "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700" :
        "bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";

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
          <div className="absolute inset-1 rounded-full bg-background" />
          <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center border border-border shadow">
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

      <div className="text-[18px] font-bold leading-tight text-foreground">{fullName}</div>
      <div className="text-xs text-muted-foreground font-medium tracking-wide">
        {account}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {course} – <span className="underline decoration-primary/30">{group}</span>
      </div>

      <div className="mt-4 grid grid-cols-3 items-center w-full max-w-[260px]">
        <div className="text-emerald-500 text-[22px] font-bold text-right pr-3">
          {correct}
        </div>
        <div className="h-10 w-px bg-border mx-auto" />
        <div className="text-primary text-[22px] font-bold text-left pl-3">
          {submitted}
        </div>
      </div>
      <div className="grid grid-cols-3 w-full max-w-[260px] -mt-1 text-[11px] font-bold uppercase tracking-tighter">
        <div className="text-emerald-600/70 text-right pr-3">Làm đúng</div>
        <div />
        <div className="text-primary/70 text-left pl-3">Đã nộp</div>
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
    <div className="min-h-screen w-full bg-background py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Bảng xếp hạng</h1>

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
        <div className="mt-8 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div id="leaderboard-table-top" />
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr className="text-left text-muted-foreground font-bold uppercase text-[10px] tracking-wider">
                <th className="px-4 py-4 text-center">STT</th>
                <th className="px-4 py-4">Ảnh đại diện</th>
                <th className="px-4 py-4">Tài khoản</th>
                <th className="px-4 py-4">Họ</th>
                <th className="px-4 py-4">Tên</th>
                <th className="px-4 py-4">Lớp học</th>
                <th className="px-4 py-4">Lớp</th>
                <th className="px-4 py-4 text-center">Làm đúng</th>
                <th className="px-4 py-4 text-center">Đã nộp</th>
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
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-full bg-muted border border-border overflow-hidden flex items-center justify-center shadow-sm">
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
                  <td className="px-4 py-3 font-mono text-xs">{p.account}</td>
                  <td className="px-4 py-3">{p.ho}</td>
                  <td className="px-4 py-3 font-bold text-foreground">{p.ten}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.courseName}</div>
                    <div className="text-[10px] text-primary font-bold uppercase tracking-tight">{p.groupName}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.lop}</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-500">
                    {p.correct}
                  </td>
                  <td className="px-4 py-3 text-center text-primary font-medium">
                    {p.submitted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 py-6 border-t border-border bg-muted/20">
            <button
              onClick={() => goTo(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 px-4 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-30 transition-all text-xs font-bold"
            >
              PREV
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
                      className={`h-9 w-9 rounded-xl border text-xs font-bold transition-all ${p === currentPage
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                          : "bg-background border-border hover:bg-muted text-muted-foreground"
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
              className="h-9 px-4 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-30 transition-all text-xs font-bold"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
