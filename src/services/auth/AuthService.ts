import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User,
} from "firebase/auth";
import { auth } from "@/services/FirebaseConfig"; 

// Đăng nhập (remember = true => lưu session local)
export async function signInEmail(email: string, password: string, remember = true) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  return signInWithEmailAndPassword(auth, email, password);
}

// Đăng ký
export function signUpEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Quên mật khẩu
export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

// Đăng xuất
export function signOutApp() {
  return signOut(auth);
}

// Lắng nghe trạng thái user (ví dụ lưu vào context)
export function observeAuth(cb: (u: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}
