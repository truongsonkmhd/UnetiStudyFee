import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { actionAuth } from "@/components/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/constants/paths";

import bgLeft from "@/assets/img/bg_left.png";
import bgRight from "@/assets/img/bg_right.png";
import logoUneti from "@/assets/img/logo_uneti.png";
import { FormInputComp } from "@/components/ui/FormInput";
import { X } from "lucide-react";
import { FormSelectComp } from "@/components/ui/FormSelect";

export default function AuthScreen() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Top blue header */}
      <header className="bg-[#0b66c3] text-white shadow">
        <div className="mx-auto max-w-[1000px] px-4 py-4 flex items-center justify-center gap-4">
          {/* Logo placeholder */}
          <img
            src={logoUneti}
            alt="UNETI Logo"
            className="h-12 sm:h-14 w-auto object-contain rounded-full"
          />

          <div className="text-center leading-tight">
            <div className="text-xs sm:text-sm font-medium opacity-95">
              TRƯỜNG ĐẠI HỌC KINH TẾ - KỸ THUẬT CÔNG NGHIỆP
            </div>
            <div className="text-lg sm:text-2xl font-semibold tracking-wide">
              Học tập để kiến tạo tương lai
            </div>
          </div>
        </div>
      </header>

      <img
        src={bgLeft}
        alt="bg-left"
        className="pointer-events-none select-none absolute left-0 bottom-0 w-[520px] max-w-[25vw] opacity-100"
        draggable={false}
      />

      <img
        src={bgRight}
        alt="bg-right"
        className="pointer-events-none select-none absolute right-0 bottom-0 w-[820px] max-w-[39vw] opacity-100"
        draggable={false}
      />

      {/* Page body */}
      <main className="px-4">
        <div className="mx-auto max-w-[1100px] py-10">
          <div className="grid place-items-center">
            {!isRegisterMode ? (
              <LoginCard onSwitchToRegister={() => setIsRegisterMode(true)} />
            ) : (
              <RegisterCard onSwitchToLogin={() => setIsRegisterMode(false)} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function LoginCard({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  return (
    <Card className="w-full max-w-[440px] shadow-lg border rounded-lg overflow-hidden">
      {/* Background inside card (nhẹ, giống ảnh) */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-slate-50" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#60a5fa,transparent_35%),radial-gradient(circle_at_80%_30%,#fb7185,transparent_30%),radial-gradient(circle_at_30%_85%,#f59e0b,transparent_35%)]" />

        <CardContent className="relative p-8 sm:p-10">
          {/* Titles */}
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1d4ed8] drop-shadow-sm">
              UNETI STUDY QUANTITY
            </h1>
            <div className="mt-4 text-[#1d4ed8] font-semibold tracking-wide">
              ĐĂNG NHẬP HỆ THỐNG
            </div>
          </div>

          {/* Form */}
          <div className="mt-6">
            <SignIn onSwitchToRegister={onSwitchToRegister} />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function SignIn({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { login } = actionAuth();
  const navigate = useNavigate();

  const [remember, setRemember] = useState<boolean>(() => {
    return localStorage.getItem("auth_remember_me") === "true";
  });

  const [saveUserName, setSaveUserName] = useState<string>(() => {
    return localStorage.getItem("auth_username") || "";
  });

  const [password, setPassword] = useState<string>("");

  const handleRememberChange = (value: boolean) => {
    setRemember(value);
    if (!value) {
      localStorage.removeItem("auth_remember_me");
      localStorage.removeItem("auth_username");
    }
  };
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-4 space-y-3">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);

          const fd = new FormData(e.currentTarget);
          const username = String(fd.get("username") || "");
          const password = String(fd.get("password") || "");

          if (!username || !password) {
            setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
            return;
          }

          const payload = {
            username,
            password,
            isRememberMe: remember,
          };

          toast.promise(login(payload), {
            loading: "Đang đăng nhập...",
            success: () => {
              if (remember) {
                localStorage.setItem("auth_remember_me", "true");
                localStorage.setItem("auth_username", username);
              } else {
                localStorage.removeItem("auth_remember_me");
                localStorage.removeItem("auth_username");
              }

              navigate(PATHS.HOME, { replace: true });
              return "Đăng nhập thành công!";
            },
            error: (err: any) => {
              const msg =
                err?.detail || "Tên đăng nhập hoặc mật khẩu không đúng.";
              setError(msg);
              return msg;
            },
          });
        }}
      >
        <div>
          <div className="mb-1 text-xs text-slate-600">Tài khoản</div>
          <Input
            name="username"
            className="h-10"
            value={saveUserName}
            onChange={(e) => setSaveUserName(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div>
          <div className="mb-1 text-xs text-slate-600">Mật khẩu</div>
          <Input
            name="password"
            type="password"
            className="h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={remember ? "current-password" : "off"}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox
              checked={remember}
              onCheckedChange={(v) => handleRememberChange(Boolean(v))}
            />
            Ghi nhớ
          </label>

          <button
            type="button"
            className="text-sm text-red-600 hover:underline"
            onClick={() =>
              toast.info("Chức năng quên mật khẩu (chưa triển khai)")
            }
          >
            Quên mật khẩu?
          </button>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <Button
          type="submit"
          className="h-10 w-full rounded-md bg-[#c81e1e] hover:bg-[#b51a1a] text-white font-medium"
        >
          Đăng nhập
        </Button>
      </form>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-sm font-medium text-[#1d4ed8] hover:underline"
        >
          Bạn chưa có tài khoản? Đăng ký ngay
        </button>
      </div>
    </div>
  );
}

function RegisterCard({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    classId: "",
    email: "",
    phone: "",
    gender: "",
    birthday: "",
    contactAddress: "",
    currentResidence: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  const { signUp } = actionAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "Tên đăng nhập là bắt buộc";
    }
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      fullName: formData.fullName,
      userName: formData.userName,
      password: formData.password,
      email: formData.email,
      phone: formData.phone || undefined,

      gender: (formData.gender || undefined) as any,
      birthday: formData.birthday || undefined,

      contactAddress: formData.contactAddress || undefined,
      currentResidence: formData.currentResidence || undefined,

      studentId: formData.studentId,
      classId: formData.classId,

      roleCodes: ["ROLE_STUDENT"],
    };

    toast.promise(signUp(payload), {
      loading: "Đang đăng ký...",
      success: () => {
        navigate(PATHS.HOME, { replace: true });
        return "Đăng ký thành công!";
      },
      error: (err: any) => {
        const msg =
          err?.detail ||
          err?.message ||
          "Đăng ký thất bại, vui lòng kiểm tra lại thông tin.";
        return msg;
      },
    });
  };

  return (
    <Card className="w-full max-w-[1000px] shadow-lg border rounded-lg overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-slate-50" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#60a5fa,transparent_35%),radial-gradient(circle_at_80%_30%,#fb7185,transparent_30%)]" />

        <CardContent className="relative p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#1d4ed8] drop-shadow-sm">
                ĐĂNG KÝ TÀI KHOẢN
              </h1>
            </div>
            <Button variant="ghost" size="sm" onClick={onSwitchToLogin}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-7 max-h-[70vh] overflow-y-auto pr-2">
            {/* Thông tin cơ bản */}
            <div>
              <h3 className="text-base font-semibold text-slate-700 mb-3">
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormInputComp
                  label="Tên đăng nhập"
                  name="userName"
                  value={formData.userName}
                  onChange={(v) => {
                    setFormData({ ...formData, userName: v });
                    if (errors.userName) {
                      setErrors({ ...errors, userName: "" });
                    }
                  }}
                  placeholder="username123"
                  required
                  error={errors.userName}
                />

                <FormInputComp
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(v) => {
                    setFormData({ ...formData, email: v });
                    if (errors.email) {
                      setErrors({ ...errors, email: "" });
                    }
                  }}
                  placeholder="email@example.com"
                  required
                  error={errors.email}
                />

                <FormInputComp
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(v) => {
                    setFormData({ ...formData, password: v });
                    if (errors.password) {
                      setErrors({ ...errors, password: "" });
                    }
                  }}
                  required
                  error={errors.password}
                  helperText="Tối thiểu 6 ký tự"
                />

                <FormInputComp
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={(v) => setFormData({ ...formData, phone: v })}
                  placeholder="0123456789"
                />

                <FormInputComp
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(v) => {
                    setFormData({ ...formData, confirmPassword: v });
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: "" });
                    }
                  }}
                  required
                  error={errors.confirmPassword}
                />

                <FormSelectComp
                  label="Giới tính"
                  name="gender"
                  options={[
                    { value: "male", label: "Nam" },
                    { value: "female", label: "Nữ" },
                    { value: "other", label: "Khác" },
                  ]}
                  value={formData.gender}
                  onChange={(v) =>
                    setFormData({ ...formData, gender: String(v) })
                  }
                />

                <FormInputComp
                  label="Mã sinh viên"
                  name="studentId"
                  type="text"
                  value={formData.studentId}
                  onChange={(v) => {
                    setFormData({ ...formData, studentId: v });
                    if (errors.studentId) {
                      setErrors({ ...errors, studentId: "" });
                    }
                  }}
                  placeholder="22103100139"
                  required
                  error={errors.studentId}
                />

                <FormInputComp
                  label="Địa chỉ quê quán"
                  name="contactAddress"
                  type="text"
                  value={formData.contactAddress}
                  onChange={(v) => {
                    setFormData({ ...formData, contactAddress: v });
                    if (errors.contactAddress) {
                      setErrors({ ...errors, contactAddress: "" });
                    }
                  }}
                  placeholder="Nhị Chiểu , Hải Phòng"
                  error={errors.contactAddress}
                />

                <FormInputComp
                  label="Lớp học"
                  name="classId"
                  type="text"
                  value={formData.classId}
                  onChange={(v) => {
                    setFormData({ ...formData, classId: v });
                    if (errors.classId) {
                      setErrors({ ...errors, classId: "" });
                    }
                  }}
                  placeholder="DHTI16A3HN"
                  required
                  error={errors.classId}
                />
                <FormInputComp
                  label="Ngày sinh"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(v) => setFormData({ ...formData, birthday: v })}
                />

                <FormInputComp
                  label="Họ và tên"
                  name="fullName"
                  value={formData.fullName}
                  required
                  onChange={(v) => setFormData({ ...formData, fullName: v })}
                  placeholder="Nguyễn Văn A"
                />

                <FormInputComp
                  label="Địa chỉ hiện tai"
                  name="currentResidence"
                  type="text"
                  value={formData.currentResidence}
                  onChange={(v) => {
                    setFormData({ ...formData, currentResidence: v });
                    if (errors.currentResidence) {
                      setErrors({ ...errors, currentResidence: "" });
                    }
                  }}
                  placeholder="Đình Thôn , My Đình , Hà Nội"
                  error={errors.currentResidence}
                />
              </div>
            </div>

            {/* Địa chỉ */}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onSwitchToLogin}
              className="flex-1"
            >
              Đã có tài khoản
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-[#c81e1e] hover:bg-[#b51a1a]"
            >
              Đăng ký
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
