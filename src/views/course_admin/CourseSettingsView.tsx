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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ─────────── TRUY CẬP & ĐĂNG KÝ ─────────── */}
        <section className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-sm">
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Quyền truy cập & Đăng ký</h3>
                <p className="text-xs text-muted-foreground">Quản lý cách học viên tìm thấy và tham gia khóa học của bạn.</p>
              </div>
            </div>
          </div>
          <div className="px-8 pb-4 divide-y divide-border/50">
            <SettingToggle
              label="Chế độ riêng tư"
              description="Khóa học chỉ hiển thị với người được mời trực tiếp, ẩn khỏi tìm kiếm công khai."
              value={settings.privateMode}
              onChange={toggle('privateMode')}
              icon={Lock}
              iconColor="text-destructive"
            />
            <SettingToggle
              label="Cho phép đăng ký mới"
              description="Mở đăng ký cho các học viên mới tham gia vào khóa học này."
              value={settings.allowEnroll}
              onChange={toggle('allowEnroll')}
              icon={Users}
              iconColor="text-primary"
            />
            <SettingToggle
              label="Yêu cầu phê duyệt"
              description="Học viên cần được quản trị viên phê duyệt trước khi có thể vào học."
              value={settings.requireApproval}
              onChange={toggle('requireApproval')}
              icon={Shield}
              iconColor="text-amber-500"
            />
          </div>
        </section>

        {/* ─────────── HIỂN THỊ & GIAO DIỆN ─────────── */}
        <section className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-sm">
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Hiển thị & Giao diện</h3>
                <p className="text-xs text-muted-foreground">Tùy chỉnh những gì học viên và khách vãng lai nhìn thấy.</p>
              </div>
            </div>
          </div>
          <div className="px-8 pb-4 divide-y divide-border/50">
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
              description="Học viên có thể theo dõi phần trăm hoàn thành của mình trong khóa học."
              value={settings.showProgress}
              onChange={toggle('showProgress')}
              icon={ToggleLeft}
              iconColor="text-blue-500"
            />
          </div>
        </section>

        {/* ─────────── TƯƠNG TÁC & THÔNG BÁO ─────────── */}
        <section className="rounded-[2.5rem] border border-border bg-card overflow-hidden shadow-sm">
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground">Tương tác & Thông báo</h3>
                <p className="text-xs text-muted-foreground">Quản lý cách hệ thống giao tiếp với bạn và học viên.</p>
              </div>
            </div>
          </div>
          <div className="px-8 pb-4 divide-y divide-border/50">

            <SettingToggle
              label="Cho phép đánh giá & xếp hạng"
              description="Học viên có thể để lại đánh giá sao và nhận xét sau khi hoàn thành."
              value={settings.allowRating}
              onChange={toggle('allowRating')}
              icon={Eye}
              iconColor="text-amber-500"
            />
            <SettingToggle
              label="Thông báo đăng ký mới"
              description="Gửi email thông báo cho quản trị viên khi có người đăng ký mới."
              value={settings.sendEnrollNotification}
              onChange={toggle('sendEnrollNotification')}
              icon={Mail}
              iconColor="text-indigo-500"
            />
          </div>
        </section>


      </div>

    </div>
  );
};

export default CourseSettingsView;
