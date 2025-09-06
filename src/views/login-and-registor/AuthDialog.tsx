import { logoIcon } from "@/assets";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/BasePasswordField";
import { APP_NAME } from "@/utils/config";
import { useEffect, useState } from "react";
import { authService } from "@/services/AuthService";
import BaseInput from "@/components/ui/BaseInputProps ";

type Mode = "login" | "signup";

export default function AuthDialog({
  mode = "login",
  onClose,
  onSwitch,
}: {
  mode?: Mode;
  onClose: () => void;
  onSwitch?: (m: Mode) => void;
}) {
  const isLogin = mode === "login";
  const title = isLogin
    ? "Đăng nhập vào " + APP_NAME
    : "Đăng ký tài khoản " + APP_NAME;

  const [useEmailPhone, setUseEmailPhone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  useEffect(() => {
    setUseEmailPhone(false);
    setError("");
  }, [isLogin]);

  // Close dialog on successful login event
  useEffect(() => {
    const onLoggedIn = () => {
      setSubmitting(false);
      onClose();
    };
    window.addEventListener("auth:login", onLoggedIn as EventListener);
    return () =>
      window.removeEventListener("auth:login", onLoggedIn as EventListener);
  }, [onClose]);

  const widthClass = "w-[480px]";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const fd = new FormData(e.currentTarget);

    if (isLogin) {
      const identifier = (fd.get("identifier") as string)?.trim();
      const password = (fd.get("password") as string) ?? "";

      if (!identifier || !password) {
        setError("Vui lòng nhập đầy đủ email/tài khoản và mật khẩu");
        return;
      }

      try {
        setSubmitting(true);

        const req: any = { password };
        if (identifier.includes("@")) req.email = identifier;
        else req.username = identifier;

        const res = await authService.authenticate(req);
        console.log("MLEMEMEL" + res.success);

        if (res.success) {
          console.log(res.data.token + "---" + res.data.refreshToken);
          window.dispatchEvent(new Event("auth:login"));
        } else {
          setError(res.message || "Đăng nhập thất bại");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi, vui lòng thử lại");
      } finally {
        setSubmitting(false);
      }
    } else {
      alert("Flow đăng ký: cần nối API register của bạn.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className={`relative bg-white ${widthClass} max-w-[95vw] rounded-2xl p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {useEmailPhone && (
          <button
            type="button"
            className="text-sm text-gray-600 hover:underline"
            onClick={() => setUseEmailPhone(false)}
          >
            ← Quay lại
          </button>
        )}

        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-black"
          aria-label="Đóng"
        >
          ✕
        </button>

        <div className="flex flex-col items-center">
          <img
            src={logoIcon}
            alt="Logo"
            className="w-14 h-14 object-contain shrink-0"
          />
          <h2 className="text-xl font-semibold mb-2 text-center">{title}</h2>
          {!useEmailPhone && (
            <p className="text-sm text-red-500 text-center mb-5 max-w-[420px] mx-auto">
              Mỗi người nên sử dụng riêng một tài khoản, tài khoản nhiều người
              sử dụng chung sẽ bị khóa, học sinh phải chịu trách nhiệm.
            </p>
          )}
        </div>

        <div className="mx-auto max-w-md">
          {!useEmailPhone && (
            <div className="grid grid-cols-1 gap-3">
              <button
                className="w-full border rounded-xl py-2 hover:bg-gray-50"
                onClick={() => setUseEmailPhone(true)}
              >
                {isLogin
                  ? "Sử dụng email & Số điện thoại"
                  : "Đăng ký bằng email & Số điện thoại"}
              </button>

              <button
                className="w-full border rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-gray-50"
                onClick={() => alert("TODO: Đăng nhập/Đăng ký Google")}
              >
                <img
                  alt="Google"
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  className="w-5 h-5"
                />
                {isLogin ? "Đăng nhập với Google" : "Đăng ký với Google"}
              </button>
            </div>
          )}

          {useEmailPhone && (
            <form className="grid grid-cols-1 gap-3" onSubmit={handleSubmit}>
              {isLogin ? (
                <>
                  <BaseInput
                    label="tài khoản"
                    type="text"
                    name="identifier"
                    placeholder="taikhoan123"
                    required
                  />

                  <PasswordField label="Mật khẩu" name="password" />

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full px-4 hover:opacity-90"
                  >
                    {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-1">
                      <BaseInput
                        label="Họ"
                        type="text"
                        name="lastName"
                        placeholder="Nguyễn"
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <BaseInput
                        label="Tên"
                        type="text"
                        name="firstName"
                        placeholder="Văn A"
                        required
                      />
                    </div>
                  </div>

                  <BaseInput
                    label="Email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                  />
                  <BaseInput
                    label="Số điện thoại"
                    type="tel"
                    name="phone"
                    placeholder="09xx xxx xxx"
                    required
                  />
                  <PasswordField label="Mật khẩu" name="password" />
                  <PasswordField label="Nhập lại mật khẩu" name="confirm" />

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full px-4 hover:opacity-90"
                  >
                    {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                  </Button>
                </>
              )}
            </form>
          )}
        </div>

        <div className="mt-5 text-center text-sm space-y-2">
          {isLogin ? (
            <p>
              Bạn chưa có tài khoản?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => onSwitch?.("signup")}
              >
                Đăng ký
              </button>
            </p>
          ) : (
            <p>
              Bạn đã có tài khoản?{" "}
              <button
                className="text-blue-600 hover:underline"
                onClick={() => onSwitch?.("login")}
              >
                Đăng nhập
              </button>
            </p>
          )}
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={() => alert("Chức năng Quên mật khẩu")}
          >
            Quên mật khẩu ?
          </button>
        </div>
      </div>
    </div>
  );
}
