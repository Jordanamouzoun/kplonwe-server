import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { 
  MapPin, Briefcase, Award, Star, BookOpen, 
  DollarSign, Clock, CheckCircle, FileText, MessageSquare
} from 'lucide-react';

interface TeacherProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  profile?: {
    bio?: string;
    subjects?: string[];
    levels?: string[];
    experience?: number;
    pricePerMonth?: number;
    validationStatus: string;
    certifications?: string[];
  };
  documents?: Array<{ id: string; type: string; url: string; filename: string }>;
}

export function TeacherPublicProfilePage() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTeacher(); }, [teacherId]);

  async function loadTeacher() {
    try {
      const res = await api.get(`/teachers/${teacherId}`);
      setTeacher(res.data?.teacher || res.data);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Enseignant non trouvé</p>
      </div>
    );
  }

  const isVerified = teacher.profile?.validationStatus === 'VERIFIED';

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header avec photo de couverture */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 h-32 sm:h-48 lg:h-64 relative">
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-24 pb-12">
        
        {/* Card principale */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
          
          {/* En-tête profil */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {teacher.avatar ? (
                  <img
                    src={teacher.avatar}
                    alt={`${teacher.firstName} ${teacher.lastName}`}
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-white shadow-lg bg-primary-100 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-primary-700">
                      {teacher.firstName[0]}{teacher.lastName[0]}
                    </span>
                  </div>
                )}
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckCircle className="text-white" size={12} />
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 break-words overflow-wrap-anywhere leading-tight">
                    {teacher.firstName} {teacher.lastName}
                  </h1>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold mx-auto sm:mx-0">
                      <CheckCircle size={14} />
                      Vérifié
                    </span>
                  )}
                </div>
                
                {teacher.profile?.bio && (
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 max-w-2xl break-words">
                    {teacher.profile.bio}
                  </p>
                )}

                {/* Quick stats */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-sm text-gray-600">
                  {teacher.profile?.experience && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={16} />
                      <span>{teacher.profile.experience} ans d'expérience</span>
                    </div>
                  )}
                  {teacher.profile?.pricePerMonth && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={16} />
                      <span className="font-semibold">{teacher.profile.pricePerMonth.toLocaleString()} FCFA/mois</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-500 fill-yellow-500" size={16} />
                    <span className="font-semibold">4.8</span>
                    <span className="text-gray-400">(24 avis)</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                <Button className="flex-1 sm:flex-none">
                  <MessageSquare size={18} className="mr-2" />
                  Contacter
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Star size={18} className="mr-2" />
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Grille responsive */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Colonne gauche */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Matières */}
            {teacher.profile?.subjects && teacher.profile.subjects.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  <BookOpen size={20} />
                  Matières enseignées
                </h2>
                <div className="flex flex-wrap gap-2">
                  {teacher.profile.subjects.map((subject, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Niveaux */}
            {teacher.profile?.levels && teacher.profile.levels.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  <Award size={20} />
                  Niveaux
                </h2>
                <div className="flex flex-wrap gap-2">
                  {teacher.profile.levels.map((level, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm"
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Diplômes */}
            {teacher.documents && teacher.documents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  <FileText size={20} />
                  Diplômes et certifications
                </h2>
                <div className="space-y-3">
                  {teacher.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
                    >
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="text-primary-600" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 group-hover:text-primary-600 transition truncate">
                          {doc.filename}
                        </p>
                        <p className="text-sm text-gray-500">{doc.type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite */}
          <div className="space-y-6">
            
            {/* Tarifs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Tarifs</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Par mois</span>
                  <span className="text-lg font-bold text-gray-900">
                    {teacher.profile?.pricePerMonth?.toLocaleString() || '—'} FCFA
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <Button fullWidth>
                    Réserver un cours d'essai
                  </Button>
                </div>
              </div>
            </div>

            {/* Disponibilité */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                <Clock size={18} />
                Disponibilité
              </h3>
              <p className="text-sm text-gray-600">
                Généralement disponible en soirée et le week-end
              </p>
            </div>

            {/* Contact */}
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
              <h3 className="font-bold text-primary-900 mb-2">Intéressé ?</h3>
              <p className="text-sm text-primary-800 mb-4">
                Contactez {teacher.firstName} pour en savoir plus sur ses cours.
              </p>
              <Button fullWidth>
                <MessageSquare size={18} className="mr-2" />
                Envoyer un message
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
