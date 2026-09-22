import React, { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface CountdownTimerProps {
  initialSeconds: number;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialSeconds, onExpire }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSeconds = secondsLeft % 60;
  const isUrgent = secondsLeft < 60;

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all ${
        isUrgent
          ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse"
          : "bg-cinema-surface border-cinema-border text-cinema-cyan"
      }`}
    >
      {isUrgent ? (
        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-cinema-cyan" />
      )}
      <span>Seats locked for:</span>
      <span className="font-mono font-bold text-sm">
        {String(minutes).padStart(2, "0")}:{String(remainingSeconds).padStart(2, "0")}
      </span>
    </div>
  );
};
