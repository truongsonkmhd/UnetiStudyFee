import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Ripple {
    id: number;
    x: number;
    y: number;
}

export const RippleEffect: React.FC = () => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const newRipple: Ripple = {
                id: Date.now(),
                x: e.clientX,
                y: e.clientY,
            };

            setRipples((prev) => [...prev, newRipple]);

            setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
            }, 600);
        };

        window.addEventListener("mousedown", handleClick);
        return () => window.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            <AnimatePresence>
                {ripples.map((ripple) => (
                    <motion.span
                        key={ripple.id}
                        initial={{
                            width: 0,
                            height: 0,
                            x: ripple.x,
                            y: ripple.y,
                            opacity: 0.6,
                        }}
                        animate={{
                            width: 120,
                            height: 120,
                            x: ripple.x - 60,
                            y: ripple.y - 60,
                            opacity: 0,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute rounded-full bg-primary/40 border border-primary/30"
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
