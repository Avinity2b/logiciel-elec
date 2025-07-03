# 📦 Installation ElectriCAD AI

## 🚀 Installation Rapide

### 1. Prérequis
```bash
# Vérifier Node.js (version 18+ requise)
node --version

# Vérifier npm
npm --version
```

### 2. Installation des Dépendances
```bash
# Dans le dossier du projet
npm install
```

### 3. Lancement
```bash
# Développement
npm run dev

# Production
npm run build
npm run preview
```

## 🔧 Configuration

### Variables d'Environnement
Aucune variable requise pour le fonctionnement de base.

### Ports
- Développement : http://localhost:5173
- Preview : http://localhost:4173

## ✅ Vérification

### Tests de Fonctionnement
1. **Interface** : Application se charge sans erreur
2. **Symboles** : Barre d'outils affiche les symboles électriques
3. **Canvas** : Glisser-déposer fonctionne
4. **Import** : Bouton Import/Export accessible
5. **Calculs** : Bouton "Calculer" opérationnel

### Dépannage Courant

#### Erreur de Port
```bash
# Si le port 5173 est occupé
npm run dev -- --port 3000
```

#### Problème de Dépendances
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

#### Erreur TypeScript
```bash
# Vérifier la configuration
npm run type-check
```

## 📁 Structure Attendue

Après installation, vous devriez avoir :
```
node_modules/     ✅ Dépendances installées
dist/            ✅ (après build)
src/             ✅ Code source
public/          ✅ Assets publics
package.json     ✅ Configuration npm
```

## 🚀 Prêt pour Production

Une fois l'installation validée :
1. `npm run build` génère le dossier `dist/`
2. Déployez `dist/` sur votre serveur web
3. Application prête à l'emploi !

---

**Installation complète et fonctionnelle** ✅