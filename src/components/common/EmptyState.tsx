import React from "react";
import { emptyIcon } from "@/assets";

interface EmptyStateProps {
    title?: string;
    description?: string;
    className?: string;
    iconSize?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = "Không có dữ liệu",
    description = "Hiện tại chưa có thông tin nào để hiển thị ở đây.",
    className = "",
    iconSize = "w-48 h-48",
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-20 text-center ${className}`}>
            <img
                src={emptyIcon}
                alt="Không có dữ liệu"
                className={`${iconSize} object-contain mb-8 opacity-80`}
            />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                {title}
            </h3>
            <p className="text-slate-500 max-w-md font-medium text-lg leading-relaxed px-4">
                {description}
            </p>
        </div>
    );
};
