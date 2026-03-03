import { CheckCircle, MessageSquare, FileCheck } from 'lucide-react';

interface ActivityCardProps {
  activity: ActivityProps_;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const icons = {
    quiz_completed: CheckCircle,
    message_received: MessageSquare,
    assignment_graded: FileCheck,
  };

  const Icon = icons[activity.type];

  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex-shrink-0 text-primary-600">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(activity.timestamp).toLocaleString('fr-FR')}
        </p>
      </div>
    </div>
  );
}
