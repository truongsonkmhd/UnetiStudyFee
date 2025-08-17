import { useEffect, useState } from "react";

export function PasswordField({
  label,
  placeholder = "••••••••",
  name,
  required = true,
}: {
  label: string;
  placeholder?: string;
  name: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="relative mt-1">
        <input
          name={name}
          type={show ? "text" : "password"}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-xl border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
          onClick={() => setShow((s) => !s)}
        >
          {/* Icon thuần text; nếu có icon SVG thì thay vào đây */}
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}
