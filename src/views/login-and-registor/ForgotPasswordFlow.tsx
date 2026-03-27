import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import authService from "@/services/AuthService";
import { FormInputComp } from "@/components/ui/FormInput";

interface ForgotPasswordFlowProps {
  onBackToLogin: () => void;
  onSuccess: () => void;
}

type ForgotStep = "forgot" | "verify" | "reset";

export default function ForgotPasswordFlow({ onBackToLogin, onSuccess }: ForgotPasswordFlowProps) {
  const [step, setStep] = useState<ForgotStep>("forgot");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  if (step === "forgot") {
    return (
      <ForgotPasswordCard
        onBackToLogin={onBackToLogin}
        onNext={(emailValue) => {
          setEmail(emailValue);
          setStep("verify");
        }}
      />
    );
  }

  if (step === "verify") {
    return (
      <VerifyOtpCard
        email={email}
        onBackToForgot={() => setStep("forgot")}
        onNext={(otpValue) => {
          setOtp(otpValue);
          setStep("reset");
        }}
      />
    );
  }

  if (step === "reset") {
    return (
      <ResetPasswordCard
        email={email}
        otp={otp}
        onSuccess={onSuccess}
      />
    );
  }

  return null;
}

function ForgotPasswordCard({
  onBackToLogin,
  onNext,
}: {
  onBackToLogin: () => void;
  onNext: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPasswordRequest(email);
      toast.success("Mã OTP đã được gửi đến email của bạn");
      onNext(email);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gửi yêu cầu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[440px] shadow-lg border rounded-lg overflow-hidden font-semibold">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-slate-50" />
        <CardContent className="relative p-8 sm:p-10">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={onBackToLogin}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold text-[#1d4ed8]">Quên mật khẩu</h2>
          </div>
          <p className="text-sm text-slate-600 mb-6 font-medium">
            Nhập email của bạn để nhận mã xác thực OTP.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInputComp
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(v) => setEmail(v)}
              placeholder="example@email.com"
              required
            />
            <Button
              type="submit"
              className="w-full bg-[#c81e1e] hover:bg-[#b51a1a]"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi mã OTP"}
            </Button>
          </form>
        </CardContent>
      </div>
    </Card>
  );
}

function VerifyOtpCard({
  email,
  onBackToForgot,
  onNext,
}: {
  email: string;
  onBackToForgot: () => void;
  onNext: (otp: string) => void;
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 chữ số");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp(email, otp);
      toast.success("Xác thực thành công");
      onNext(otp);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Mã OTP không chính xác hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[440px] shadow-lg border rounded-lg overflow-hidden font-semibold">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-slate-50" />
        <CardContent className="relative p-8 sm:p-10">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={onBackToForgot}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold text-[#1d4ed8]">Xác thực OTP</h2>
          </div>
          <p className="text-sm text-slate-600 mb-6 font-medium">
            Mã xác thực đã được gửi đến: <span className="font-semibold text-blue-600">{email}</span>. Vui lòng kiểm tra hộp thư.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInputComp
              label="Mã OTP"
              name="otp"
              value={otp}
              onChange={(v) => setOtp(v)}
              placeholder="123456"
              required
            />
            <Button
              type="submit"
              className="w-full bg-[#c81e1e] hover:bg-[#b51a1a]"
              disabled={loading}
            >
              {loading ? "Đang xác thực..." : "Xác thực"}
            </Button>
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => {
                  toast.promise(authService.forgotPasswordRequest(email), {
                    loading: "Đang gửi lại mã...",
                    success: "Mã OTP mới đã được gửi",
                    error: "Gửi lại mã thất bại",
                  });
                }}
              >
                Gửi lại mã OTP
              </button>
            </div>
          </form>
        </CardContent>
      </div>
    </Card>
  );
}

function ResetPasswordCard({
  email,
  otp,
  onSuccess,
}: {
  email: string;
  otp: string;
  onSuccess: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ email, otp, newPassword });
      toast.success("Đặt lại mật khẩu thành công");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[440px] shadow-lg border rounded-lg overflow-hidden font-semibold">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-slate-50" />
        <CardContent className="relative p-8 sm:p-10">
          <h2 className="text-xl font-semibold text-[#1d4ed8] mb-6">Đặt lại mật khẩu</h2>
          <p className="text-sm text-slate-600 mb-6 font-medium">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInputComp
              label="Mật khẩu mới"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(v) => setNewPassword(v)}
              required
            />
            <FormInputComp
              label="Xác nhận mật khẩu mới"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(v) => setConfirmPassword(v)}
              required
            />
            <Button
              type="submit"
              className="w-full bg-[#c81e1e] hover:bg-[#b51a1a]"
              disabled={loading}
            >
              {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </Button>
          </form>
        </CardContent>
      </div>
    </Card>
  );
}
