import React, { useMemo, useRef, useState } from "react";

// ==== Types ====
interface VideoLesson {
  id: string;
  title: string;
  duration: string;
  chapter: string;
  order: number;
  videoUrl?: string;
}

interface CourseChapter {
  id: string;
  title: string;
  lessons: VideoLesson[];
}

interface CommentItem {
  id: string;
  author: string;
  timeAgo: string;
  content: string;
  parentId?: string;
}

// ==== Mock Data (12 bài) ====
const mockVideoCourse: CourseChapter[] = [
  {
    id: "ch1",
    title: "1. Khái niệm kỹ thuật căn bản",
    lessons: [
      {
        id: "v1",
        order: 1,
        title: "Mô hình Client - Server là gì?",
        duration: "11:35",
        chapter: "ch1",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        id: "v2",
        order: 2,
        title: "Domain là gì? Tên miền là gì?",
        duration: "09:13",
        chapter: "ch1",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        id: "v3",
        order: 3,
        title: "Mua áo F8 | Đăng ký học Offline",
        duration: "08:46",
        chapter: "ch1",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
    ],
  },
  {
    id: "ch2",
    title: "2. Môi trường, con người IT",
    lessons: [
      {
        id: "v4",
        order: 1,
        title: "Môi trường lập trình",
        duration: "16:44",
        chapter: "ch2",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        id: "v5",
        order: 2,
        title: "Các vị trí trong ngành IT",
        duration: "14:22",
        chapter: "ch2",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        id: "v6",
        order: 3,
        title: "Công cụ thường dùng",
        duration: "10:03",
        chapter: "ch2",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        id: "v7",
        order: 4,
        title: "Văn hóa code",
        duration: "07:31",
        chapter: "ch2",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
    ],
  },
  {
    id: "ch3",
    title: "3. Phương pháp, định hướng",
    lessons: [
      {
        id: "v8",
        order: 1,
        title: "Định hướng học tập IT",
        duration: "12:07",
        chapter: "ch3",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        id: "v9",
        order: 2,
        title: "Cách tự học hiệu quả",
        duration: "11:28",
        chapter: "ch3",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        id: "v10",
        order: 3,
        title: "Ghi chép & quản lý thời gian",
        duration: "09:55",
        chapter: "ch3",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
    ],
  },
  {
    id: "ch4",
    title: "4. Hoàn thành khóa học",
    lessons: [
      {
        id: "v11",
        order: 1,
        title: "Tổng kết khóa học",
        duration: "13:02",
        chapter: "ch4",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
      {
        id: "v12",
        order: 2,
        title: "Bước tiếp theo",
        duration: "08:10",
        chapter: "ch4",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
    ],
  },
];

const mockComments: CommentItem[] = [
  {
    id: "c1",
    author: "Anh Quỳnh",
    timeAgo: "1 tháng trước",
    content: "2 cái app mà a nói là gì vậy ạ, em nhìn không ra",
  },
  { id: "c2", author: "Hoàng Kha", timeAgo: "1 tháng trước", content: "hay ạ" },
  {
    id: "c3",
    author: "MR CROW",
    timeAgo: "3 tháng trước",
    content:
      "Anh giảng viên nói hơi nhanh nhưng vẫn hiểu được, mong F8 cho anh giảng viên 1 cái mic để nghe rõ hơn",
  },
];

// ==== Helpers ====
const flattenLessons = (course: CourseChapter[]) =>
  course.flatMap((ch) =>
    ch.lessons.map((ls) => ({ ...ls, chapterTitle: ch.title }))
  );
function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// ==== Component ====
export default function VideoCoursePlayer() {
  const flatLessons = useMemo(() => flattenLessons(mockVideoCourse), []);
  const [currentLessonId, setCurrentLessonId] = useState<string>(
    flatLessons[0].id
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    ch1: true,
  });

  // trạng thái theo từng bài: thời lượng xem hợp lệ, mốc tua xa nhất hợp lệ, tổng duration, hoàn thành
  const [progress, setProgress] = useState<
    Record<
      string,
      {
        completed: boolean;
        watchedSeconds: number;
        allowedTime: number;
        duration: number;
      }
    >
  >(() => {
    const map: Record<
      string,
      {
        completed: boolean;
        watchedSeconds: number;
        allowedTime: number;
        duration: number;
      }
    > = {};
    mockVideoCourse.forEach((ch) =>
      ch.lessons.forEach(
        (l) =>
        (map[l.id] = {
          completed: false,
          watchedSeconds: 0,
          allowedTime: 0,
          duration: 0,
        })
      )
    );
    return map;
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastTimeRef = useRef<number>(0);

  const currentIndex = flatLessons.findIndex((l) => l.id === currentLessonId);
  const currentLesson = flatLessons[currentIndex];

  const completedCount = useMemo(
    () => Object.values(progress).filter((p) => p.completed).length,
    [progress]
  );
  const totalLessons = flatLessons.length; // 12

  // =================== Q&A Drawer (2 cấp) ===================
  type Reply = {
    id: string;
    author: string;
    timeAgo: string;
    content: string;
    likes?: number;
  };
  type Comment = {
    id: string;
    author: string;
    timeAgo: string;
    content: string;
    likes?: number;
    replies: Reply[];
  };
  const [qaOpen, setQaOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c1",
      author: "Anh Quỳnh",
      timeAgo: "1 tháng trước",
      content: "2 cái app mà a nói là gì vậy ạ, em nhìn không ra",
      likes: 0,
      replies: [
        {
          id: "r1",
          author: "Mentor",
          timeAgo: "1 tháng trước",
          content: "Là Client và Server bạn nhé.",
        },
      ],
    },
    {
      id: "c2",
      author: "hoang kha",
      timeAgo: "1 tháng trước",
      content: "hay ạ",
      likes: 0,
      replies: [],
    },
    {
      id: "c3",
      author: "MR CROW",
      timeAgo: "3 tháng trước",
      content: "Anh giảng nói hơi nhanh nhưng vẫn hiểu được.",
      likes: 1,
      replies: [],
    },
  ]);
  const [newCmt, setNewCmt] = useState("");
  const [replyTo, setReplyTo] = useState<{
    commentId: string;
    mention: string;
  } | null>(null); // chỉ reply cấp 2 trên comment cha

  const submitComment = () => {
    const text = newCmt.trim();
    if (!text) return;
    if (replyTo) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === replyTo.commentId
            ? {
              ...c,
              replies: [
                {
                  id: `r_${Date.now()}`,
                  author: "Bạn",
                  timeAgo: "vừa xong",
                  content: text,
                },
                ...c.replies,
              ].slice(0, 50),
            }
            : c
        )
      );
    } else {
      const cmt: Comment = {
        id: `c_${Date.now()}`,
        author: "Bạn",
        timeAgo: "vừa xong",
        content: text,
        replies: [],
      };
      setComments((prev) => [cmt, ...prev]);
    }
    setNewCmt("");
    setReplyTo(null);
  };

  // chỉ mở khóa: bài đầu + bài ngay sau bài đã hoàn thành cuối cùng
  const isLocked = (lessonId: string) => {
    const idx = flatLessons.findIndex((l) => l.id === lessonId);
    return idx > completedCount; // ví dụ đã xong 3 bài -> chỉ mở khóa bài thứ 4
  };

  const toggle = (id: string) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

  const goPrev = () => {
    if (currentIndex > 0) setCurrentLessonId(flatLessons[currentIndex - 1].id);
  };
  const goNext = () => {
    if (
      currentIndex < flatLessons.length - 1 &&
      !isLocked(flatLessons[currentIndex + 1].id)
    ) {
      setCurrentLessonId(flatLessons[currentIndex + 1].id);
    }
  };

  // ==== Video rules (80% + chặn tua) ====
  const handleLoaded = () => {
    const v = videoRef.current;
    if (!v) return;
    lastTimeRef.current = v.currentTime;
    setProgress((prev) => ({
      ...prev,
      [currentLessonId]: {
        ...prev[currentLessonId],
        duration: v.duration || prev[currentLessonId].duration,
      },
    }));
  };

  const handleSeeking = () => {
    const v = videoRef.current;
    if (!v) return;
    lastTimeRef.current = v.currentTime;
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    const last = lastTimeRef.current;
    const now = v.currentTime;
    const p = progress[currentLessonId];

    // Restriction removed

    // Chỉ cộng thời gian khi tiến lên bình thường
    if (now > last) {
      const delta = now - last;
      setProgress((prev) => ({
        ...prev,
        [currentLessonId]: {
          ...prev[currentLessonId],
          watchedSeconds: prev[currentLessonId].watchedSeconds + delta,
          allowedTime: Math.max(prev[currentLessonId].allowedTime, now),
        },
      }));
    }
    lastTimeRef.current = v.currentTime;

    // Đánh dấu hoàn thành khi >= 80%
    const dur = p.duration || v.duration || 0;
    const ratio = dur > 0 ? progress[currentLessonId].watchedSeconds / dur : 0;
    if (!p.completed && ratio >= 0.8) {
      setProgress((prev) => ({
        ...prev,
        [currentLessonId]: { ...prev[currentLessonId], completed: true },
      }));
    }
  };

  const handleEnded = () => {
    const p = progress[currentLessonId];
    const dur = p.duration || videoRef.current?.duration || 0;
    const ratio = dur > 0 ? p.watchedSeconds / dur : 0;
    if (ratio >= 0.8 && !p.completed)
      setProgress((prev) => ({
        ...prev,
        [currentLessonId]: { ...prev[currentLessonId], completed: true },
      }));
  };

  const watchedPercent = (() => {
    const p = progress[currentLessonId];
    const dur = p?.duration || videoRef.current?.duration || 0;
    const ratio = dur > 0 ? (p?.watchedSeconds || 0) / dur : 0;
    return Math.min(100, Math.round(ratio * 100));
  })();

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Top bar with progress text like screenshot */}
      <div className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <span className="text-sm">Kiến Thức Nhập Môn IT</span>
          <span className="text-xs">
            {completedCount}/{totalLessons} Bài học
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 p-4">
        {/* Player */}
        <div className="col-span-12 lg:col-span-9 relative">
          <div className="bg-black rounded-xl relative overflow-hidden">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              controls
              onLoadedMetadata={handleLoaded}
              onSeeking={handleSeeking}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
            >
              <source src={currentLesson.videoUrl} type="video/mp4" />
            </video>
            <div className="absolute bottom-3 left-3 text-xs text-white bg-black/50 rounded px-2 py-1">
              Đã xem ~{watchedPercent}%
            </div>
          </div>

          <div className="bg-card rounded-xl mt-3 p-4 border border-border">
            {/* Hàng tiêu đề + nút hỏi đáp */}
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl font-semibold">{currentLesson.title}</h1>

              {/* Nút hỏi đáp màu xanh nước biển */}
              <button
                onClick={() => setQaOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <span>💬</span>
                <span className="font-medium">Hỏi đáp</span>
              </button>
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              Cập nhật tháng 11 năm 2025
            </p>

            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50"
              >
                ◀ Bài trước
              </button>
              <button
                onClick={goNext}
                disabled={
                  currentIndex >= flatLessons.length - 1 ||
                  isLocked(flatLessons[currentIndex + 1].id)
                }
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                Bài tiếp theo ▶
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar lessons */}
        <aside className="col-span-12 lg:col-span-3 bg-card rounded-xl shadow-sm border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">Nội dung khóa học</h3>
            <span className="text-xs text-muted-foreground">
              {completedCount}/{totalLessons}
            </span>
          </div>
          {mockVideoCourse.map((ch) => (
            <div key={ch.id} className="mb-2">
              <button
                onClick={() => toggle(ch.id)}
                className="font-medium w-full text-left text-foreground hover:text-primary transition-colors"
              >
                {ch.title}
              </button>
              {expanded[ch.id] && (
                <ul className="mt-1 space-y-1">
                  {ch.lessons.map((l) => {
                    const locked = isLocked(l.id) && !progress[l.id].completed;
                    const active = currentLessonId === l.id;
                    const done = progress[l.id].completed;
                    return (
                      <li key={l.id}>
                        <button
                          disabled={locked}
                          onClick={() => !locked && setCurrentLessonId(l.id)}
                          className={cn(
                            "w-full text-left px-2 py-1 rounded flex items-center justify-between transition-colors",
                            active
                              ? "bg-primary/20 text-primary"
                              : locked
                                ? "opacity-50 cursor-not-allowed"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                          title={
                            locked
                              ? "Bài bị khóa: hãy hoàn thành bài trước (≥80%)"
                              : undefined
                          }
                        >
                          <span className="truncate flex items-center gap-2">
                            {done ? "✅" : locked ? "🔒" : ""}
                            <span>
                              {l.order}. {l.title}
                            </span>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {l.duration}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ))}
        </aside>
      </div>

      {/* Q&A Drawer */}
      {qaOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setQaOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-card shadow-xl flex flex-col border-l border-border">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <input
                value={newCmt}
                onChange={(e) => setNewCmt(e.target.value)}
                placeholder={
                  replyTo
                    ? `Trả lời @${replyTo.mention}`
                    : "Nhập bình luận mới của bạn"
                }
                className="flex-1 rounded-xl border border-border bg-muted/50 text-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={submitComment}
                className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm hover:opacity-90 transition-opacity"
              >
                Gửi
              </button>
              <button
                onClick={() => {
                  setQaOpen(false);
                }}
                className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <div className="px-4 py-3 text-sm text-foreground border-b border-border">
              <span className="font-medium">{comments.length} bình luận</span>
              <span className="text-muted-foreground ml-2 text-xs">
                Nếu thấy bình luận spam, các bạn bấm report giúp admin nhé
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {comments.map((c) => (
                <div key={c.id} className="p-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted" />
                    <div className="text-sm">
                      <div className="font-medium text-foreground">
                        {c.author}{" "}
                        <span className="text-muted-foreground font-normal">
                          {c.timeAgo}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-foreground">
                    {c.content}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <button className="text-primary hover:underline">
                      Thích
                    </button>
                    <button
                      className="text-primary hover:underline"
                      onClick={() =>
                        setReplyTo({ commentId: c.id, mention: c.author })
                      }
                    >
                      Phản hồi
                    </button>
                  </div>

                  {/* Replies (cấp 2) */}
                  <div className="mt-2 pl-10 space-y-3">
                    {c.replies.map((r) => (
                      <div key={r.id} className="">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-muted" />
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {r.author}{" "}
                              <span className="text-muted-foreground font-normal">
                                {r.timeAgo}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="mt-1 text-[15px] text-foreground">{r.content}</p>
                        <div className="mt-1 flex items-center gap-4 text-sm">
                          <button className="text-primary hover:underline">
                            Thích
                          </button>
                          <button
                            className="text-primary hover:underline"
                            onClick={() =>
                              setReplyTo({ commentId: c.id, mention: r.author })
                            }
                          >
                            Phản hồi
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
