"use client";

import { useEffect, useState } from "react";

export const CountUp = ({ to, duration = 2 }: { to: number; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (isNaN(to) || !isFinite(to)) {
            setCount(0);
            return;
        }
        let start = 0;
        const end = to;
        if (start === end) {
            setCount(end);
            return;
        }

        let incrementTime = (duration / end) * 1000;
        // Cap visuals for performance if number is huge
        if (end > 1000) incrementTime = 10;

        let timer: NodeJS.Timeout;
        let current = 0;

        const step = () => {
            // Linear ease for simple numbers, or just jump
            let jump = Math.ceil(end / (duration * 60)); // 60fps approx
            if (jump < 1) jump = 1;

            current += jump;
            if (current >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(current);
            }
        };

        timer = setInterval(step, 16); // ~60fps

        return () => clearInterval(timer);
    }, [to, duration]);

    return <span>{count}</span>;
};
