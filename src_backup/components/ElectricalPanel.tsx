import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Edit, 
  Save,
  Download,
  Settings,
  Shield,
  Power
} from 'lucide-react';
import { Project, Circuit, DifferentialBreaker } from '../types/electrical';
import { getEquipmentByType, getBrandById, getSeriesById } from '../data/equipmentDatabase';

interface ElectricalPanelProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onClose: () => void;
}

interface PanelRow {
  id: string;
  type: 'breaker' | 'differential' | 'empty';
  position: number;
  rating?: number;
  brand?: string;
  reference?: string;
  circuitId?: string;
  differentialId?: string;
  label?: string;
}

const ElectricalPanel: React.FC<ElectricalPanelProps> = ({
  project,
  onUpdateProject,
  onClose
}) => {
  const [panelRows, setPanelRows] = useState<PanelRow[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('schneider');
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [panelTitle, setPanelTitle] = useState('Tableau Électrique Principal');

  useEffect(() => {
    generatePanelFromCalculations();
  }, [project.calculations]);

  const generatePanelFromCalculations = () => {
    if (!project.calculations) return;

    const rows: PanelRow[] = [];
    let position = 1;

    // Add main breaker
    rows.push({
      id: 'main-breaker',
      type: 'breaker',
      position: position++,
      rating: project.calculations.mainBreaker,
      brand: selectedBrand,
      reference: `Main-${project.calculations.mainBreaker}A`,
      label: 'Disjoncteur Général'
    });

    // Add differential breakers
    project.calculations.differentialBreakers.forEach(diff => {
      rows.push({
        id: diff.id,
        type: 'differential',
        position: position++,
        rating: diff.rating,
        brand: selectedBrand,
        reference: `ID-${diff.rating}A-${diff.sensitivity}mA`,
        differentialId: diff.id,
        label: `Différentiel ${diff.rating}A ${diff.sensitivity}mA`
      });

      // Add circuits under this differential
      const circuits = project.calculations.circuits.filter(c => 
        diff.circuits.includes(c.id)
      );

      circuits.forEach(circuit => {
        rows.push({
          id: circuit.id,
          type: 'breaker',
          position: position++,
          rating: circuit.breakerRating,
          brand: selectedBrand,
          reference: `C${circuit.breakerRating}`,
          circuitId: circuit.id,
          label: circuit.name
        });
      });
    });

    // Add empty rows for expansion
    for (let i = 0; i < 6; i++) {
      rows.push({
        id: `empty-${i}`,
        type: 'empty',
        position: position++,
        label: 'Libre'
      });
    }

    setPanelRows(rows);
  };

  const updateRow = (rowId: string, updates: Partial<PanelRow>) => {
    setPanelRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, ...updates } : row
    ));
  };

  const addRow = (afterPosition: number) => {
    const newRow: PanelRow = {
      id: `custom-${Date.now()}`,
      type: 'empty',
      position: afterPosition + 0.5,
      label: 'Nouveau'
    };

    setPanelRows(prev => {
      const updated = [...prev, newRow];
      return updated.sort((a, b) => a.position - b.position)
        .map((row, index) => ({ ...row, position: index + 1 }));
    });
  };

  const deleteRow = (rowId: string) => {
    setPanelRows(prev => prev.filter(row => row.id !== rowId)
      .map((row, index) => ({ ...row, position: index + 1 })));
  };

  const exportPanelLabel = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // A5 format: 148 x 210 mm at 300 DPI
    canvas.width = 595;
    canvas.height = 842;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(panelTitle, canvas.width / 2, 60);
    
    // Project info
    ctx.font = '16px Arial';
    ctx.fillText(project.name, canvas.width / 2, 90);
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, canvas.width / 2, 110);
    
    // Panel layout
    let y = 150;
    const rowHeight = 25;
    const leftCol = 50;
    const rightCol = canvas.width - 50;
    
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    panelRows.forEach((row, index) => {
      if (row.type === 'empty') return;
      
      const x = index % 2 === 0 ? leftCol : rightCol - 200;
      
      // Row background
      ctx.fillStyle = row.type === 'differential' ? '#e3f2fd' : '#f5f5f5';
      ctx.fillRect(x - 5, y - 15, 200, rowHeight);
      
      // Border
      ctx.strokeStyle = '#cccccc';
      ctx.strokeRect(x - 5, y - 15, 200, rowHeight);
      
      // Position number
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px Arial';
      ctx.fillText(row.position.toString(), x, y);
      
      // Rating
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`${row.rating}A`, x + 20, y);
      
      // Label
      ctx.font = '10px Arial';
      ctx.fillText(row.label || '', x + 50, y);
      
      if (index % 2 === 1 || index === panelRows.length - 1) {
        y += rowHeight + 5;
      }
    });
    
    // Convert to blob and download
    canvas.toBlob(blob => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `etiquette-tableau-${project.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const getRowIcon = (type: string) => {
    switch (type) {
      case 'differential':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'breaker':
        return <Power className="w-4 h-4 text-green-500" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Tableau Électrique</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportPanelLabel}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              <Download className="w-4 h-4 inline mr-1" />
              Étiquette
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
          {/* Panel header */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Titre du tableau
              </label>
              <input
                type="text"
                value={panelTitle}
                onChange={(e) => setPanelTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Marque d'appareillage
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="schneider">Schneider Electric</option>
                <option value="legrand">Legrand</option>
                <option value="hager">Hager</option>
                <option value="abb">ABB</option>
              </select>
            </div>
          </div>

          {/* Panel layout */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300 text-center">Colonne A</h3>
                {panelRows.filter((_, index) => index % 2 === 0).map(row => (
                  <div key={row.id} className="flex items-center space-x-2 p-2 bg-gray-600 rounded">
                    <span className="w-6 text-xs text-gray-400">{row.position}</span>
                    {getRowIcon(row.type)}
                    
                    {editingRow === row.id ? (
                      <div className="flex-1 flex space-x-2">
                        <select
                          value={row.type}
                          onChange={(e) => updateRow(row.id, { type: e.target.value as any })}
                          className="px-2 py-1 bg-gray-500 rounded text-xs"
                        >
                          <option value="empty">Libre</option>
                          <option value="breaker">Disjoncteur</option>
                          <option value="differential">Différentiel</option>
                        </select>
                        
                        {row.type !== 'empty' && (
                          <>
                            <input
                              type="number"
                              value={row.rating || ''}
                              onChange={(e) => updateRow(row.id, { rating: parseInt(e.target.value) })}
                              placeholder="A"
                              className="w-12 px-1 py-1 bg-gray-500 rounded text-xs"
                            />
                            <input
                              type="text"
                              value={row.label || ''}
                              onChange={(e) => updateRow(row.id, { label: e.target.value })}
                              placeholder="Libellé"
                              className="flex-1 px-2 py-1 bg-gray-500 rounded text-xs"
                            />
                          </>
                        )}
                        
                        <button
                          onClick={() => setEditingRow(null)}
                          className="p-1 hover:bg-gray-400 rounded"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {row.rating && (
                            <span className="text-sm font-medium text-white">{row.rating}A</span>
                          )}
                          <span className="text-sm text-gray-300">{row.label}</span>
                        </div>
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setEditingRow(row.id)}
                            className="p-1 hover:bg-gray-500 rounded"
                          >
                            <Edit className="w-3 h-3 text-gray-400" />
                          </button>
                          <button
                            onClick={() => addRow(row.position)}
                            className="p-1 hover:bg-gray-500 rounded"
                          >
                            <Plus className="w-3 h-3 text-gray-400" />
                          </button>
                          <button
                            onClick={() => deleteRow(row.id)}
                            className="p-1 hover:bg-gray-500 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Right column */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300 text-center">Colonne B</h3>
                {panelRows.filter((_, index) => index % 2 === 1).map(row => (
                  <div key={row.id} className="flex items-center space-x-2 p-2 bg-gray-600 rounded">
                    <span className="w-6 text-xs text-gray-400">{row.position}</span>
                    {getRowIcon(row.type)}
                    
                    {editingRow === row.id ? (
                      <div className="flex-1 flex space-x-2">
                        <select
                          value={row.type}
                          onChange={(e) => updateRow(row.id, { type: e.target.value as any })}
                          className="px-2 py-1 bg-gray-500 rounded text-xs"
                        >
                          <option value="empty">Libre</option>
                          <option value="breaker">Disjoncteur</option>
                          <option value="differential">Différentiel</option>
                        </select>
                        
                        {row.type !== 'empty' && (
                          <>
                            <input
                              type="number"
                              value={row.rating || ''}
                              onChange={(e) => updateRow(row.id, { rating: parseInt(e.target.value) })}
                              placeholder="A"
                              className="w-12 px-1 py-1 bg-gray-500 rounded text-xs"
                            />
                            <input
                              type="text"
                              value={row.label || ''}
                              onChange={(e) => updateRow(row.id, { label: e.target.value })}
                              placeholder="Libellé"
                              className="flex-1 px-2 py-1 bg-gray-500 rounded text-xs"
                            />
                          </>
                        )}
                        
                        <button
                          onClick={() => setEditingRow(null)}
                          className="p-1 hover:bg-gray-400 rounded"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {row.rating && (
                            <span className="text-sm font-medium text-white">{row.rating}A</span>
                          )}
                          <span className="text-sm text-gray-300">{row.label}</span>
                        </div>
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setEditingRow(row.id)}
                            className="p-1 hover:bg-gray-500 rounded"
                          >
                            <Edit className="w-3 h-3 text-gray-400" />
                          </button>
                          <button
                            onClick={() => addRow(row.position)}
                            className="p-1 hover:bg-gray-500 rounded"
                          >
                            <Plus className="w-3 h-3 text-gray-400" />
                          </button>
                          <button
                            onClick={() => deleteRow(row.id)}
                            className="p-1 hover:bg-gray-500 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          {project.calculations && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-gray-700 p-3 rounded">
                <h4 className="text-sm font-medium text-gray-300 mb-1">Puissance totale</h4>
                <p className="text-lg font-bold text-white">{project.calculations.totalPower}W</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <h4 className="text-sm font-medium text-gray-300 mb-1">Circuits</h4>
                <p className="text-lg font-bold text-white">{project.calculations.circuits.length}</p>
              </div>
              <div className="bg-gray-700 p-3 rounded">
                <h4 className="text-sm font-medium text-gray-300 mb-1">Disjoncteur général</h4>
                <p className="text-lg font-bold text-white">{project.calculations.mainBreaker}A</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectricalPanel;