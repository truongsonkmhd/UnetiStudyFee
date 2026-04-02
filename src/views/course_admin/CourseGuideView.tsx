import React, { useState } from 'react';
import {
  Info, Layout, BookOpen, Rocket, Video, HelpCircle, Trophy,
  CheckCircle2, AlertTriangle, Lightbulb, Star, ArrowRight,
  Code2, ClipboardCheck, Users, GraduationCap, Settings, Search
} from 'lucide-react';

const GUIDE_CONTENT = {
  course: {
    title: 'Hướng dẫn tạo khóa học',
    description: 'Quy trình 4 bước để thiết lập một khóa học chuyên nghiệp, từ nội dung cơ bản đến bài giảng chi tiết.',
    steps: [
      {
        icon: Info,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        step: '01',
        title: 'Thông tin cơ bản',
        desc: 'Nhập tiêu đề, mô tả tóm tắt, chuyên mục, cấp độ và ảnh bìa khóa học.',
        tips: [
          'Tiêu đề nên ngắn gọn, chứa từ khóa chính.',
          'Mô tả tóm tắt tối đa 150 ký tự để tối ưu tìm kiếm.',
          'Ảnh bìa nên có tỷ lệ 16:9 (1280x720px).',
        ],
      },
      {
        icon: Layout,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        step: '02',
        title: 'Cấu trúc bài học',
        desc: 'Tạo Module và Lesson. Mỗi bài có thể là Video, Code, hoặc Quiz.',
        tips: [
          'Phân chia Module theo tuần hoặc theo chủ đề lớn.',
          'Sử dụng Video YouTube để tối ưu tốc độ tải.',
          'Gắn bài tập vào bài học để sinh viên thực hành ngay.',
        ],
      },
      {
        icon: BookOpen,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        step: '03',
        title: 'Chi tiết mở rộng',
        desc: 'Bổ sung yêu cầu đầu vào, mục tiêu học tập và đề cương chi tiết.',
        tips: [
          'Hỗ trợ định dạng Markdown cho nội dung đề cương.',
          'Liệt kê rõ các kiến thức cần có trước khi học.',
          'Mô tả kết quả sinh viên đạt được sau khóa học.',
        ],
      },
      {
        icon: Rocket,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        step: '04',
        title: 'Hoàn thiện & Xuất bản',
        desc: 'Cấu hình trạng thái hiển thị và kiểm tra lần cuối trước khi công khai.',
        tips: [
          'Dùng trạng thái Draft nếu chưa hoàn thiện nội dung.',
          'Trạng thái Published sẽ hiển thị khóa học lên trang chủ.',
          'Có thể ẩn khóa học bất cứ lúc nào bằng cách Archived.',
        ],
      },
    ],
    extraInfo: {
      title: 'Các loại bài học',
      items: [
        { icon: Video, label: 'VIDEO', color: 'text-blue-500', desc: 'Bài giảng qua video.' },
        { icon: Code2, label: 'CODE', color: 'text-purple-500', desc: 'Lập trình tự động chấm.' },
        { icon: HelpCircle, label: 'QUIZ', color: 'text-amber-500', desc: 'Trắc nghiệm kiến thức.' },
        { icon: Star, label: 'ALL', color: 'text-emerald-500', desc: 'Kết hợp đa nội dung.' },
      ]
    }
  },
  exercise: {
    title: 'Quản lý Kho bài tập',
    description: 'Xây dựng ngân hàng câu hỏi lập trình và trắc nghiệm để tái sử dụng trong nhiều khóa học và bài thi.',
    steps: [
      {
        icon: Code2,
        color: 'text-indigo-500',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        step: '01',
        title: 'Kho bài lập trình',
        desc: 'Thiết lập đề bài, cấu hình ngôn ngữ, bộ test case (đầu vào/đầu ra) và giới hạn tài nguyên.',
        tips: [
          'Mô tả đề bài rõ ràng, cung cấp ví dụ mẫu.',
          'Thiết lập Test Case đa dạng (trường hợp biên, rỗng).',
          'Cấu hình thời gian chạy (ms) và bộ nhớ (MB).',
        ],
      },
      {
        icon: ClipboardCheck,
        color: 'text-pink-500',
        bg: 'bg-pink-500/10',
        border: 'border-pink-500/20',
        step: '02',
        title: 'Ngân hàng trắc nghiệm',
        desc: 'Tạo câu hỏi với nhiều lựa chọn, phân loại theo độ khó và chủ đề kiến thức.',
        tips: [
          'Hỗ trợ câu hỏi 1 đáp án hoặc nhiều đáp án đúng.',
          'Phân loại độ khó (Dễ, Trung bình, Khó) để trộn đề.',
          'Thêm giải thích cho mỗi đáp án để sinh viên tham khảo.',
        ],
      },
    ],
    extraInfo: {
      title: 'Lợi ích của Kho bài tập',
      items: [
        { icon: Search, label: 'TÌM KIẾM', color: 'text-blue-500', desc: 'Dễ dàng lọc bài theo tags.' },
        { icon: Layout, label: 'TÁI SỬ DỤNG', color: 'text-purple-500', desc: 'Gắn vào bất kỳ khóa học nào.' },
        { icon: Settings, label: 'CẬP NHẬT', color: 'text-amber-500', desc: 'Sửa một nơi, đổi mọi nơi.' },
        { icon: Trophy, label: 'THI ĐẤU', color: 'text-emerald-500', desc: 'Dùng làm đề thi chính thức.' },
      ]
    }
  },
  test: {
    title: 'Cấu hình Bài thi',
    description: 'Tạo các đợt kiểm tra, thi học kỳ với các ràng buộc về thời gian, bảo mật và cách lấy đề từ ngân hàng.',
    steps: [
      {
        icon: Settings,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        step: '01',
        title: 'Thiết lập chung',
        desc: 'Đặt tên đợt thi, thời gian bắt đầu, kết thúc, thời lượng làm bài và mật khẩu truy cập.',
        tips: [
          'Đặt thời lượng phù hợp với số lượng câu hỏi.',
          'Mật khẩu giúp bảo mật, chỉ cho phép SV tại phòng thi.',
          'Cấu hình số lần làm bài tối đa (mặc định là 1).',
        ],
      },
      {
        icon: Search,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        step: '02',
        title: 'Cấu hình đề thi',
        desc: 'Chọn câu hỏi từ kho bài tập. Hỗ trợ trộn đề tự động hoặc lấy ngẫu nhiên theo độ khó.',
        tips: [
          'Trộn thứ tự câu hỏi để tránh gian lận.',
          'Trộn thứ tự đáp án trong mỗi câu trắc nghiệm.',
          'Có thể xem trước (Preview) đề thi trước khi lưu.',
        ],
      },
    ],
    extraInfo: {
      title: 'Giám sát & Chấm điểm',
      items: [
        { icon: Users, label: 'GIÁM SÁT', color: 'text-blue-500', desc: 'Theo dõi sinh viên đang làm bài.' },
        { icon: ClipboardCheck, label: 'TỰ ĐỘNG', color: 'text-purple-500', desc: 'Chấm điểm ngay sau khi nộp.' },
        { icon: AlertTriangle, label: 'BÁO CÁO', color: 'text-amber-500', desc: 'Thống kê phổ điểm cả lớp.' },
        { icon: GraduationCap, label: 'XUẤT ĐIỂM', color: 'text-emerald-500', desc: 'Xuất file Excel bảng điểm.' },
      ]
    }
  },
  class: {
    title: 'Quản lý Lớp học',
    description: 'Vận hành lớp học thực tế: duyệt sinh viên, quản lý lộ trình học và hỗ trợ giải đáp thắc mắc.',
    steps: [
      {
        icon: Users,
        color: 'text-teal-500',
        bg: 'bg-teal-500/10',
        border: 'border-teal-500/20',
        step: '01',
        title: 'Nhân sự & Thành viên',
        desc: 'Duyệt yêu cầu tham gia lớp hoặc thêm sinh viên bằng mã số SV. Chỉ định trợ giảng nếu cần.',
        tips: [
          'Dùng mã lớp để SV tự đăng ký nhanh chóng.',
          'Phê duyệt hàng loạt để tiết kiệm thời gian.',
          'Kiểm tra sĩ số để tránh quá tải sức chứa.',
        ],
      },
      {
        icon: GraduationCap,
        color: 'text-rose-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        step: '02',
        title: 'Theo dõi tiến trình',
        desc: 'Xem báo cáo chi tiết về việc hoàn thành bài học, điểm số trung bình và mức độ tích cực.',
        tips: [
          'Nhắc nhở các SV có tiến độ chậm trễ.',
          'Phân tích những bài học/câu hỏi có tỷ lệ sai cao.',
          'Tổng kết điểm để cấp chứng chỉ hoàn thành.',
        ],
      },
    ],
    extraInfo: {
      title: 'Tương tác & Hỗ trợ',
      items: [
        { icon: Video, label: 'HỌC TRỰC TUYẾN', color: 'text-blue-500', desc: 'Gắn link Zoom/Google Meet.' },
        { icon: HelpCircle, label: 'GIẢI ĐÁP', color: 'text-purple-500', desc: 'Phản hồi bình luận bài học.' },
        { icon: Info, label: 'THÔNG BÁO', color: 'text-amber-500', desc: 'Gửi tin nhắn chung cho cả lớp.' },
        { icon: Rocket, label: 'TÀI LIỆU', color: 'text-emerald-500', desc: 'Chia sẻ file tài liệu bổ sung.' },
      ]
    }
  }
};

const CourseGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<keyof typeof GUIDE_CONTENT>('course');
  const content = GUIDE_CONTENT[activeTab];

  const TABS = [
    { id: 'course', label: 'Khóa học', icon: BookOpen },
    { id: 'exercise', label: 'Kho bài tập', icon: Trophy },
    { id: 'test', label: 'Bài thi', icon: Rocket },
    { id: 'class', label: 'Lớp học', icon: GraduationCap },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-muted/40 rounded-2xl w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300
                ${isActive 
                  ? 'bg-card text-primary shadow-sm scale-105' 
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}
              `}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-8 flex items-start gap-6">
        <div className="rounded-2xl bg-card p-4 text-primary shrink-0 shadow-sm">
          <Lightbulb className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-foreground tracking-tight">{content.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {content.description}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="grid gap-6 md:grid-cols-2">
        {content.steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className={`rounded-[2rem] border ${s.border} bg-card p-7 space-y-5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group`}
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-2xl ${s.bg} ${s.color} p-4 shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Bước {s.step}</p>
                  <h3 className="text-lg font-black text-foreground">{s.title}</h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed italic">"{s.desc}"</p>

              <div className="space-y-3 pt-2">
                {s.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 text-[13px] text-foreground/90">
                    <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${s.color}`} />
                    <span className="leading-snug">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Extra Info (Lesson types or Benefits) */}
      <div className="rounded-[2.5rem] border border-border bg-card p-8 space-y-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Star className="h-32 w-32" />
        </div>
        
        <div className="flex items-center gap-3">
          <Layout className="h-5 w-5 text-primary" />
          <h3 className="text-base font-black text-foreground uppercase tracking-widest">{content.extraInfo.title}</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.extraInfo.items.map((lt) => {
            const Icon = lt.icon;
            return (
              <div key={lt.label} className="flex items-start gap-3 rounded-2xl bg-muted/30 p-5 hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${lt.color}`} />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wider text-foreground">{lt.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{lt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-4 rounded-[2rem] border border-destructive/20 bg-destructive/5 p-6 md:p-8">
        <div className="p-3 rounded-xl bg-destructive/10 text-destructive shrink-0">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <p className="text-base font-black text-destructive">Lưu ý về tính nhất quán dữ liệu</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Việc thay đổi cấu trúc hoặc xóa nội dung (bài tập, bài thi) khi đã có sinh viên đăng ký sẽ ảnh hưởng trực tiếp đến kết quả học tập. Hãy luôn <strong className="text-foreground">Lưu bản nháp (Draft)</strong> trước khi quyết định thay đổi chính thức.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseGuideView;
