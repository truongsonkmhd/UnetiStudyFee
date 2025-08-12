import React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Facebook, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/services/auth/AuthContext";
import { mapFirebaseErr } from "@/utils/firebaseErrors";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

export default function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 p-4">
      <Card className="w-full max-w-5xl overflow-hidden border-0 shadow-2xl rounded-3xl">
        <div className="grid md:grid-cols-2 relative">
          <CardContent className="order-1 md:order-2 p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-semibold tracking-tight text-slate-800">
                  {mode === "signin" ? "Đăng nhập" : "Đăng ký"}
                </h2>
                <div className="text-sm text-slate-500">
                  {mode === "signin" ? (
                    <span>
                      Bạn mới ở đây?{" "}
                      <button
                        className="font-medium text-blue-600 hover:underline"
                        onClick={() => setMode("signup")}
                      >
                        Tạo một tài khoản
                      </button>
                    </span>
                  ) : (
                    <span>
                      Bạn chưa có tài khoản{" "}
                      <button
                        className="font-medium text-blue-600 hover:underline"
                        onClick={() => setMode("signin")}
                      >
                        Đăng nhập
                      </button>
                    </span>
                  )}
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {mode === "signin" ? <SignIn key="signin" /> : <SignUp key="signup" onSuccess={() => setMode("signin")} />
                }
              </AnimatePresence>

              <Divider text="Hoặc tiếp tục với" />
              <SocialRow />
            </div>
          </CardContent>

          <div className="order-2 md:order-1 relative overflow-hidden bg-gradient-to-b from-blue-600 to-indigo-600 text-white p-10 md:p-12">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,white,transparent_60%)]" />
            <div className="relative z-10 h-full flex flex-col justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {mode === "signin" ? (
                  <motion.div
                    key="art-signin"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl md:text-3xl font-semibold">Bạn mới ở đây?</h3>

                    <Button
                      variant="secondary"
                      className="rounded-full font-medium"
                      onClick={() => setMode("signup")}
                    >
                      Đăng nhập
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="art-signup"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-6"
                  >
                    <h3 className="text-2xl md:text-3xl font-semibold">Bạn chưa có tài khoản?</h3>
                    <Button
                      variant="secondary"
                      className="rounded-full font-medium"
                      onClick={() => setMode("signin")}
                    >
                      Đăng kí
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pointer-events-none absolute -right-24 -bottom-24 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Divider({ text }: { text: string }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-xs text-slate-500 whitespace-nowrap">{text}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function SocialRow() {
  const iconClass = "w-5 h-5";
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" className="rounded-full" size="icon" aria-label="Sign in with Facebook">
        <Facebook className={iconClass} />
      </Button>
      <Button variant="outline" className="rounded-full" size="icon" aria-label="Sign in with Google">
        <svg viewBox="0 0 533.5 544.3" className="w-4 h-4" aria-hidden>
          <path fill="#EA4335" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.2H272v95h147.2c-6.4 34-25.7 62.8-54.7 82v67h88.3c51.7-47.6 80.7-117.8 80.7-193.8z" />
          <path fill="#34A853" d="M272 544.3c73.5 0 135.3-24.3 180.4-66.1l-88.3-67c-24.5 16.5-55.9 26-92.1 26-70.8 0-130.8-47.7-152.3-111.9h-91v70.3C72.8 486.5 165.6 544.3 272 544.3z" />
          <path fill="#4A90E2" d="M119.7 325.3c-10-29.7-10-61.6 0-91.3V163.7h-91c-36.7 73.5-36.7 161.9 0 235.4l91-73.8z" />
          <path fill="#FBBC05" d="M272 107.7c38.4-.6 75.2 13.9 103.7 40.6l77.4-77.4C405.9 24.6 343.9-.1 272 0 165.6 0 72.8 57.8 28.7 145.7l91 70.3C141.2 155.4 201.2 107.7 272 107.7z" />
        </svg>
      </Button>

    </div>
  );
}

function SignIn() {
  const [remember, setRemember] = useState<boolean>(true);
  const [forgotOpen, setForgotOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const rememberedEmail = typeof window !== 'undefined' ? localStorage.getItem('auth_email') || '' : '';
  const { signIn, forgot } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
        onSubmit={async (e) => {

          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const email = String(fd.get("email") || "");
          const password = String(fd.get("password") || "");
          try {
            await signIn(email, password, remember);

            navigate("/dashboard", { replace: true });
          } catch (err: any) {
            setError(mapFirebaseErr(err));
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="si-email">Email</Label>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <Input id="si-email" name="email" type="email" defaultValue={rememberedEmail} placeholder="you@example.com" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="si-pass">Mật khẩu</Label>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <Input id="si-pass" name="password" type="password" placeholder="••••••••" required />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
            Ghi nhớ đăng nhập
          </label>
          <button type="button" onClick={() => setForgotOpen(true)} className="text-sm font-medium text-blue-600 hover:underline">
            Quên mật khẩu?
          </button>
        </div>

        <Button className="w-full rounded-full font-medium" type="submit">Đăng nhập</Button>
      </motion.form>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
            <DialogDescription>
              Nhập email của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const email = String(new FormData(e.currentTarget).get("resetEmail") || "");
            try {
              await forgot(email);
              // thông báo thành công
              setForgotOpen(false);
            } catch (err: any) {
              // hiển thị lỗi
            }
          }}>

            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email</Label>
              <Input id="resetEmail" name="resetEmail" type="email" defaultValue={rememberedEmail} placeholder="you@example.com" required />
            </div>
            <DialogFooter>
              <Button type="submit">Gửi liên kết</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SignUp({ onSuccess }: { onSuccess: () => void }) {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const email = String(fd.get("email") || "");
        const password = String(fd.get("password") || "");
        try {
          await signUp(email, password);
          onSuccess();
        } catch (err: any) {
          toast.error(mapFirebaseErr(err), { duration: 5000 });
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="su-name">Tên người dùng</Label>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          <Input id="su-name" name="username" placeholder="yourname" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-email">Email</Label>
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-400" />
          <Input id="su-email" name="email" type="email" placeholder="you@example.com" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-pass">Mật khẩu</Label>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-400" />
          <Input id="su-pass" name="password" type="password" placeholder="••••••••" required />
        </div>
      </div>
      <Button className="w-full rounded-full font-medium" type="submit">Tạo tài khoản</Button>
    </motion.form>
  );
}
