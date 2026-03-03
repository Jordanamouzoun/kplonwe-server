interface QuizProgressProps {
  current: number;
  total: number;
  answered: number;
}

export function QuizProgress({ current, total, answered }: QuizProgressProps) {
  const percentage = (answered / total) * 100;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">
          Question {current} sur {total}
        </p>
        <p className="text-sm text-gray-600">
          {answered} répondue{answered > 1 ? 's' : ''}
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-primary-600 h-3 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={answered}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${answered} questions répondues sur ${total}`}
        />
      </div>
    </div>
  );
}
