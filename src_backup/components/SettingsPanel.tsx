import React, { useState } from 'react';
import { 
  Settings, 
  Plug, 
  Zap, 
  ChevronDown, 
  ChevronRight,
  Check,
  Package,
  Percent,
  Euro,
  FileText
} from 'lucide-react';
import { 
  EQUIPMENT_BRANDS, 
  WALL_MOUNTED_SERIES, 
  MODULAR_SERIES,
  getSeriesByBrand,
  getBrandById,
  getSeriesById
} from '../data/equipmentDatabase';
import { ProjectSettings } from '../types/equipment';

interface SettingsPanelProps {
  settings: ProjectSettings;
  onSettingsChange: (settings: ProjectSettings) => void;
  onClose: () => void;
}

interface BrandSeries {
  brandId: string;
  seriesId: string;
  supplierDiscount: number;
  defaultMargin: number;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose
}) => {
  const [expandedSections, setExpandedSections] = useState({
    wallMounted: true,
    modular: true,
    pricing: true
  });

  const [wallMountedSelection, setWallMountedSelection] = useState<BrandSeries>({
    brandId: 'schneider',
    seriesId: 'schneider-odace',
    supplierDiscount: 15,
    defaultMargin: 25
  });

  const [modularSelection, setModularSelection] = useState<BrandSeries>({
    brandId: 'schneider',
    seriesId: 'schneider-resi9',
    supplierDiscount: 20,
    defaultMargin: 30
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleWallMountedChange = (field: keyof BrandSeries, value: any) => {
    const updated = { ...wallMountedSelection, [field]: value };
    
    // Auto-select first series when brand changes
    if (field === 'brandId') {
      const brandSeries = getSeriesByBrand(value, 'wall_mounted');
      if (brandSeries.length > 0) {
        updated.seriesId = brandSeries[0].id;
      }
    }
    
    setWallMountedSelection(updated);
    
    // Update project settings
    onSettingsChange({
      ...settings,
      wallMountedBrand: updated.brandId,
      wallMountedSeries: updated.seriesId,
      wallMountedSupplierDiscount: updated.supplierDiscount,
      wallMountedMargin: updated.defaultMargin
    });
  };

  const handleModularChange = (field: keyof BrandSeries, value: any) => {
    const updated = { ...modularSelection, [field]: value };
    
    // Auto-select first series when brand changes
    if (field === 'brandId') {
      const brandSeries = getSeriesByBrand(value, 'modular');
      if (brandSeries.length > 0) {
        updated.seriesId = brandSeries[0].id;
      }
    }
    
    setModularSelection(updated);
    
    // Update project settings
    onSettingsChange({
      ...settings,
      modularBrand: updated.brandId,
      modularSeries: updated.seriesId,
      modularSupplierDiscount: updated.supplierDiscount,
      modularMargin: updated.defaultMargin
    });
  };

  const generateQuantitativeReport = () => {
    // Generate material quantitative without prices
    const report = {
      wallMounted: {
        brand: getBrandById(wallMountedSelection.brandId)?.name,
        series: getSeriesById(wallMountedSelection.seriesId)?.name,
        items: [
          { type: 'Prises 16A', quantity: 12, unit: 'pcs' },
          { type: 'Prises 20A', quantity: 8, unit: 'pcs' },
          { type: 'Interrupteurs simples', quantity: 6, unit: 'pcs' },
          { type: 'Variateurs', quantity: 2, unit: 'pcs' }
        ]
      },
      modular: {
        brand: getBrandById(modularSelection.brandId)?.name,
        series: getSeriesById(modularSelection.seriesId)?.name,
        items: [
          { type: 'Disjoncteurs 16A', quantity: 4, unit: 'pcs' },
          { type: 'Disjoncteurs 20A', quantity: 3, unit: 'pcs' },
          { type: 'Différentiel 40A 30mA', quantity: 1, unit: 'pcs' },
          { type: 'Coffret 3 rangées', quantity: 1, unit: 'pcs' }
        ]
      }
    };

    // Create and download PDF
    import('jspdf').then(({ default: jsPDF }) => {
      const pdf = new jsPDF();
      let yPosition = 20;

      // Title
      pdf.setFontSize(18);
      pdf.text('QUANTITATIF MATÉRIEL', 105, yPosition, { align: 'center' });
      yPosition += 20;

      // Date
      pdf.setFontSize(10);
      pdf.text(`Généré le ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 20;

      // Wall mounted equipment
      pdf.setFontSize(14);
      pdf.text('APPAREILLAGE MURAL', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.text(`Marque: ${report.wallMounted.brand}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Gamme: ${report.wallMounted.series}`, 20, yPosition);
      yPosition += 10;

      // Table headers
      pdf.text('Désignation', 20, yPosition);
      pdf.text('Quantité', 120, yPosition);
      pdf.text('Unité', 160, yPosition);
      yPosition += 5;
      pdf.line(20, yPosition, 180, yPosition);
      yPosition += 5;

      report.wallMounted.items.forEach(item => {
        pdf.text(item.type, 20, yPosition);
        pdf.text(item.quantity.toString(), 120, yPosition);
        pdf.text(item.unit, 160, yPosition);
        yPosition += 5;
      });

      yPosition += 10;

      // Modular equipment
      pdf.setFontSize(14);
      pdf.text('APPAREILLAGE MODULAIRE', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.text(`Marque: ${report.modular.brand}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Gamme: ${report.modular.series}`, 20, yPosition);
      yPosition += 10;

      // Table headers
      pdf.text('Désignation', 20, yPosition);
      pdf.text('Quantité', 120, yPosition);
      pdf.text('Unité', 160, yPosition);
      yPosition += 5;
      pdf.line(20, yPosition, 180, yPosition);
      yPosition += 5;

      report.modular.items.forEach(item => {
        pdf.text(item.type, 20, yPosition);
        pdf.text(item.quantity.toString(), 120, yPosition);
        pdf.text(item.unit, 160, yPosition);
        yPosition += 5;
      });

      // Pricing info
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.text('PARAMÈTRES TARIFAIRES', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.text(`Remise fournisseur appareillage mural: ${wallMountedSelection.supplierDiscount}%`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Marge par défaut appareillage mural: ${wallMountedSelection.defaultMargin}%`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Remise fournisseur modulaire: ${modularSelection.supplierDiscount}%`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Marge par défaut modulaire: ${modularSelection.defaultMargin}%`, 20, yPosition);

      pdf.save('quantitatif-materiel.pdf');
    });
  };

  const generateEstimativeQuote = () => {
    // Generate quote with prices and margins
    const quote = {
      wallMounted: {
        brand: getBrandById(wallMountedSelection.brandId)?.name,
        series: getSeriesById(wallMountedSelection.seriesId)?.name,
        items: [
          { type: 'Prises 16A', quantity: 12, unitPrice: 8.50, supplierDiscount: wallMountedSelection.supplierDiscount, margin: wallMountedSelection.defaultMargin },
          { type: 'Prises 20A', quantity: 8, unitPrice: 12.30, supplierDiscount: wallMountedSelection.supplierDiscount, margin: wallMountedSelection.defaultMargin },
          { type: 'Interrupteurs simples', quantity: 6, unitPrice: 6.80, supplierDiscount: wallMountedSelection.supplierDiscount, margin: wallMountedSelection.defaultMargin },
          { type: 'Variateurs', quantity: 2, unitPrice: 45.20, supplierDiscount: wallMountedSelection.supplierDiscount, margin: wallMountedSelection.defaultMargin }
        ]
      },
      modular: {
        brand: getBrandById(modularSelection.brandId)?.name,
        series: getSeriesById(modularSelection.seriesId)?.name,
        items: [
          { type: 'Disjoncteurs 16A', quantity: 4, unitPrice: 18.50, supplierDiscount: modularSelection.supplierDiscount, margin: modularSelection.defaultMargin },
          { type: 'Disjoncteurs 20A', quantity: 3, unitPrice: 21.20, supplierDiscount: modularSelection.supplierDiscount, margin: modularSelection.defaultMargin },
          { type: 'Différentiel 40A 30mA', quantity: 1, unitPrice: 85.60, supplierDiscount: modularSelection.supplierDiscount, margin: modularSelection.defaultMargin },
          { type: 'Coffret 3 rangées', quantity: 1, unitPrice: 120.00, supplierDiscount: modularSelection.supplierDiscount, margin: modularSelection.defaultMargin }
        ]
      }
    };

    import('jspdf').then(({ default: jsPDF }) => {
      const pdf = new jsPDF();
      let yPosition = 20;

      // Title
      pdf.setFontSize(18);
      pdf.text('DEVIS ESTIMATIF', 105, yPosition, { align: 'center' });
      yPosition += 20;

      // Date
      pdf.setFontSize(10);
      pdf.text(`Généré le ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 20;

      let totalHT = 0;

      // Process each category
      [quote.wallMounted, quote.modular].forEach((category, categoryIndex) => {
        pdf.setFontSize(14);
        pdf.text(categoryIndex === 0 ? 'APPAREILLAGE MURAL' : 'APPAREILLAGE MODULAIRE', 20, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        pdf.text(`Marque: ${category.brand}`, 20, yPosition);
        yPosition += 5;
        pdf.text(`Gamme: ${category.series}`, 20, yPosition);
        yPosition += 10;

        // Table headers
        pdf.text('Désignation', 20, yPosition);
        pdf.text('Qté', 90, yPosition);
        pdf.text('P.U. HT', 110, yPosition);
        pdf.text('Remise', 135, yPosition);
        pdf.text('P.U. Net', 155, yPosition);
        pdf.text('Total HT', 175, yPosition);
        yPosition += 5;
        pdf.line(20, yPosition, 195, yPosition);
        yPosition += 5;

        category.items.forEach(item => {
          const discountedPrice = item.unitPrice * (1 - item.supplierDiscount / 100);
          const sellingPrice = discountedPrice * (1 + item.margin / 100);
          const totalPrice = sellingPrice * item.quantity;
          totalHT += totalPrice;

          pdf.text(item.type, 20, yPosition);
          pdf.text(item.quantity.toString(), 90, yPosition);
          pdf.text(`${item.unitPrice.toFixed(2)}€`, 110, yPosition);
          pdf.text(`${item.supplierDiscount}%`, 135, yPosition);
          pdf.text(`${sellingPrice.toFixed(2)}€`, 155, yPosition);
          pdf.text(`${totalPrice.toFixed(2)}€`, 175, yPosition);
          yPosition += 5;
        });

        yPosition += 10;
      });

      // Totals
      const tva = totalHT * 0.2;
      const totalTTC = totalHT + tva;

      pdf.setFontSize(12);
      pdf.text('RÉCAPITULATIF', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.text('Total HT:', 130, yPosition);
      pdf.text(`${totalHT.toFixed(2)}€`, 175, yPosition);
      yPosition += 6;

      pdf.text('TVA (20%):', 130, yPosition);
      pdf.text(`${tva.toFixed(2)}€`, 175, yPosition);
      yPosition += 6;

      pdf.setFontSize(12);
      pdf.text('TOTAL TTC:', 130, yPosition);
      pdf.text(`${totalTTC.toFixed(2)}€`, 175, yPosition);

      // Footer
      yPosition += 20;
      pdf.setFontSize(8);
      pdf.text('* Devis estimatif basé sur les prix publics et marges par défaut', 20, yPosition);
      pdf.text('* Les prix peuvent varier selon les conditions commerciales', 20, yPosition + 5);

      pdf.save('devis-estimatif.pdf');
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Paramètres du Projet</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            {/* Appareillage mural */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('wallMounted')}
                className="flex items-center space-x-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              >
                {expandedSections.wallMounted ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Plug className="w-4 h-4" />
                <span>Appareillage Mural</span>
              </button>

              {expandedSections.wallMounted && (
                <div className="bg-gray-700 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Marque</label>
                      <select
                        value={wallMountedSelection.brandId}
                        onChange={(e) => handleWallMountedChange('brandId', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                      >
                        {EQUIPMENT_BRANDS.map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Gamme</label>
                      <select
                        value={wallMountedSelection.seriesId}
                        onChange={(e) => handleWallMountedChange('seriesId', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                      >
                        {getSeriesByBrand(wallMountedSelection.brandId, 'wall_mounted').map(series => (
                          <option key={series.id} value={series.id}>{series.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <Percent className="w-4 h-4 mr-1" />
                        Remise fournisseur (%)
                      </label>
                      <input
                        type="number"
                        value={wallMountedSelection.supplierDiscount}
                        onChange={(e) => handleWallMountedChange('supplierDiscount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        min="0"
                        max="50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <Euro className="w-4 h-4 mr-1" />
                        Marge par défaut (%)
                      </label>
                      <input
                        type="number"
                        value={wallMountedSelection.defaultMargin}
                        onChange={(e) => handleWallMountedChange('defaultMargin', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-600 p-3 rounded">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Sélection actuelle</h4>
                    <div className="text-sm text-gray-400">
                      <strong>{getBrandById(wallMountedSelection.brandId)?.name}</strong> - {getSeriesById(wallMountedSelection.seriesId)?.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getSeriesById(wallMountedSelection.seriesId)?.description}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Appareillage modulaire */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('modular')}
                className="flex items-center space-x-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              >
                {expandedSections.modular ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Package className="w-4 h-4" />
                <span>Appareillage Modulaire (Tableau)</span>
              </button>

              {expandedSections.modular && (
                <div className="bg-gray-700 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Marque</label>
                      <select
                        value={modularSelection.brandId}
                        onChange={(e) => handleModularChange('brandId', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                      >
                        {EQUIPMENT_BRANDS.map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Gamme de coffret/tableau</label>
                      <select
                        value={modularSelection.seriesId}
                        onChange={(e) => handleModularChange('seriesId', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                      >
                        {getSeriesByBrand(modularSelection.brandId, 'modular').map(series => (
                          <option key={series.id} value={series.id}>{series.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <Percent className="w-4 h-4 mr-1" />
                        Remise fournisseur (%)
                      </label>
                      <input
                        type="number"
                        value={modularSelection.supplierDiscount}
                        onChange={(e) => handleModularChange('supplierDiscount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        min="0"
                        max="50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                        <Euro className="w-4 h-4 mr-1" />
                        Marge par défaut (%)
                      </label>
                      <input
                        type="number"
                        value={modularSelection.defaultMargin}
                        onChange={(e) => handleModularChange('defaultMargin', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-600 p-3 rounded">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Sélection actuelle</h4>
                    <div className="text-sm text-gray-400">
                      <strong>{getBrandById(modularSelection.brandId)?.name}</strong> - {getSeriesById(modularSelection.seriesId)?.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getSeriesById(modularSelection.seriesId)?.description}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Export section */}
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('pricing')}
                className="flex items-center space-x-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
              >
                {expandedSections.pricing ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Euro className="w-4 h-4" />
                <span>Documents & Devis</span>
              </button>

              {expandedSections.pricing && (
                <div className="bg-gray-700 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={generateQuantitativeReport}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Quantitatif Matériel</span>
                    </button>

                    <button
                      onClick={generateEstimativeQuote}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                    >
                      <Euro className="w-4 h-4" />
                      <span>Devis Estimatif</span>
                    </button>
                  </div>

                  <div className="text-xs text-gray-400 space-y-1">
                    <p><strong>Quantitatif :</strong> Liste des quantités sans prix</p>
                    <p><strong>Devis estimatif :</strong> Prix avec remises et marges appliquées</p>
                    <p>Les marges peuvent être modifiées globalement ou par ligne avant export final</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;