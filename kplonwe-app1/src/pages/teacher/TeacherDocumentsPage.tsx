import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, Trash2, Download, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Document {
  id: string;
  type: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  status: string;
  uploadedAt: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export function TeacherDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState('DIPLOMA');

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      setLoading(true);
      const response = await api.get('/teachers/documents');
      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier taille (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage('Erreur: Le fichier ne doit pas dépasser 5 MB');
      setTimeout(() => setUploadMessage(''), 3000);
      return;
    }

    // Vérifier type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setUploadMessage('Erreur: Format non autorisé. Utilisez PDF, JPEG ou PNG');
      setTimeout(() => setUploadMessage(''), 3000);
      return;
    }

    try {
      setUploading(true);
      setUploadMessage('Upload en cours...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);

      const response = await api.post('/teachers/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUploadMessage(`Succès: ${file.name} uploadé avec succès. Statut: En attente de vérification.`);
        await loadDocuments();
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'upload';
      setUploadMessage(`Erreur: ${errorMsg}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadMessage(''), 5000);
    }
  }

  async function handleDelete(documentId: string, documentName: string) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${documentName}" ?`)) {
      return;
    }

    try {
      await api.delete(`/teachers/documents/${documentId}`);
      setUploadMessage(`Document "${documentName}" supprimé avec succès`);
      await loadDocuments();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erreur lors de la suppression';
      setUploadMessage(`Erreur: ${errorMsg}`);
    } finally {
      setTimeout(() => setUploadMessage(''), 3000);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  const statusConfig = {
    PENDING: { label: 'En attente', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    VERIFIED: { label: 'Vérifié', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    REJECTED: { label: 'Refusé', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  };

  const typeLabels = {
    DIPLOMA: 'Diplôme',
    CERTIFICATE: 'Certificat',
    ID_CARD: 'Pièce d\'identité',
    OTHER: 'Autre',
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ✅ ACCESSIBILITÉ: Live region pour annonces */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={uploadMessage ? 'sr-only' : 'sr-only'}
      >
        {uploadMessage}
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes documents</h1>
        <p className="text-gray-600">
          Gérez vos diplômes et certificats. Formats acceptés: PDF, JPEG, PNG (max 5 MB)
        </p>
      </header>

      {/* Section upload */}
      <section className="bg-white rounded-lg shadow-md p-6 mb-8" aria-labelledby="upload-heading">
        <h2 id="upload-heading" className="text-2xl font-bold text-gray-900 mb-4">
          Uploader un document
        </h2>

        <div className="space-y-4">
          {/* Sélection type */}
          <div>
            <label htmlFor="document-type" className="block text-sm font-medium text-gray-700 mb-2">
              Type de document
            </label>
            <select
              id="document-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Choisir le type de document"
            >
              <option value="DIPLOMA">Diplôme</option>
              <option value="CERTIFICATE">Certificat</option>
              <option value="ID_CARD">Pièce d'identité</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          {/* Input fichier */}
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Choisir un fichier
            </label>
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Choisir un fichier PDF, JPEG ou PNG. Taille maximale 5 mégaoctets."
            />
          </div>

          {/* Message feedback */}
          {uploadMessage && (
            <div
              className={`p-4 rounded-lg ${
                uploadMessage.startsWith('Succès')
                  ? 'bg-green-50 text-green-800'
                  : uploadMessage.startsWith('Erreur')
                  ? 'bg-red-50 text-red-800'
                  : 'bg-blue-50 text-blue-800'
              }`}
              role="status"
              aria-live="polite"
            >
              {uploadMessage}
            </div>
          )}
        </div>
      </section>

      {/* Liste documents */}
      <section aria-labelledby="documents-list-heading">
        <h2 id="documents-list-heading" className="text-2xl font-bold text-gray-900 mb-4">
          Documents uploadés ({documents.length})
        </h2>

        {documents.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} aria-hidden="true" />
            <p className="text-gray-600">Aucun document uploadé pour le moment</p>
          </div>
        ) : (
          <ul className="space-y-4" role="list" aria-label="Liste de vos documents">
            {documents.map((doc) => {
              const status = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.PENDING;
              const StatusIcon = status.icon;
              const typeLabel = typeLabels[doc.type as keyof typeof typeLabels] || doc.type;

              return (
                <li key={doc.id}>
                  <article
                    className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-600"
                    aria-label={`Document ${doc.originalName}, type ${typeLabel}, statut ${status.label}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <FileText size={40} className="text-primary-600" aria-hidden="true" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                            {doc.originalName}
                          </h3>

                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                            <span>{typeLabel}</span>
                            <span>•</span>
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span>•</span>
                            <time dateTime={doc.uploadedAt}>
                              {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                            </time>
                          </div>

                          {/* Statut */}
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.color}`}
                            aria-label={`Statut: ${status.label}`}
                          >
                            <StatusIcon size={16} aria-hidden="true" />
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={`${BACKEND_URL}${doc.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
                          aria-label={`Télécharger ${doc.originalName}`}
                        >
                          <Download size={20} aria-hidden="true" />
                        </a>

                        <button
                          onClick={() => handleDelete(doc.id, doc.originalName)}
                          className="p-2 text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg"
                          aria-label={`Supprimer ${doc.originalName}`}
                        >
                          <Trash2 size={20} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
