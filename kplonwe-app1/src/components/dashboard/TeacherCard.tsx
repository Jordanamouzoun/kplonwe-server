import { Award, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TeacherCardProps {
  teacher: TeacherProps_;
  showContact?: boolean;
}

export function TeacherCard({ teacher, showContact = false }: TeacherCardProps) {
  return (
    <article className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {teacher.firstName} {teacher.lastName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{teacher.subject}</p>
        </div>
        {teacher.isPremium && (
          <div
            className="flex items-center gap-1 text-yellow-600"
            aria-label="Enseignant premium"
          >
            <Award size={20} aria-hidden="true" />
            <span className="text-xs font-medium">Premium</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <Star size={16} className="text-yellow-500" aria-hidden="true" />
          <span>{teacher.rating}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={16} aria-hidden="true" />
          <span>{teacher.studentsCount} élèves</span>
        </div>
      </div>

      {showContact && (
        <Button size="sm" fullWidth>
          Contacter
        </Button>
      )}
    </article>
  );
}
