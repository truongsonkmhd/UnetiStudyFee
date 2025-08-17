import React, { forwardRef, InputHTMLAttributes } from "react";
import clsx from "clsx";

export type BaseInputProps = {
  label?: string;
  errorText?: string;
  containerClassName?: string;
  inputClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      label,
      errorText,
      containerClassName,
      inputClassName,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx("w-full", containerClassName)}>
        {label && (
          <label className="block text-sm font-medium mb-1">{label}</label>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500",
            inputClassName,
            className
          )}
          {...props}
        />
        {errorText && <p className="mt-1 text-xs text-red-600">{errorText}</p>}
      </div>
    );
  }
);

BaseInput.displayName = "BaseInput";
export default BaseInput;
