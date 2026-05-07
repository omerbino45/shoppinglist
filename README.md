# 🛒 רשימת קניות משפחתית

אפליקציית רשימת קניות משפחתית עם תמיכה במספר משתמשים, רשימת מאסטר משותפת, ורשימות קניות אישיות.

## Setup

### 1. Firebase
1. צור פרויקט ב-[Firebase Console](https://console.firebase.google.com)
2. הפעל **Firestore Database** (Start in test mode)
3. צור Web App ב-Project Settings
4. העתק את הקונפיג

### 2. Environment Variables
```bash
cp .env.example .env.local
```
מלא את הפרטים מ-Firebase.

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Deploy to Netlify
1. חבר את הריפו ל-Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. הוסף את ה-env vars ב-Netlify (Site settings > Environment variables)

## Firestore Structure
```
users/          → { id, name, createdAt }
config/
  masterList    → { categories: [...] }
  masterTrash   → { items: [...], categories: [...] }
shoppingLists/  → { id, visibleId, userId, date, store, items, closed, createdAt }
```

## Tech Stack
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Firebase Firestore
