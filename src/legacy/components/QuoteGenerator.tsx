import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Download, 
  Percent, 
  Euro,
  FileText,
  Building,
  User,
  Calendar,
  Zap,
  Settings
} from 'lucide-react';
import { Project, MaterialItem } from '../types/electrical';
import jsPDF from 'jspdf';

interface QuoteGeneratorProps {
  project: Project;
  onClose: () => void;
}

interface QuoteSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  clientName: string;
  clientAddress: string;
  projectAddress: string;
  subscriberBreakerType: 'monophase' | 'triphase';
  subscriberBreakerRating: number;
  globalMargin: number;
  clientDiscount: number;
  laborRate: number;
  laborHours: number;
  includeLabor: boolean;
  validityDays: number;
}

interface MaterialCategory {
  name: string;
  items: MaterialItem[];
  subtotal: number;
  supplierDiscount: number;
  margin: number;
}

const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({
  project,
  onClose
}) => {
  const [settings, setSettings] = useState<QuoteSettings>({
    companyName: 'Votre Entreprise',
    companyAddress: 'Adresse de l\'entreprise',
    companyPhone: '01 23 45 67 89',
    companyEmail: 'contact@entreprise.fr',
    clientName: '',
    clientAddress: '',
    projectAddress: '',
    subscriberBreakerType: 'monophase',
    subscriberBreakerRating: 30,
    globalMargin: 50,
    clientDiscount: 0,
    laborRate: 45,
    laborHours: 0,
    includeLabor: true,
    validityDays: 30
  });

  const [materialCategories, setMaterialCategories] = useState<MaterialCategory[]>([]);
  const [totals, setTotals] = useState({
    materialHT: 0,
    laborHT: 0,
    subtotalHT: 0,
    marginAmount: 0,
    discountAmount: 0,
    totalHT: 0,
    tva: 0,
    totalTTC: 0
  });

  useEffect(() => {
    organizeMaterialsByCategory();
  }, [project.calculations, settings]);

  useEffect(() => {
    calculateTotals();
  }, [materialCategories, settings]);

  useEffect(() => {
    // Auto-calculate labor hours based on project complexity
    if (project.calculations) {
      const baseHours = 4; // Base installation time
      const elementHours = project.elements.length * 0.5; // 30min per element
      const circuitHours = project.calculations.circuits.length * 1; // 1h per circuit
      const connectionHours = project.connections.length * 0.25; // 15min per connection
      
      const estimatedHours = Math.ceil(baseHours + elementHours + circuitHours + connectionHours);
      setSettings(prev => ({ ...prev, laborHours: estimatedHours }));
    }
  }, [project]);

  const organizeMaterialsByCategory = () => {
    if (!project.calculations) return;

    const categories: Record<string, MaterialItem[]> = {
      'Disjoncteur d\'abonné': [],
      'Appareillage mural': [],
      'Protection modulaire': [],
      'Câblage': []
    };

    // Organize materials by category
    project.calculations.materialList.forEach(item => {
      if (item.name.includes('abonné')) {
        categories['Disjoncteur d\'abonné'].push(item);
      } else if (item.category === 'Appareillage mural') {
        categories['Appareillage mural'].push(item);
      } else if (item.category === 'Protection') {
        categories['Protection modulaire'].push(item);
      } else if (item.category === 'Câblage') {
        categories['Câblage'].push(item);
      }
    });

    // Create category objects with settings
    const categoryList: MaterialCategory[] = Object.entries(categories).map(([name, items]) => {
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      // Get supplier discount and margin from project settings
      let supplierDiscount = 0;
      let margin = settings.globalMargin;
      
      if (name === 'Appareillage mural') {
        supplierDiscount = project.settings?.wallMountedSupplierDiscount || 15;
        margin = project.settings?.wallMountedMargin || 25;
      } else if (name === 'Protection modulaire') {
        supplierDiscount = project.settings?.modularSupplierDiscount || 20;
        margin = project.settings?.modularMargin || 30;
      }
      
      return {
        name,
        items,
        subtotal,
        supplierDiscount,
        margin
      };
    }).filter(cat => cat.items.length > 0);

    setMaterialCategories(categoryList);
  };

  const calculateTotals = () => {
    let materialHT = 0;
    
    // Calculate material total with discounts and margins
    materialCategories.forEach(category => {
      const afterDiscount = category.subtotal * (1 - category.supplierDiscount / 100);
      const afterMargin = afterDiscount * (1 + category.margin / 100);
      materialHT += afterMargin;
    });

    const laborHT = settings.includeLabor ? settings.laborRate * settings.laborHours : 0;
    const subtotalHT = materialHT + laborHT;
    
    const discountAmount = (subtotalHT * settings.clientDiscount) / 100;
    const totalHT = subtotalHT - discountAmount;
    const tva = totalHT * 0.2; // 20% TVA
    const totalTTC = totalHT + tva;

    setTotals({
      materialHT,
      laborHT,
      subtotalHT,
      marginAmount: materialHT - materialCategories.reduce((sum, cat) => sum + cat.subtotal, 0),
      discountAmount,
      totalHT,
      tva,
      totalTTC
    });
  };

  const generateQuotePDF = () => {
    const pdf = new jsPDF();
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.text('DEVIS ÉLECTRIQUE', 105, yPosition, { align: 'center' });
    yPosition += 20;

    // Company info
    pdf.setFontSize(12);
    pdf.text(settings.companyName, 20, yPosition);
    yPosition += 6;
    pdf.setFontSize(10);
    pdf.text(settings.companyAddress, 20, yPosition);
    yPosition += 5;
    pdf.text(`Tél: ${settings.companyPhone}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`Email: ${settings.companyEmail}`, 20, yPosition);
    yPosition += 15;

    // Client info
    pdf.setFontSize(12);
    pdf.text('Client:', 20, yPosition);
    yPosition += 6;
    pdf.setFontSize(10);
    pdf.text(settings.clientName, 20, yPosition);
    yPosition += 5;
    pdf.text(settings.clientAddress, 20, yPosition);
    yPosition += 10;

    // Project info
    pdf.setFontSize(12);
    pdf.text('Projet:', 20, yPosition);
    yPosition += 6;
    pdf.setFontSize(10);
    pdf.text(project.name, 20, yPosition);
    yPosition += 5;
    pdf.text(`Adresse: ${settings.projectAddress}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`Validité: ${settings.validityDays} jours`, 20, yPosition);
    yPosition += 15;

    // Electrical summary
    if (project.calculations) {
      pdf.setFontSize(12);
      pdf.text('CARACTÉRISTIQUES ÉLECTRIQUES', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.text(`Disjoncteur d'abonné: ${settings.subscriberBreakerRating}A ${settings.subscriberBreakerType}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Puissance totale pondérée: ${project.calculations.totalPower}W`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Nombre de circuits: ${project.calculations.circuits.length}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Éléments électriques: ${project.elements.length}`, 20, yPosition);
      yPosition += 15;
    }

    // Material categories
    materialCategories.forEach(category => {
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.text(category.name.toUpperCase(), 20, yPosition);
      yPosition += 10;

      // Table headers
      pdf.setFontSize(9);
      pdf.text('Désignation', 20, yPosition);
      pdf.text('Qté', 110, yPosition);
      pdf.text('P.U. HT', 130, yPosition);
      pdf.text('Remise', 150, yPosition);
      pdf.text('Marge', 170, yPosition);
      pdf.text('Total HT', 185, yPosition);
      yPosition += 5;

      // Line under headers
      pdf.line(20, yPosition, 200, yPosition);
      yPosition += 5;

      // Category items
      category.items.forEach(item => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }

        const discountedPrice = item.unitPrice * (1 - category.supplierDiscount / 100);
        const finalPrice = discountedPrice * (1 + category.margin / 100);
        const totalPrice = finalPrice * item.quantity;

        pdf.text(item.name.substring(0, 35), 20, yPosition);
        pdf.text(item.quantity.toString(), 110, yPosition);
        pdf.text(`${item.unitPrice.toFixed(2)}€`, 130, yPosition);
        pdf.text(`${category.supplierDiscount}%`, 150, yPosition);
        pdf.text(`${category.margin}%`, 170, yPosition);
        pdf.text(`${totalPrice.toFixed(2)}€`, 185, yPosition);
        yPosition += 5;
      });

      // Category subtotal
      const categoryTotal = category.items.reduce((sum, item) => {
        const discountedPrice = item.unitPrice * (1 - category.supplierDiscount / 100);
        const finalPrice = discountedPrice * (1 + category.margin / 100);
        return sum + (finalPrice * item.quantity);
      }, 0);

      yPosition += 3;
      pdf.setFontSize(10);
      pdf.text(`Sous-total ${category.name}:`, 140, yPosition);
      pdf.text(`${categoryTotal.toFixed(2)}€`, 185, yPosition);
      yPosition += 10;
    });

    // Labor
    if (settings.includeLabor && settings.laborHours > 0) {
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.text('MAIN D\'ŒUVRE', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(9);
      pdf.text('Désignation', 20, yPosition);
      pdf.text('Heures', 110, yPosition);
      pdf.text('Taux HT', 130, yPosition);
      pdf.text('Total HT', 185, yPosition);
      yPosition += 5;

      pdf.line(20, yPosition, 200, yPosition);
      yPosition += 5;

      pdf.text('Installation électrique complète', 20, yPosition);
      pdf.text(settings.laborHours.toString(), 110, yPosition);
      pdf.text(`${settings.laborRate.toFixed(2)}€`, 130, yPosition);
      pdf.text(`${totals.laborHT.toFixed(2)}€`, 185, yPosition);
      yPosition += 15;
    }

    // Totals
    pdf.setFontSize(10);
    pdf.text('Fournitures HT:', 130, yPosition);
    pdf.text(`${totals.materialHT.toFixed(2)}€`, 185, yPosition);
    yPosition += 6;

    if (settings.includeLabor && totals.laborHT > 0) {
      pdf.text('Main d\'œuvre HT:', 130, yPosition);
      pdf.text(`${totals.laborHT.toFixed(2)}€`, 185, yPosition);
      yPosition += 6;
    }

    pdf.text('Sous-total HT:', 130, yPosition);
    pdf.text(`${totals.subtotalHT.toFixed(2)}€`, 185, yPosition);
    yPosition += 6;

    if (settings.clientDiscount > 0) {
      pdf.text(`Remise client (${settings.clientDiscount}%):`, 130, yPosition);
      pdf.text(`-${totals.discountAmount.toFixed(2)}€`, 185, yPosition);
      yPosition += 6;
    }

    pdf.text('Total HT:', 130, yPosition);
    pdf.text(`${totals.totalHT.toFixed(2)}€`, 185, yPosition);
    yPosition += 6;

    pdf.text('TVA (20%):', 130, yPosition);
    pdf.text(`${totals.tva.toFixed(2)}€`, 185, yPosition);
    yPosition += 6;

    pdf.setFontSize(12);
    pdf.text('TOTAL TTC:', 130, yPosition);
    pdf.text(`${totals.totalTTC.toFixed(2)}€`, 185, yPosition);

    // Footer
    yPosition = 280;
    pdf.setFontSize(8);
    pdf.text(`Conditions: Devis valable ${settings.validityDays} jours. Acompte de 30% à la commande.`, 20, yPosition);
    pdf.text('Installation conforme à la norme NF C 15-100', 20, yPosition + 5);
    pdf.text('Garantie décennale - Assurance responsabilité civile professionnelle', 20, yPosition + 10);

    pdf.save(`devis-${project.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  const handleSettingChange = (key: keyof QuoteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateCategoryMargin = (categoryName: string, margin: number) => {
    setMaterialCategories(prev => prev.map(cat => 
      cat.name === categoryName ? { ...cat, margin } : cat
    ));
  };

  const updateCategoryDiscount = (categoryName: string, supplierDiscount: number) => {
    setMaterialCategories(prev => prev.map(cat => 
      cat.name === categoryName ? { ...cat, supplierDiscount } : cat
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Générateur de Devis Avancé</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={generateQuotePDF}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              <Download className="w-4 h-4 inline mr-1" />
              Télécharger PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings - Left Column */}
            <div className="space-y-6">
              {/* Company info */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Informations Entreprise
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => handleSettingChange('companyName', e.target.value)}
                    placeholder="Nom de l'entreprise"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  <textarea
                    value={settings.companyAddress}
                    onChange={(e) => handleSettingChange('companyAddress', e.target.value)}
                    placeholder="Adresse de l'entreprise"
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="text"
                      value={settings.companyPhone}
                      onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
                      placeholder="Téléphone"
                      className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                    <input
                      type="email"
                      value={settings.companyEmail}
                      onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                      placeholder="Email"
                      className="px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Client info */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Informations Client
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={settings.clientName}
                    onChange={(e) => handleSettingChange('clientName', e.target.value)}
                    placeholder="Nom du client"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  <textarea
                    value={settings.clientAddress}
                    onChange={(e) => handleSettingChange('clientAddress', e.target.value)}
                    placeholder="Adresse du client"
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  <input
                    type="text"
                    value={settings.projectAddress}
                    onChange={(e) => handleSettingChange('projectAddress', e.target.value)}
                    placeholder="Adresse du chantier"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                </div>
              </div>

              {/* Electrical settings */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Configuration Électrique
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Type d'abonnement</label>
                    <select
                      value={settings.subscriberBreakerType}
                      onChange={(e) => handleSettingChange('subscriberBreakerType', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    >
                      <option value="monophase">Monophasé</option>
                      <option value="triphase">Triphasé</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Calibre disjoncteur d'abonné</label>
                    <select
                      value={settings.subscriberBreakerRating}
                      onChange={(e) => handleSettingChange('subscriberBreakerRating', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    >
                      {settings.subscriberBreakerType === 'monophase' ? (
                        <>
                          <option value={15}>15/45A (3.45kW)</option>
                          <option value={30}>30/60A (6.9kW)</option>
                          <option value={60}>60A (13.8kW)</option>
                        </>
                      ) : (
                        <>
                          <option value={10}>10/30A (6kW)</option>
                          <option value={30}>30/60A (18kW)</option>
                          <option value={60}>60A (36kW)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Material Categories - Middle Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Matériel par Catégorie
              </h3>
              
              {materialCategories.map(category => (
                <div key={category.name} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white">{category.name}</h4>
                    <span className="text-xs text-gray-400">{category.items.length} articles</span>
                  </div>

                  {/* Category settings */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Remise (%)</label>
                      <input
                        type="number"
                        value={category.supplierDiscount}
                        onChange={(e) => updateCategoryDiscount(category.name, parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                        min="0"
                        max="50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Marge (%)</label>
                      <input
                        type="number"
                        value={category.margin}
                        onChange={(e) => updateCategoryMargin(category.name, parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {category.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="text-white truncate">{item.name}</div>
                          <div className="text-gray-400">{item.quantity} × {item.unitPrice.toFixed(2)}€</div>
                        </div>
                        <div className="text-right ml-2">
                          <div className="text-white">{item.totalPrice.toFixed(2)}€</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Category total */}
                  <div className="border-t border-gray-600 mt-2 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sous-total HT:</span>
                      <span className="text-white">
                        {category.items.reduce((sum, item) => {
                          const discountedPrice = item.unitPrice * (1 - category.supplierDiscount / 100);
                          const finalPrice = discountedPrice * (1 + category.margin / 100);
                          return sum + (finalPrice * item.quantity);
                        }, 0).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Labor section */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-white mb-3">Main d'œuvre</h4>
                <div>
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      checked={settings.includeLabor}
                      onChange={(e) => handleSettingChange('includeLabor', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">Inclure la main d'œuvre</span>
                  </label>
                </div>

                {settings.includeLabor && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Taux (€/h)</label>
                      <input
                        type="number"
                        value={settings.laborRate}
                        onChange={(e) => handleSettingChange('laborRate', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Heures</label>
                      <input
                        type="number"
                        value={settings.laborHours}
                        onChange={(e) => handleSettingChange('laborHours', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Totals and Summary - Right Column */}
            <div className="space-y-6">
              {/* Project summary */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Résumé du Projet</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Éléments:</span>
                    <span className="text-white ml-2">{project.elements.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Circuits:</span>
                    <span className="text-white ml-2">{project.calculations?.circuits.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Puissance:</span>
                    <span className="text-white ml-2">{project.calculations?.totalPower || 0}W</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Connexions:</span>
                    <span className="text-white ml-2">{project.connections.length}</span>
                  </div>
                </div>
              </div>

              {/* Pricing settings */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres Commerciaux
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Remise client (%)</label>
                    <input
                      type="number"
                      value={settings.clientDiscount}
                      onChange={(e) => handleSettingChange('clientDiscount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Validité (jours)</label>
                    <input
                      type="number"
                      value={settings.validityDays}
                      onChange={(e) => handleSettingChange('validityDays', parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                  <Calculator className="w-4 h-4 mr-2" />
                  Récapitulatif Financier
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Fournitures HT:</span>
                    <span className="text-white">{totals.materialHT.toFixed(2)}€</span>
                  </div>
                  
                  {settings.includeLabor && totals.laborHT > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Main d'œuvre HT:</span>
                      <span className="text-white">{totals.laborHT.toFixed(2)}€</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm border-t border-gray-600 pt-2">
                    <span className="text-gray-400">Sous-total HT:</span>
                    <span className="text-white">{totals.subtotalHT.toFixed(2)}€</span>
                  </div>
                  
                  {settings.clientDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Remise client ({settings.clientDiscount}%):</span>
                      <span className="text-red-400">-{totals.discountAmount.toFixed(2)}€</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total HT:</span>
                    <span className="text-white">{totals.totalHT.toFixed(2)}€</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">TVA (20%):</span>
                    <span className="text-white">{totals.tva.toFixed(2)}€</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold border-t border-gray-600 pt-2">
                    <span className="text-white">TOTAL TTC:</span>
                    <span className="text-green-400">{totals.totalTTC.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteGenerator;