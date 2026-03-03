
interface StudentCardProps {
  student: StudentProps_;
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <article className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {student.firstName} {student.lastName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Dernière activité : {new Date(student.lastActivity).toLocaleDateString('fr-FR')}
          </p>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${student.progress}%` }}
                  role="progressbar"
                  aria-valuenow={student.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progression: ${student.progress}%`}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">{student.progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
