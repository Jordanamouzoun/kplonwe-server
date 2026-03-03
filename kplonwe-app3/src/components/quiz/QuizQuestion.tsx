import { useState } from 'react';
import type { QuizQuestion as QuizQuestionType } from '@/types';

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  showCorrectAnswer?: boolean;
  disabled?: boolean;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showCorrectAnswer = false,
  disabled = false,
}: QuizQuestionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Question {questionNumber} sur {totalQuestions} ({question.points} points)
        </p>
        <h3 className="text-xl font-semibold text-gray-900" id={`question-${question.id}`}>
          {question.text}
        </h3>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={`question-${question.id}`}
        className="space-y-3"
      >
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = showCorrectAnswer && index === question.correctAnswer;
          const isWrong = showCorrectAnswer && isSelected && index !== question.correctAnswer;

          return (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => !disabled && onAnswerSelect(index)}
              disabled={disabled}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isCorrect
                  ? 'border-green-500 bg-green-50'
                  : isWrong
                  ? 'border-red-500 bg-red-50'
                  : isSelected
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400'
              } ${
                disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
              } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              aria-label={`Option ${index + 1}: ${option}${isCorrect ? ' (Réponse correcte)' : ''}${isWrong ? ' (Réponse incorrecte)' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isCorrect
                      ? 'border-green-500 bg-green-500'
                      : isWrong
                      ? 'border-red-500 bg-red-500'
                      : isSelected
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-400'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                  {isCorrect && (
                    <span className="text-white text-sm font-bold">✓</span>
                  )}
                  {isWrong && (
                    <span className="text-white text-sm font-bold">✗</span>
                  )}
                </div>
                <span className={`flex-1 ${isSelected ? 'font-semibold' : ''}`}>
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {showCorrectAnswer && (
        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded" role="status" aria-live="polite">
          <p className="text-sm text-blue-900">
            {selectedAnswer === question.correctAnswer ? (
              <span>
                <strong>Correct !</strong> Vous avez gagné {question.points} points.
              </span>
            ) : (
              <span>
                <strong>Incorrect.</strong> La bonne réponse était : {question.options[question.correctAnswer]}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
