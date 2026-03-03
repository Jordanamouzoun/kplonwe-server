import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Camera, Upload, X, CheckCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/** Construit l'URL affichable depuis un chemin relatif ou data URL */
function toDisplayUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith('data:') || src.startsWith('http')) return src;
  return `${BACKEND_URL}${src}`;
}

export function TeacherAvatarUploadPage() {
  const { user, updateUserAvatar, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Preview : data URL après sélection de fichier, ou URL de l'avatar actuel
  const [preview, setPreview] = useState<string | null>(user?.avatar || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setStatus('error');
      setMessage('La photo ne doit pas dépasser 2 MB');
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setStatus('error');
      setMessage('Format non autorisé — utilisez JPEG ou PNG');
      return;
    }

    // Prévisualisation locale immédiate (data URL)
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setSelectedFile(file);
    setStatus('idle');
    setMessage('');
  }

  async function handleUpload() {
    if (!selectedFile) {
      setStatus('error');
      setMessage('Veuillez sélectionner une photo');
      return;
    }

    try {
      setUploading(true);
      setStatus('idle');
      setMessage('Upload en cours…');

      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await api.post('/teachers/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const avatarPath: string = response.data.avatar; // e.g. /uploads/avatars/xyz.jpg

        // ── Mise à jour instantanée dans le context ET dans localStorage ──
        // Ceci garantit la persistance après F5 SANS round-trip supplémentaire.
        updateUserAvatar(avatarPath);

        // Rafraîchir aussi depuis le serveur en arrière-plan (double sécurité)
        refreshProfile().catch(() => {});

        setStatus('success');
        setMessage('Photo de profil mise à jour !');

        setTimeout(() => navigate(-1), 1200);
      } else {
        throw new Error(response.data.message || 'Erreur serveur');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || error.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  }

  function handleCancel() {
    // Revenir à l'avatar actuel (depuis le contexte, pas la data URL locale)
    setPreview(user?.avatar || null);
    setSelectedFile(null);
    setStatus('idle');
    setMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const currentAvatarUrl = toDisplayUrl(user?.avatar);
  const previewUrl        = toDisplayUrl(preview);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Annonces accessibilité */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">{message}</div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Photo de profil</h1>
        <p className="text-gray-600">Formats acceptés : JPEG, PNG — maximum 2 MB</p>
      </header>

      <div className="bg-white rounded-xl shadow-md p-8">

        {/* ── Avatar actuel vs prévisualisation ── */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedFile ? 'Prévisualisation' : 'Photo actuelle'}
          </h2>
          <div className="flex justify-center">
            <div className="relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Photo de profil"
                  className="w-48 h-48 rounded-full object-cover border-4 border-primary-200 shadow-md"
                  onError={(e) => {
                    // Si l'URL backend plante, cacher et afficher le placeholder
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                  <Camera size={64} className="text-gray-300" />
                </div>
              )}
              {status === 'success' && (
                <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle size={20} className="text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Avatar actuel vs nouveau côte-à-côte si fichier sélectionné */}
          {selectedFile && currentAvatarUrl && (
            <div className="mt-4 flex justify-center gap-8 text-sm text-gray-500">
              <div className="text-center">
                <img
                  src={currentAvatarUrl}
                  alt="Photo actuelle"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 mx-auto mb-1"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <span>Actuelle</span>
              </div>
              <div className="text-center">
                <img
                  src={previewUrl!}
                  alt="Nouvelle photo"
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary-400 mx-auto mb-1"
                />
                <span className="text-primary-600 font-medium">Nouvelle</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Sélection fichier ── */}
        <div className="space-y-6">
          <div>
            <label htmlFor="avatar-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Choisir une photo
            </label>
            <input
              id="avatar-upload"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileSelect}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Feedback */}
          {message && (
            <div
              className={`p-4 rounded-lg text-sm font-medium ${
                status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                status === 'error'   ? 'bg-red-50 text-red-800 border border-red-200' :
                'bg-blue-50 text-blue-800'
              }`}
              role="status"
            >
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              <Upload size={18} className="mr-2" />
              {uploading ? 'Upload en cours…' : 'Enregistrer'}
            </Button>

            {selectedFile && !uploading && (
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                <X size={18} />
                Annuler
              </button>
            )}

            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
