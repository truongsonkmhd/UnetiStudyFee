import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FormSelectProps {
  label: string;
  name: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  required?: boolean;
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
}

export function FormSelectComp({
  label,
  name,
  options,
  placeholder = "--Chọn--",
  required = false,
  value,
  onChange,
  error,
}: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-10 w-full px-3 py-2 text-sm border rounded-md bg-white text-left flex items-center justify-between ${
            error ? "border-red-500" : "border-slate-300"
          } hover:border-slate-400 focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-500" : "focus:ring-blue-500"
          }`}
        >
          <span
            className={selectedOption ? "text-slate-900" : "text-slate-400"}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange?.(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 ${
                    value === option.value
                      ? "bg-blue-100 text-blue-700"
                      : "text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
