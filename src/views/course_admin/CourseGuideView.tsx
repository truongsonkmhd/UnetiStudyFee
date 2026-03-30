import React from 'react';
import {
  Info, Layout, BookOpen, Rocket, Video, HelpCircle, Trophy,
  CheckCircle2, AlertTriangle, Lightbulb, Star, ArrowRight
} from 'lucide-react';

const steps = [
  {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    step: '01',
    title: 'Thông tin cơ bản',
    desc: 'Nhập tiêu đề, mô tả tóm tắt, chuyên mục, cấp độ, ảnh bìa và URL video trailer giới thiệu khóa học.',
    tips: [
      'Tiêu đề nên ngắn gọn, gợi nhớ và có từ khóa liên quan.',
      'Mô tả tóm tắt tối đa 150 ký tự — dùng trong trang tìm kiếm.',
      'Ảnh bìa nên có tỷ lệ 16:9, kích thước ≥ 1280×720px.',
    ],
  },
  {
    icon: Layout,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    step: '02',
    title: 'Cấu trúc bài học',
    desc: 'Tạo các chương (Module) và bài học (Lesson) bên trong. Mỗi bài học có thể là Video, Code, Quiz hoặc kết hợp.',
    tips: [
      'Mỗi chương nên có tên rõ ràng, phản ánh chủ đề.',
      'Chọn đúng loại bài học để hệ thống hiển thị đúng nội dung cho sinh viên.',
      'Bài tập lập trình và trắc nghiệm được chọn từ ngân hàng Template sẵn có.',
    ],
  },
  {
    icon: BookOpen,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    step: '03',
    title: 'Chi tiết mở rộng',
    desc: 'Bổ sung yêu cầu đầu vào, mục tiêu học tập, sức chứa và đề cương chi tiết (hỗ trợ Markdown).',
    tips: [
      'Mục tiêu học tập rõ ràng giúp sinh viên biết kết quả sau khóa học.',
      'Đề cương (Syllabus) hỗ trợ định dạng Markdown — dùng # cho heading.',
      'Sức chứa mặc định là 100 sinh viên.',
    ],
  },
  {
    icon: Rocket,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    step: '04',
    title: 'Hoàn thiện & Xuất bản',
    desc: 'Đặt trạng thái quản lý (Draft / Published / Archived) và quyết định có công khai ngay hay không.',
    tips: [
      'Chỉ công khai khi nội dung đã hoàn chỉnh và được kiểm duyệt.',
      'Trạng thái "Lưu trữ" sẽ ẩn khóa học khỏi người dùng.',
      'Có thể chỉnh sửa và lưu lại bất cứ lúc nào.',
    ],
  },
];

const lessonTypes = [
  { icon: Video, label: 'VIDEO', color: 'text-blue-500', desc: 'Bài học video YouTube bài giảng.' },
  { icon: Trophy, label: 'CODE', color: 'text-purple-500', desc: 'Bài tập lập trình có chấm điểm tự động.' },
  { icon: HelpCircle, label: 'QUIZ', color: 'text-amber-500', desc: 'Trắc nghiệm kiểm tra kiến thức.' },
  { icon: Star, label: 'ALL', color: 'text-emerald-500', desc: 'Kết hợp đầy đủ Video + Code + Quiz.' },
];

const CourseGuideView: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 flex items-start gap-6">
        <div className="rounded-2xl bg-primary/10 p-4 text-primary shrink-0">
          <Lightbulb className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Hướng dẫn tạo khóa học</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Làm theo 4 bước dưới đây để thiết lập đầy đủ một khóa học chất lượng trên hệ thống UnetiStudy.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="grid gap-6 md:grid-cols-2">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className={`rounded-2xl border ${s.border} bg-card p-6 space-y-4 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-2xl ${s.bg} ${s.color} p-3 shrink-0`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Bước {s.step}</p>
                  <h3 className="text-base font-black text-foreground">{s.title}</h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>

              <div className="space-y-2 pt-1">
                {s.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${s.color}`} />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lesson types */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <Layout className="h-5 w-5 text-primary" />
          <h3 className="text-base font-black text-foreground uppercase tracking-wide">Các loại bài học</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {lessonTypes.map((lt) => {
            const Icon = lt.icon;
            return (
              <div key={lt.label} className="flex items-start gap-3 rounded-xl bg-muted/40 p-4">
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${lt.color}`} />
                <div>
                  <p className="text-[12px] font-black uppercase tracking-wider text-foreground">{lt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{lt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
        <div className="space-y-1 text-sm">
          <p className="font-black text-destructive">Lưu ý quan trọng</p>
          <p className="text-muted-foreground leading-relaxed">
            Xóa một chương hoặc bài học đã có dữ liệu sinh viên nộp bài sẽ <strong className="text-foreground">xóa vĩnh viễn</strong> toàn bộ lịch sử học tập liên quan. Hãy kiểm tra kỹ trước khi thao tác xóa.
          </p>
        </div>
      </div>

      {/* Quick start CTA */}
      <div className="flex items-center justify-between rounded-2xl bg-primary/5 border border-primary/10 p-5">
        <div>
          <p className="font-black text-foreground text-sm">Đã hiểu rồi? Bắt đầu thôi!</p>
          <p className="text-xs text-muted-foreground">Nhấn vào tab "Thông tin cơ bản" hoặc dùng thanh tiến trình phía trên.</p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary" />
      </div>
    </div>
  );
};

export default CourseGuideView;
