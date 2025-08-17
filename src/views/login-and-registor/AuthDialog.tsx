import { logoIcon } from "@/assets";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/BasePasswordField";
import { APP_NAME } from "@/utils/config";
import { useEffect, useState } from "react";
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

  // Hiển thị form Email & SĐT hay chưa (signup: ẩn mặc định, login: hiện mặc định)
  const [useEmailPhone, setUseEmailPhone] = useState<boolean>(false);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // Reset khi chuyển mode
  useEffect(() => {
    setUseEmailPhone(false); // login: hiện form ngay; signup: ẩn cho tới khi bấm chọn
  }, [isLogin]);

  // login: ~480px; signup: ~640px
  const widthClass = "w-[480px]";

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

        {/* Close */}
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
              sử dụng chung sẽ bị khóa , học sinh phải chịu trách nhiệm.
            </p>
          )}
        </div>

        <div className="mx-auto max-w-md">
          {/* KHU VỰC CHỌN PHƯƠNG THỨC */}
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

              <button className="w-full border rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-gray-50">
                <img
                  alt="Google"
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  className="w-5 h-5"
                />
                {isLogin ? "Đăng nhập với Google" : "Đăng ký với Google"}
              </button>
            </div>
          )}

          {/* FORM EMAIL & SĐT */}
          {useEmailPhone && (
            <form
              className="grid grid-cols-1 gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: gọi API submit
              }}
            >
              {isLogin ? (
                <>
                  {/* LOGIN FORM */}

                  <BaseInput
                    label="Email"
                    type="email"
                    name="email"
                    placeholder="Nhập địa chỉ email hoặc tên người dùng của bạn"
                    required
                  />

                  <div className="flex items-center justify-between"></div>
                  <PasswordField label="Mật khẩu" name="Mật khẩu" />

                  <Button
                    onClick={() => ""} // mở dialog
                    className="rounded-full px-4 hover:opacity-90"
                  >
                    Đăng nhập
                  </Button>
                </>
              ) : (
                <>
                  {/* SIGNUP FORM */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-1">
                      <BaseInput
                        label="Họ"
                        type="họ"
                        name="họ"
                        placeholder="Nguyễn"
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <BaseInput
                        label="Tên"
                        type="tên"
                        name="tên"
                        placeholder="Văn A"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <BaseInput
                      label="Email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div>
                    <BaseInput
                      label="Số điện thoại"
                      type="số điện thoại"
                      name="số điện thoại"
                      placeholder="09xx xxx xxx"
                      required
                    />
                  </div>

                  <PasswordField label="Mật khẩu" name="Mật khẩu" />

                  <PasswordField
                    label="Nhập lại mật khẩu"
                    name="Nhập lại mật khẩu"
                  />

                  <Button
                    onClick={() => ""} // mở dialog
                    className="rounded-full px-4 hover:opacity-90"
                  >
                    Tạo tài khoản
                  </Button>
                </>
              )}
            </form>
          )}
        </div>

        {/* Switch + footer */}
        <div className="mt-5 text-center text-sm">
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
