import React, { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number; // decimal like 0.92
  duration?: number; // ms
  decimals?: number;
  showPercent?: boolean;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 500,
  decimals = 2,
  showPercent = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentValue = parseFloat((value * progress).toFixed(decimals));
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, decimals]);

  const percent = Math.round(displayValue * 100);

  return (
    <span>
      {displayValue.toFixed(decimals)}{" "}
      {showPercent && <span style={{ color: "#888" }}>({percent}%)</span>}
    </span>
  );
};

export default AnimatedNumber;
