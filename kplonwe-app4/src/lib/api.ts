// ✅ CORRECTION: Réexporter apiClient au lieu de dupliquer la logique
export { apiClient as api } from '@/services/api.service';
export { apiClient as default } from '@/services/api.service';
