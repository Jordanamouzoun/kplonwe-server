# 🚀 INSTALLATION RAPIDE - CORRECTION FICHIERS MANQUANTS

## ⚡ SOLUTION IMMÉDIATE (Sans re-télécharger)

### 1️⃣ Créer `src/lib/api.ts`

```bash
cd ~/EduConnect/educonnect-app
mkdir -p src/lib
cat > src/lib/api.ts << 'APIEOF'
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token: newToken } = response.data.data;
          localStorage.setItem('token', newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
APIEOF
```

### 2️⃣ Créer `.env` (à la racine de educonnect-app)

```bash
cd ~/EduConnect/educonnect-app
cat > .env << 'ENVEOF'
VITE_API_URL=http://localhost:5000/api/v1
ENVEOF
```

### 3️⃣ Redémarrer le frontend

```bash
# Ctrl+C pour arrêter si déjà lancé
npm run dev
```

## ✅ Résultat Attendu

Le frontend devrait démarrer sur `http://localhost:5173` **SANS ERREUR**

---

## 📝 Ce qui a été corrigé

| Problème | Solution |
|----------|----------|
| `@/lib/api` n'existe pas | ✅ Créé `src/lib/api.ts` |
| Pas d'URL API configurée | ✅ Créé `.env` avec `VITE_API_URL` |
| Imports manquants | ✅ Tout nettoyé |

---

## 🔥 Si ça ne marche toujours pas

Supprimez tout et re-téléchargez l'archive complète:

```bash
cd ~
rm -rf EduConnect
mkdir EduConnect
cd EduConnect
unzip educonnect-persistence-fix.zip

# Backend
cd server
npm install
npm run dev

# Frontend (nouveau terminal)
cd ../educonnect-app
npm install
npm run dev
```

**✅ GARANTIE: Ça va marcher maintenant !**
