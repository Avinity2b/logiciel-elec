```markdown
# 📋 Plan de Migration - ElectriCAD AI

## 🎯 Objectif
Restructurer complètement l'application pour une architecture modulaire, évolutive et commercialisable.

## 📁 Nouvelle Structure Créée

### Core (Cœur stable)
```
src/core/
├── config/           # ✅ Configuration et feature flags
├── types/            # ✅ Types TypeScript centralisés  
├── constants/        # ✅ Constantes système
└── interfaces/       # ✅ Contrats de services
```

### Features (Fonctionnalités modulaires)
```
src/features/
├── canvas/           # ✅ Gestionnaire canvas
├── electrical-calculations/  # ✅ Calculs NF C 15-100
├── import-export/    # ✅ Import/Export modernisé
├── project-management/  # 🔄 À créer
└── ui-panels/        # 🔄 À créer
```

### Shared (Partagé)
```
src/shared/
├── services/         # ✅ Services de base
├── components/       # ✅ Composants UI réutilisables
├── hooks/           # ✅ Hooks React personnalisés
└── utils/           # ✅ Utilitaires communs
```

### Legacy (Transition)
```
src/legacy/
├── components/       # 📦 Anciens composants
├── utils/           # 📦 Anciens utilitaires  
└── data/           # 📦 Anciennes données
```

## 🚀 Étapes de Migration

### ✅ PHASE 1 - STRUCTURE (TERMINÉE)
- [x] Création structure modulaire
- [x] Configuration core et feature flags
- [x] Services de base et gestionnaire
- [x] Types centralisés
- [x] Pont compatibilité legacy

### 🔄 PHASE 2 - MIGRATION PROGRESSIVE (EN COURS)
- [ ] Déplacer composants vers `src/legacy/`
- [ ] Mettre à jour les imports dans App.tsx
- [ ] Tester chaque fonctionnalité
- [ ] Activer progressivement les nouvelles features

### 🔄 PHASE 3 - NOUVELLES FONCTIONNALITÉS
- [ ] Implémenter features avancées
- [ ] Système de plugins
- [ ] Mode collaboratif
- [ ] Fonctionnalités commerciales

### 🔄 PHASE 4 - NETTOYAGE
- [ ] Supprimer le dossier legacy
- [ ] Optimiser les performances
- [ ] Documentation complète
- [ ] Tests automatisés

## 📋 Checklist de Migration

### Fichiers à Déplacer
```bash
# De src/ vers src/legacy/
src/components/Header.tsx → src/legacy/components/Header.tsx
src/components/Canvas.tsx → src/legacy/components/Canvas.tsx
src/components/NewToolbar.tsx → src/legacy/components/NewToolbar.tsx
src/components/PropertiesPanel.tsx → src/legacy/components/PropertiesPanel.tsx
src/components/SettingsPanel.tsx → src/legacy/components/SettingsPanel.tsx
src/components/StatusBar.tsx → src/legacy/components/StatusBar.tsx
src/utils/nfc15100.ts → src/legacy/utils/nfc15100.ts
src/utils/exportUtils.ts → src/legacy/utils/exportUtils.ts
src/data/symbolsDatabase.ts → src/legacy/data/symbolsDatabase.ts
src/data/equipmentDatabase.ts → src/legacy/data/equipmentDatabase.ts
```

### Imports à Mettre à Jour
```typescript
// Anciens imports
import Header from './components/Header';

// Nouveaux imports  
import LegacyHeader from './legacy/components/Header';
```

## 🧪 Tests de Validation

### Test 1: Application démarre
```bash
npm run dev
# ✅ L'application doit se charger sans erreur
```

### Test 2: Fonctionnalités de base
- [ ] Placement de symboles
- [ ] Sélection d'éléments  
- [ ] Import de plans
- [ ] Calculs de circuits
- [ ] Export PDF

### Test 3: Services
```typescript
// Dans la console navigateur
serviceManager.isServiceInitialized() // doit retourner true
serviceManager.features.isEnabled('BASIC_CANVAS') // doit retourner true
```

### Test 4: Compatibilité
- [ ] Tous les composants s'affichent
- [ ] Aucune erreur console
- [ ] Performance équivalente

## 🔧 Commandes de Migration

### Créer la structure
```bash
# Créer les dossiers
mkdir -p src/core/{config,types,constants,interfaces}
mkdir -p src/features/{canvas,electrical-calculations,import-export}
mkdir -p src/shared/{services,components,hooks,utils}
mkdir -p src/legacy/{components,utils,data}
```

### Déplacer les fichiers
```bash
# Script de déplacement (à adapter selon votre OS)
mv src/components/* src/legacy/components/
mv src/utils/* src/legacy/utils/  
mv src/data/* src/legacy/data/
mv src/types/* src/legacy/types/
```

### Mettre à jour package.json
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test:migration": "tsx scripts/migration-checker.ts",
    "type-check": "tsc --noEmit"
  }
}
```

## ⚡ Features Flags de Migration

```typescript
// Pendant la migration
export const FEATURES = {
  // Legacy (toujours activé pendant transition)
  LEGACY_COMPONENTS: true,
  
  // Nouveau (à activer progressivement)
  NEW_CANVAS: false,
  NEW_CALCULATIONS: false,
  NEW_IMPORT_EXPORT: false,
  
  // Futur
  ADVANCED_FEATURES: false
};
```

## 🎯 Résultat Final

### Avant (Monolithique)
```
src/
├── App.tsx (1000+ lignes)
├── components/ (tout mélangé)
├── utils/ (code métier + utilitaires)
└── types/ (types éparpillés)
```

### Après (Modulaire)
```
src/
├── core/ (stable, ne change jamais)
├── features/ (modulaire, évolutif)
├── shared/ (réutilisable)
├── legacy/ (transition, puis supprimé)
└── App.tsx (propre, 200 lignes)
```

## 🚨 Points d'Attention

1. **Tester à chaque étape** - Ne jamais casser l'existant
2. **Feature flags** - Permettent le rollback immédiat
3. **Imports legacy** - Maintenir la compatibilité
4. **Documentation** - Expliquer chaque changement
5. **Performance** - Surveiller les régressions

## 🎉 Bénéfices Attendus

✅ **Évolutivité** - Nouvelles features sans casser l'existant  
✅ **Maintenabilité** - Code organisé et documenté  
✅ **Commercialisation** - Versions free/pro via feature flags  
✅ **Collaboration** - Structure claire pour les équipes  
✅ **Tests** - Architecture testable  
✅ **Performance** - Chargement modulaire  

---

**Migration pilotée par la sécurité et la compatibilité** 🛡️
```