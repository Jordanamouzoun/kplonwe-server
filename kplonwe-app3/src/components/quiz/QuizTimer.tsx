import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface QuizTimerProps {
  timeLimit: number; // en secondes
  onTimeUp: () => void;
  isPaused?: boolean;
}

export function QuizTimer({ timeLimit, onTimeUp, isPaused = false }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / timeLimit) * 100;
  const isLowTime = timeLeft < 60; // Moins d'une minute

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        isLowTime ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
      }`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-3">
        <Clock
          className={isLowTime ? 'text-red-600' : 'text-gray-600'}
          size={24}
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">Temps restant</p>
          <p
            className={`text-2xl font-bold ${
              isLowTime ? 'text-red-600' : 'text-gray-900'
            }`}
            aria-label={`${minutes} minutes et ${seconds} secondes restantes`}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </p>
        </div>
      </div>
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            isLowTime ? 'bg-red-600' : 'bg-primary-600'
          }`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={timeLeft}
          aria-valuemin={0}
          aria-valuemax={timeLimit}
        />
      </div>
      {isLowTime && (
        <p className="text-sm text-red-600 mt-2 font-semibold" role="alert">
          Attention : Moins d'une minute restante !
        </p>
      )}
    </div>
  );
}
