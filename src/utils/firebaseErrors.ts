export function mapFirebaseErr(error: any) : string{
    if(!error || !error.code) return "Đã xảy ra lỗi không xác định.";
     switch (error.code) {
    case "auth/user-not-found":
      return "Không tìm thấy tài khoản với email này.";
    case "auth/wrong-password":
      return "Mật khẩu không đúng.";
    case "auth/invalid-email":
      return "Email không hợp lệ.";
    case "auth/email-already-in-use":
      return "Email này đã được sử dụng.";
    case "auth/weak-password":
      return "Mật khẩu quá yếu.";
    default:
      return "Lỗi: " + error.message;
  }
}