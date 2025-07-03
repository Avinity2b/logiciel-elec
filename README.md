# ElectriCAD AI - Logiciel de CAO Électrique avec IA

## 🚀 Description

ElectriCAD AI est un logiciel professionnel de conception assistée par ordinateur (CAO) spécialisé dans les installations électriques. Il combine une interface intuitive avec des fonctionnalités d'intelligence artificielle pour faciliter la création de plans électriques conformes aux normes françaises NF C 15-100.

## ✨ Fonctionnalités Principales

### 🎨 Interface de Conception
- **Canvas interactif** avec zoom et pan fluides
- **Symboles électriques normalisés** (prises, interrupteurs, éclairage, etc.)
- **Glisser-déposer** intuitif avec preview personnalisé
- **Sélection multiple** et opérations groupées
- **Connexions visuelles** entre interrupteurs et éclairages

### 📐 Outils Professionnels
- **Import/Export** PDF, JPG, PNG avec qualité maximale
- **Analyse automatique** des plans architecturaux
- **Calculs NF C 15-100** automatiques
- **Génération de schémas unifilaires**
- **Listes de matériel** avec prix et références
- **Devis automatisés** avec marges configurables

### 🤖 Intelligence Artificielle
- **Analyse de plans** avec détection automatique des pièces
- **Suggestions d'optimisation** des circuits
- **Vérification de conformité** NF C 15-100
- **Recommandations** d'amélioration

### 📊 Gestion de Projets
- **Sauvegarde/Chargement** de projets
- **Modèles prédéfinis** (studio, T2, T3, maison, bureau)
- **Gestionnaire de projets** avec organisation par dossiers
- **Recherche avancée** d'éléments

## 🛠️ Technologies Utilisées

- **Frontend**: React 18 + TypeScript
- **Canvas**: Konva.js + React-Konva
- **UI**: Tailwind CSS + Lucide React
- **PDF**: jsPDF + PDF.js
- **Drag & Drop**: React DnD
- **Build**: Vite

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation des dépendances
```bash
npm install
```

### Lancement en développement
```bash
npm run dev
```

### Build de production
```bash
npm run build
```

## 🏗️ Structure du Projet

```
src/
├── components/           # Composants React
│   ├── Canvas.tsx       # Canvas principal Konva
│   ├── Header.tsx       # Barre d'outils principale
│   ├── NewToolbar.tsx   # Barre de symboles électriques
│   ├── PropertiesPanel.tsx # Panneau de propriétés
│   └── ...
├── data/                # Bases de données
│   ├── symbolsDatabase.ts    # Symboles électriques
│   └── equipmentDatabase.ts  # Équipements et matériel
├── types/               # Types TypeScript
│   ├── electrical.ts    # Types électriques
│   ├── symbols.ts       # Types symboles
│   └── ...
├── utils/               # Utilitaires
│   ├── nfc15100.ts     # Calculs NF C 15-100
│   ├── planExporter.ts # Export de plans
│   └── ...
└── App.tsx             # Composant principal
```

## 🎯 Utilisation

### Création d'un Plan
1. **Importer un plan** (PDF/JPG/PNG) via le bouton "Import/Export"
2. **Placer des symboles** par glisser-déposer depuis la barre d'outils
3. **Connecter les éléments** en mode connexion
4. **Calculer les circuits** avec le bouton "Calculer"
5. **Exporter le résultat** au format souhaité

### Symboles Disponibles
- **Prises**: 16A, 20A, 32A, spécialisées, sorties de câble
- **Commandes**: Interrupteurs, va-et-vient, variateurs, détecteurs
- **Éclairage**: DCL, spots, appliques, projecteurs LED
- **Divers**: Climatisation, interphone, tableaux électriques

### Calculs Automatiques
- **Circuits optimisés** selon NF C 15-100
- **Disjoncteurs** et sections de câbles
- **Protection différentielle** 30mA
- **Puissance totale** pondérée
- **Vérification de conformité**

## 🔧 Configuration

### Symboles Électriques
Les symboles sont stockés dans Supabase et chargés dynamiquement. URLs configurées dans `src/data/symbolsDatabase.ts`.

### Équipements
Base de données d'équipements avec marques (Schneider, Legrand, Hager, ABB) dans `src/data/equipmentDatabase.ts`.

### Paramètres Projet
Configuration des marges, remises et séries d'équipements via le panneau Paramètres.

## 📋 Fonctionnalités Avancées

### Import/Export Professionnel
- **Import sans perte** de qualité
- **Export haute résolution** (300 DPI)
- **PDF multipages** avec métadonnées
- **Worker PDF.js local** pour fonctionnement offline

### Analyse IA de Plans
- **Détection automatique** des murs, portes, fenêtres
- **Classification des pièces** par type et surface
- **Suggestions d'implantation** électrique

### Gestion Commerciale
- **Devis détaillés** avec prix et références
- **Quantitatifs matériel** exportables
- **Marges configurables** par catégorie
- **Étiquettes de tableaux** électriques

## 🚀 Déploiement

### Build de Production
```bash
npm run build
```

### Serveur de Production
Le dossier `dist/` contient l'application buildée prête pour déploiement sur tout serveur web statique.

### Variables d'Environnement
Aucune variable d'environnement requise pour le fonctionnement de base.

## 🤝 Contribution

Le projet suit les standards de développement React/TypeScript avec:
- **ESLint** pour la qualité du code
- **TypeScript strict** pour la sécurité des types
- **Composants modulaires** pour la maintenabilité
- **Architecture claire** avec séparation des responsabilités

## 📄 Licence

Projet propriétaire - Tous droits réservés

## 📞 Support

Pour toute question ou support technique, contactez l'équipe de développement.

---

**ElectriCAD AI** - La CAO électrique intelligente et conforme NF C 15-100 🔌⚡