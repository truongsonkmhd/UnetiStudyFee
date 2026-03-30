import React, { useState } from 'react';
import {
  Settings, Bell, Shield, Users, Eye, EyeOff, Lock, Globe,
  ToggleLeft, ChevronRight, Save, AlertTriangle, Mail, MessageSquare
} from 'lucide-react';

interface SettingToggleProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ElementType;
  iconColor?: string;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  label, description, value, onChange, icon: Icon, iconColor = 'text-primary'
}) => (
  <div className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-0">
    <div className="flex items-start gap-3 min-w-0">
      {Icon && (
        <div className={`mt-0.5 shrink-0 ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-black text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground leading-snug">{description}</p>
      </div>
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative shrink-0 h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 ${value ? 'bg-primary' : 'bg-muted-foreground/30'}`}
    >
      <span
        className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);

interface CourseSettingsViewProps {
  courseId?: string;
}

const CourseSettingsView: React.FC<CourseSettingsViewProps> = ({ courseId }) => {
  const [settings, setSettings] = useState({
    allowEnroll: true,
    showStudentCount: true,
    requireApproval: false,
    allowPreview: true,
    sendEnrollNotification: true,
    sendCompletionCertificate: false,
    allowDiscussion: true,
    allowRating: true,
    privateMode: false,
    showProgress: true,
  });

  const toggle = (key: keyof typeof settings) => (v: boolean) => {
    setSettings(prev => ({ ...prev, [key]: v }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-muted/60 via-muted/20 to-transparent border border-border p-8 flex items-start gap-6">
        <div className="rounded-2xl bg-muted p-4 text-muted-foreground shrink-0">
          <Settings className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Cài đặt khóa học</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Quản lý quyền truy cập, thông báo, tính năng tương tác và chế độ hiển thị cho khóa học này.
          </p>
          {courseId && (
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/50 pt-1">
              Course ID: <span className="text-muted-foreground">{courseId}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ─────────── Đăng ký & Truy cập ─────────── */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Đăng ký & Truy cập</h3>
          </div>

          <SettingToggle
            label="Cho phép đăng ký mới"
            description="Sinh viên có thể đăng ký khóa học này từ trang danh sách."
            value={settings.allowEnroll}
            onChange={toggle('allowEnroll')}
            icon={Users}
            iconColor="text-blue-500"
          />
          <SettingToggle
            label="Yêu cầu duyệt thủ công"
            description="Mỗi yêu cầu đăng ký cần được admin phê duyệt trước khi sinh viên vào học."
            value={settings.requireApproval}
            onChange={toggle('requireApproval')}
            icon={Shield}
            iconColor="text-amber-500"
          />
          <SettingToggle
            label="Chế độ riêng tư"
            description="Khóa học chỉ hiển thị với người được mời trực tiếp, ẩn khỏi tìm kiếm công khai."
            value={settings.privateMode}
            onChange={toggle('privateMode')}
            icon={Lock}
            iconColor="text-destructive"
          />
          <SettingToggle
            label="Cho phép xem thử (Preview)"
            description="Người dùng chưa đăng ký có thể xem trước các bài học được đánh dấu Preview."
            value={settings.allowPreview}
            onChange={toggle('allowPreview')}
            icon={Eye}
            iconColor="text-emerald-500"
          />
        </div>

        {/* ─────────── Hiển thị ─────────── */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Hiển thị & Giao diện</h3>
          </div>

          <SettingToggle
            label="Hiện số lượng học viên"
            description="Trang khóa học sẽ hiển thị tổng số học viên đã đăng ký cho người xem."
            value={settings.showStudentCount}
            onChange={toggle('showStudentCount')}
            icon={Users}
            iconColor="text-purple-500"
          />
          <SettingToggle
            label="Hiện tiến độ học tập"
            description="Sinh viên thấy được thanh tiến độ hoàn thành bài học trong khóa học."
            value={settings.showProgress}
            onChange={toggle('showProgress')}
            icon={ToggleLeft}
            iconColor="text-blue-500"
          />
          <SettingToggle
            label="Cho phép đánh giá & xếp hạng"
            description="Sinh viên có thể để lại đánh giá sao và nhận xét sau khi hoàn thành."
            value={settings.allowRating}
            onChange={toggle('allowRating')}
            icon={Eye}
            iconColor="text-amber-500"
          />
          <SettingToggle
            label="Cho phép thảo luận"
            description="Sinh viên có thể đặt câu hỏi và thảo luận trong từng bài học."
            value={settings.allowDiscussion}
            onChange={toggle('allowDiscussion')}
            icon={MessageSquare}
            iconColor="text-emerald-500"
          />
        </div>

        {/* ─────────── Thông báo ─────────── */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Thông báo & Email</h3>
          </div>

          <SettingToggle
            label="Thông báo khi có đăng ký mới"
            description="Gửi email đến admin khi có sinh viên đăng ký thành công vào khóa học."
            value={settings.sendEnrollNotification}
            onChange={toggle('sendEnrollNotification')}
            icon={Mail}
            iconColor="text-blue-500"
          />
          <SettingToggle
            label="Cấp chứng chỉ hoàn thành"
            description="Tự động cấp chứng chỉ PDF cho sinh viên khi hoàn tất toàn bộ khóa học."
            value={settings.sendCompletionCertificate}
            onChange={toggle('sendCompletionCertificate')}
            icon={Bell}
            iconColor="text-emerald-500"
          />
        </div>

        {/* ─────────── Vùng nguy hiểm ─────────── */}
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-black uppercase tracking-widest text-destructive">Vùng nguy hiểm</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Các thao tác dưới đây không thể hoàn tác. Hãy chắc chắn trước khi thực hiện.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-between rounded-xl border border-destructive/20 bg-card px-4 py-3 text-sm font-black text-destructive transition-all hover:bg-destructive/10 hover:border-destructive/40 group"
            >
              <span>Đặt lại toàn bộ tiến trình học viên</span>
              <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-between rounded-xl border border-destructive/20 bg-card px-4 py-3 text-sm font-black text-destructive transition-all hover:bg-destructive/10 hover:border-destructive/40 group"
            >
              <span>Xóa vĩnh viễn khóa học này</span>
              <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
            </button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
        >
          <Save className="h-4 w-4" />
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
};

export default CourseSettingsView;
