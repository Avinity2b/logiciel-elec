# 🚀 Guide de Déploiement - ElectriCAD AI

## 📦 Contenu du Package

Ce package contient l'intégralité du code source du logiciel ElectriCAD AI :

### 🗂️ Structure Complète
```
ElectriCAD-AI/
├── public/                    # Assets publics
│   ├── pdf.worker.min.js     # Worker PDF.js local
│   └── vite.svg              # Favicon
├── src/                      # Code source principal
│   ├── components/           # Composants React
│   ├── data/                # Bases de données
│   ├── types/               # Types TypeScript
│   ├── utils/               # Utilitaires
│   ├── App.tsx              # App principale
│   ├── main.tsx             # Point d'entrée
│   └── index.css            # Styles globaux
├── package.json             # Dépendances npm
├── vite.config.ts          # Configuration Vite
├── tailwind.config.js      # Configuration Tailwind
├── tsconfig.json           # Configuration TypeScript
├── eslint.config.js        # Configuration ESLint
└── README.md               # Documentation
```

## 🛠️ Installation et Lancement

### 1. Prérequis
- Node.js 18+ (recommandé : 20+)
- npm ou yarn
- Git (optionnel)

### 2. Installation
```bash
# Cloner ou extraire le projet
cd ElectriCAD-AI

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build de production
npm run build
```

### 3. Vérification
- Développement : http://localhost:5173
- Build : dossier `dist/` généré

## 📋 Dépendances Principales

### Production
- react: ^18.3.1
- react-dom: ^18.3.1
- konva: ^9.3.20
- react-konva: ^18.2.10
- react-dnd: ^16.0.1
- lucide-react: ^0.344.0
- html2canvas: ^1.4.1
- jspdf: ^2.5.1
- pdfjs-dist: ^4.0.379
- file-saver: ^2.0.5

### Développement
- vite: ^5.4.2
- typescript: ^5.5.3
- tailwindcss: ^3.4.1
- eslint: ^9.9.1

## 🚀 Déploiement Production

### Build
```bash
npm run build
```

### Serveur Web
Le dossier `dist/` peut être déployé sur :
- Netlify
- Vercel
- Apache/Nginx
- Tout serveur statique

### Configuration Serveur
Aucune configuration backend requise.
Application 100% frontend.

## 🔧 Personnalisation

### Symboles Électriques
- Fichier : `src/data/symbolsDatabase.ts`
- URLs Supabase configurées
- Ajout facile de nouveaux symboles

### Équipements
- Fichier : `src/data/equipmentDatabase.ts`
- Marques : Schneider, Legrand, Hager, ABB
- Prix et références modifiables

### Styles
- Tailwind CSS configuré
- Fichier : `tailwind.config.js`
- Styles globaux : `src/index.css`

## 📞 Support Technique

En cas de problème :
1. Vérifier Node.js version (18+)
2. Supprimer `node_modules` et relancer `npm install`
3. Vérifier les ports (5173 par défaut)
4. Consulter les logs de console

## ✅ Checklist Déploiement

- [ ] Node.js 18+ installé
- [ ] `npm install` sans erreur
- [ ] `npm run dev` fonctionne
- [ ] `npm run build` génère `dist/`
- [ ] Application accessible en local
- [ ] Import/Export PDF fonctionne
- [ ] Symboles électriques se chargent
- [ ] Calculs NF C 15-100 opérationnels

---

**Package complet et prêt pour production** ✅