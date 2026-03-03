
interface QuizCardProps {
  quiz: QuizProps_;
}

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <article className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-600">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{quiz.subject}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>{quiz.questionsCount} questions</span>
            <span>•</span>
            <time dateTime={quiz.createdAt}>
              {new Date(quiz.createdAt).toLocaleDateString('fr-FR')}
            </time>
            {quiz.completedBy !== undefined && (
              <>
                <span>•</span>
                <span>{quiz.completedBy} complétés</span>
              </>
            )}
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            quiz.status === 'published'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {quiz.status === 'published' ? 'Publié' : 'Brouillon'}
        </span>
      </div>
    </article>
  );
}
