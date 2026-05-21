# ArjunaFit App

## Estructura del proyecto
```
/
├── index.html              ← Login
├── reset-password.html     ← Reset contraseña
├── sw.js                   ← Service Worker
├── manifest.json           ← PWA manifest
├── netlify.toml            ← Config Netlify
│
├── pages/
│   ├── dashboard.html      ← Dashboard principal
│   ├── workout.html        ← Entrenamiento del día
│   ├── onboarding.html     ← Onboarding inicial
│   ├── coach.html          ← Coach IA + micrófono
│   ├── profile.html        ← Perfil y settings
│   ├── progress.html       ← Progreso y PRs
│   └── nutrition.html      ← Nutrición + recetario
│
├── js/
│   ├── core/
│   │   ├── supabase-client.js
│   │   ├── streak.js
│   │   ├── pr-system.js
│   │   ├── coach-ai.js
│   │   ├── analytics.js
│   │   └── trial-guard.js
│   └── data/
│       └── workouts-gluteos.js
│
├── netlify/
│   └── functions/
│       └── chat.js         ← Proxy seguro OpenAI
│
├── admin/
│   └── skills.html         ← Panel Admin IA
│
├── styles/
│   ├── tokens.css
│   ├── reset.css
│   └── components.css
│
└── sql/
    └── migration_paso2.sql ← Ejecutar en Supabase

## Variables de entorno (Netlify)
OPENAI_API_KEY = sk-...

## Supabase
Ejecutar sql/migration_paso2.sql en Supabase SQL Editor.
```
