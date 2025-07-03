# 🔧 Spécifications Techniques - ElectriCAD AI

## 🏗️ Architecture

### Stack Technologique
- **Frontend** : React 18 + TypeScript 5.5
- **Canvas** : Konva.js 9.3 + React-Konva 18.2
- **UI Framework** : Tailwind CSS 3.4
- **Icons** : Lucide React 0.344
- **Build Tool** : Vite 5.4
- **Drag & Drop** : React DnD 16.0

### Dépendances Principales
```json
{
  "react": "^18.3.1",
  "konva": "^9.3.20",
  "react-konva": "^18.2.10",
  "react-dnd": "^16.0.1",
  "html2canvas": "^1.4.1",
  "jspdf": "^2.5.1",
  "pdfjs-dist": "^4.0.379",
  "lucide-react": "^0.344.0"
}
```

## 📁 Structure du Code

### Organisation Modulaire
```
src/
├── components/           # Composants React réutilisables
│   ├── Canvas.tsx       # Canvas principal Konva
│   ├── Header.tsx       # Barre d'outils principale
│   ├── NewToolbar.tsx   # Barre symboles électriques
│   ├── PropertiesPanel.tsx # Panneau propriétés
│   ├── PlanAnalysisPanel.tsx # Analyse IA plans
│   ├── ElectricalPanel.tsx # Gestion tableaux
│   ├── QuoteGenerator.tsx # Générateur devis
│   └── ...
├── data/                # Bases de données statiques
│   ├── symbolsDatabase.ts # 70+ symboles électriques
│   └── equipmentDatabase.ts # Équipements marques
├── types/               # Types TypeScript
│   ├── electrical.ts    # Types éléments électriques
│   ├── symbols.ts       # Types symboles
│   ├── equipment.ts     # Types équipements
│   └── architectural.ts # Types analyse plans
├── utils/               # Utilitaires et logique métier
│   ├── nfc15100.ts     # Calculs conformité NF C 15-100
│   ├── planExporter.ts # Export plans haute qualité
│   ├── planAnalyzer.ts # Analyse IA plans
│   ├── schematicGenerator.ts # Génération schémas
│   └── importExportManager.ts # Gestion import/export
└── App.tsx             # Composant racine
```

## ⚡ Performance

### Optimisations Canvas
- **Konva.js** : Rendu WebGL/Canvas2D optimisé
- **Lazy Loading** : Chargement symboles à la demande
- **Virtualisation** : Rendu éléments visibles uniquement
- **Cache** : Mise en cache images et calculs

### Gestion Mémoire
- **Cleanup automatique** : Révocation URLs objets
- **Debouncing** : Limitation appels API
- **Throttling** : Limitation événements souris
- **Garbage Collection** : Nettoyage références

### Bundle Optimization
- **Tree Shaking** : Élimination code mort
- **Code Splitting** : Chargement modulaire
- **Compression** : Gzip/Brotli activé
- **Minification** : Optimisation production

## 🔒 Sécurité

### Validation Données
- **TypeScript strict** : Typage fort
- **Validation runtime** : Vérification entrées
- **Sanitization** : Nettoyage données utilisateur
- **Error Boundaries** : Gestion erreurs React

### Import/Export Sécurisé
- **Validation fichiers** : Types et tailles
- **Sandbox PDF.js** : Worker isolé
- **CORS configuré** : Sécurité cross-origin
- **CSP headers** : Content Security Policy

## 📊 Données

### Symboles Électriques
- **Source** : Supabase Storage
- **Format** : SVG optimisés
- **Catégories** : 4 principales (Prises, Commandes, Lumières, Divers)
- **Propriétés** : Puissance, tension, ampérage, etc.

### Équipements
- **Marques** : Schneider, Legrand, Hager, ABB
- **Séries** : 20+ gammes (Odace, Céliane, Resi9, etc.)
- **Références** : Codes fabricants
- **Prix** : Tarifs publics indicatifs

### Projets
- **Format** : JSON structuré
- **Stockage** : LocalStorage navigateur
- **Sauvegarde** : Export/Import fichiers
- **Versioning** : Gestion versions projets

## 🧮 Calculs NF C 15-100

### Algorithmes Conformité
```typescript
// Exemple : Calcul circuits prises 16A
const MAX_OUTLETS_PER_CIRCUIT = 8;
const OUTLET_CIRCUIT_MAX_CAPACITY = 3680; // 16A x 230V

function calculateOutletCircuits(outlets: ElectricalElement[]): Circuit[] {
  const circuits: Circuit[] = [];
  let currentCircuit: ElectricalElement[] = [];

  for (const outlet of outlets) {
    if (currentCircuit.length >= MAX_OUTLETS_PER_CIRCUIT) {
      circuits.push(createCircuit('outlet', currentCircuit, 3680, 16, 1.5));
      currentCircuit = [outlet];
    } else {
      currentCircuit.push(outlet);
    }
  }
  
  return circuits;
}
```

### Validation Règles
- **Circuits éclairage** : 8 points max, disjoncteur 10A
- **Circuits prises 16A** : 8 prises max, disjoncteur 16A
- **Circuits prises 20A** : 12 prises max, disjoncteur 20A
- **Circuits spécialisés** : 1 équipement par circuit
- **Protection différentielle** : 30mA obligatoire

## 🎨 Interface Utilisateur

### Design System
- **Couleurs** : Palette cohérente (grays, blues, greens)
- **Typography** : Inter font, hiérarchie claire
- **Spacing** : Système 8px (Tailwind)
- **Components** : Réutilisables et modulaires

### Responsive Design
- **Breakpoints** : sm(640px), md(768px), lg(1024px), xl(1280px)
- **Layout** : Flexbox et Grid CSS
- **Mobile** : Interface adaptée tactile
- **Desktop** : Optimisé souris/clavier

### Accessibilité
- **ARIA labels** : Étiquettes écrans lecteurs
- **Contraste** : WCAG AA compliant
- **Navigation clavier** : Tab, Enter, Escape
- **Focus visible** : Indicateurs visuels

## 🔧 Configuration

### Environnement Développement
```bash
# Variables d'environnement (.env.local)
VITE_APP_NAME=ElectriCAD AI
VITE_APP_VERSION=1.0.0
VITE_SUPABASE_URL=https://vmmkdqfmcbbmnnvwxbpa.supabase.co
```

### Build Production
```bash
# Configuration Vite
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
});
```

### Déploiement
- **Serveur statique** : Nginx, Apache, Netlify, Vercel
- **CDN** : CloudFlare, AWS CloudFront
- **Compression** : Gzip/Brotli recommandé
- **Cache** : Headers appropriés pour assets

## 📈 Monitoring

### Métriques Performance
- **First Contentful Paint** : < 1.5s
- **Largest Contentful Paint** : < 2.5s
- **Cumulative Layout Shift** : < 0.1
- **First Input Delay** : < 100ms

### Error Tracking
- **Console errors** : Logging développement
- **User feedback** : Messages erreur explicites
- **Fallbacks** : Dégradation gracieuse
- **Recovery** : Mécanismes récupération

## 🔄 Maintenance

### Code Quality
- **ESLint** : Règles strictes TypeScript
- **Prettier** : Formatage automatique
- **Husky** : Git hooks pré-commit
- **Tests** : Jest + React Testing Library

### Documentation
- **JSDoc** : Commentaires fonctions
- **README** : Instructions installation
- **CHANGELOG** : Historique versions
- **API docs** : Documentation interfaces

---

**Architecture robuste et évolutive** 🏗️⚡