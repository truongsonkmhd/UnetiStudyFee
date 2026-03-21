import React from "react";
import { emptyIcon } from "@/assets";
import { motion } from "framer-motion";

interface EmptyStateProps {
    title?: string;
    description?: string;
    className?: string;
    iconSize?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = "Hành trình mới đang chờ bạn",
    description = "Hiện tại chưa có thông tin nào để hiển thị ở đây.",
    className = "",
    iconSize = "w-32 h-32",
    action,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex flex-col items-center justify-center py-20 px-10 text-center bg-muted/5 rounded-[4rem] border-2 border-dashed border-border/30 ${className}`}
        >
            <div className="relative mb-10 group">
                <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className={`${iconSize} bg-card rounded-[3rem] flex items-center justify-center border border-border/50 overflow-hidden relative z-10`}
                >
                    <motion.img
                        src={emptyIcon}
                        alt="Empty"
                        className="w-24 h-24 object-contain"
                        animate={{ rotate: [-2, 2, -2] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.div>

            </div>

            <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight uppercase">
                {title}
            </h3>
            <p className="text-muted-foreground max-w-md mb-12 text-lg font-medium leading-relaxed">
                {description}
            </p>

            {action && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    {action}
                </div>
            )}
        </motion.div>
    );
};
