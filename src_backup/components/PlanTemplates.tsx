import React, { useState } from 'react';
import { Home, Building, Coffee, Briefcase, Download } from 'lucide-react';
import { Project } from '../types/electrical';

interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  type: 'residential' | 'commercial';
  rooms: string[];
  backgroundImage: string;
  elements: any[];
  icon: React.ReactNode;
}

interface PlanTemplatesProps {
  onSelectTemplate: (project: Project) => void;
  onClose: () => void;
}

const PlanTemplates: React.FC<PlanTemplatesProps> = ({
  onSelectTemplate,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'residential' | 'commercial'>('all');

  const templates: PlanTemplate[] = [
    {
      id: 'studio',
      name: 'Studio 25m²',
      description: 'Studio avec coin cuisine, salle d\'eau et espace de vie',
      type: 'residential',
      rooms: ['Pièce principale', 'Cuisine', 'Salle d\'eau'],
      backgroundImage: generateStudioPlan(),
      elements: getStudioElements(),
      icon: <Home className="w-6 h-6" />
    },
    {
      id: 't2',
      name: 'T2 45m²',
      description: 'Appartement 2 pièces avec salon, chambre, cuisine et salle de bain',
      type: 'residential',
      rooms: ['Salon', 'Chambre', 'Cuisine', 'Salle de bain', 'Entrée'],
      backgroundImage: generateT2Plan(),
      elements: getT2Elements(),
      icon: <Home className="w-6 h-6" />
    },
    {
      id: 't3',
      name: 'T3 65m²',
      description: 'Appartement 3 pièces avec salon, 2 chambres, cuisine et salle de bain',
      type: 'residential',
      rooms: ['Salon', 'Chambre 1', 'Chambre 2', 'Cuisine', 'Salle de bain', 'Entrée'],
      backgroundImage: generateT3Plan(),
      elements: getT3Elements(),
      icon: <Home className="w-6 h-6" />
    },
    {
      id: 'maison',
      name: 'Maison 100m²',
      description: 'Maison individuelle avec salon, cuisine, 3 chambres et 2 salles d\'eau',
      type: 'residential',
      rooms: ['Salon', 'Cuisine', 'Chambre 1', 'Chambre 2', 'Chambre 3', 'Salle de bain', 'WC', 'Entrée'],
      backgroundImage: generateMaisonPlan(),
      elements: getMaisonElements(),
      icon: <Building className="w-6 h-6" />
    },
    {
      id: 'bureau',
      name: 'Bureau 40m²',
      description: 'Espace de bureau avec open space, bureau privé et coin pause',
      type: 'commercial',
      rooms: ['Open space', 'Bureau', 'Coin pause', 'Entrée'],
      backgroundImage: generateBureauPlan(),
      elements: getBureauElements(),
      icon: <Briefcase className="w-6 h-6" />
    },
    {
      id: 'commerce',
      name: 'Local commercial 60m²',
      description: 'Local commercial avec espace vente, réserve et bureau',
      type: 'commercial',
      rooms: ['Espace vente', 'Réserve', 'Bureau', 'WC'],
      backgroundImage: generateCommercePlan(),
      elements: getCommerceElements(),
      icon: <Coffee className="w-6 h-6" />
    }
  ];

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.type === selectedCategory
  );

  const handleSelectTemplate = (template: PlanTemplate) => {
    const project: Project = {
      id: `${template.id}-${Date.now()}`,
      name: `Nouveau projet - ${template.name}`,
      elements: template.elements,
      circuits: [],
      connections: [],
      calculations: null,
      backgroundImage: template.backgroundImage,
      settings: {
        selectedWallSeries: {},
        selectedModularSeries: {}
      }
    };

    onSelectTemplate(project);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Modèles de Plans</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {/* Category filter */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Tous les modèles
              </button>
              <button
                onClick={() => setSelectedCategory('residential')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === 'residential' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Résidentiel
              </button>
              <button
                onClick={() => setSelectedCategory('commercial')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === 'commercial' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Commercial
              </button>
            </div>
          </div>

          {/* Templates grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {filteredTemplates.map(template => (
              <div key={template.id} className="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors">
                {/* Preview image */}
                <div className="h-48 bg-gray-600 relative overflow-hidden">
                  <img
                    src={template.backgroundImage}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-2">
                    {template.icon}
                  </div>
                </div>

                {/* Template info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      template.type === 'residential' 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-blue-900 text-blue-300'
                    }`}>
                      {template.type === 'residential' ? 'Résidentiel' : 'Commercial'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mb-3">{template.description}</p>

                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-300 mb-1">Pièces incluses:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.rooms.map(room => (
                        <span key={room} className="px-2 py-1 bg-gray-600 rounded text-xs text-gray-300">
                          {room}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Utiliser ce modèle</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions to generate plan images and elements
function generateStudioPlan(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext('2d')!;
  
  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw walls
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 360, 260);
  
  // Kitchen area
  ctx.strokeRect(20, 20, 120, 80);
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(21, 21, 118, 78);
  
  // Bathroom
  ctx.strokeRect(280, 20, 100, 100);
  ctx.fillStyle = '#e0f0ff';
  ctx.fillRect(281, 21, 98, 98);
  
  // Door
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(200, 20, 15, 0, Math.PI);
  ctx.stroke();
  
  // Labels
  ctx.fillStyle = '#333333';
  ctx.font = '12px Arial';
  ctx.fillText('Cuisine', 30, 40);
  ctx.fillText('Salle d\'eau', 290, 40);
  ctx.fillText('Séjour', 200, 150);
  
  return canvas.toDataURL();
}

function getStudioElements() {
  return [
    { id: 'studio-outlet-1', type: 'outlet', x: 50, y: 60, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 'studio-outlet-2', type: 'outlet', x: 200, y: 200, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 'studio-dcl-1', type: 'dcl', x: 80, y: 60, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 'studio-dcl-2', type: 'dcl', x: 200, y: 150, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 'studio-switch-1', type: 'switch', x: 160, y: 30, rotation: 0, properties: { type: 'simple', contacts: 1 }, connections: [] }
  ];
}

function generateT2Plan(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Main outline
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 460, 360);
  
  // Living room
  ctx.strokeRect(20, 20, 280, 200);
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(21, 21, 278, 198);
  
  // Bedroom
  ctx.strokeRect(300, 20, 180, 180);
  ctx.fillStyle = '#fff0f0';
  ctx.fillRect(301, 21, 178, 178);
  
  // Kitchen
  ctx.strokeRect(20, 220, 150, 160);
  ctx.fillStyle = '#f0f8f0';
  ctx.fillRect(21, 221, 148, 158);
  
  // Bathroom
  ctx.strokeRect(170, 220, 130, 160);
  ctx.fillStyle = '#f0f0ff';
  ctx.fillRect(171, 221, 128, 158);
  
  // Hallway
  ctx.strokeRect(300, 200, 180, 180);
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(301, 201, 178, 178);
  
  // Labels
  ctx.fillStyle = '#333333';
  ctx.font = '14px Arial';
  ctx.fillText('Salon', 140, 120);
  ctx.fillText('Chambre', 360, 110);
  ctx.fillText('Cuisine', 70, 300);
  ctx.fillText('SDB', 220, 300);
  ctx.fillText('Entrée', 360, 290);
  
  return canvas.toDataURL();
}

function getT2Elements() {
  return [
    { id: 't2-outlet-1', type: 'outlet', x: 100, y: 100, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 't2-outlet-2', type: 'outlet', x: 350, y: 100, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 't2-outlet-3', type: 'outlet', x: 80, y: 280, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 't2-dcl-1', type: 'dcl', x: 160, y: 120, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 't2-dcl-2', type: 'dcl', x: 390, y: 110, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 't2-dcl-3', type: 'dcl', x: 95, y: 300, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 't2-switch-1', type: 'switch', x: 50, y: 50, rotation: 0, properties: { type: 'simple', contacts: 1 }, connections: [] }
  ];
}

function generateT3Plan(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 450;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw a more complex T3 layout
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  
  // Main outline
  ctx.strokeRect(20, 20, 560, 410);
  
  // Living room
  ctx.strokeRect(20, 20, 300, 250);
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(21, 21, 298, 248);
  
  // Kitchen
  ctx.strokeRect(20, 270, 150, 160);
  ctx.fillStyle = '#f0f8f0';
  ctx.fillRect(21, 271, 148, 158);
  
  // Bathroom
  ctx.strokeRect(170, 270, 150, 160);
  ctx.fillStyle = '#f0f0ff';
  ctx.fillRect(171, 271, 148, 158);
  
  // Bedroom 1
  ctx.strokeRect(320, 20, 130, 180);
  ctx.fillStyle = '#fff0f0';
  ctx.fillRect(321, 21, 128, 178);
  
  // Bedroom 2
  ctx.strokeRect(450, 20, 130, 180);
  ctx.fillStyle = '#f0fff0';
  ctx.fillRect(451, 21, 128, 178);
  
  // Hallway
  ctx.strokeRect(320, 200, 260, 230);
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(321, 201, 258, 228);
  
  // Labels
  ctx.fillStyle = '#333333';
  ctx.font = '14px Arial';
  ctx.fillText('Salon', 150, 140);
  ctx.fillText('Cuisine', 70, 350);
  ctx.fillText('SDB', 220, 350);
  ctx.fillText('Chambre 1', 350, 110);
  ctx.fillText('Chambre 2', 480, 110);
  ctx.fillText('Entrée/Couloir', 420, 320);
  
  return canvas.toDataURL();
}

function getT3Elements() {
  return [
    { id: 't3-outlet-1', type: 'outlet', x: 150, y: 150, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 't3-outlet-2', type: 'outlet', x: 380, y: 100, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 't3-outlet-3', type: 'outlet', x: 510, y: 100, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 't3-outlet-4', type: 'outlet', x: 80, y: 330, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 't3-dcl-1', type: 'dcl', x: 170, y: 140, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 't3-dcl-2', type: 'dcl', x: 385, y: 110, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 't3-dcl-3', type: 'dcl', x: 515, y: 110, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 't3-switch-1', type: 'switch', x: 50, y: 50, rotation: 0, properties: { type: 'simple', contacts: 1 }, connections: [] }
  ];
}

function generateMaisonPlan(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 700;
  canvas.height = 500;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 660, 460);
  
  // Multiple rooms layout for a house
  // Living room
  ctx.strokeRect(20, 20, 350, 280);
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(21, 21, 348, 278);
  
  // Kitchen
  ctx.strokeRect(20, 300, 200, 180);
  ctx.fillStyle = '#f0f8f0';
  ctx.fillRect(21, 301, 198, 178);
  
  // Bedrooms
  ctx.strokeRect(370, 20, 150, 150);
  ctx.fillStyle = '#fff0f0';
  ctx.fillRect(371, 21, 148, 148);
  
  ctx.strokeRect(520, 20, 160, 150);
  ctx.fillStyle = '#f0fff0';
  ctx.fillRect(521, 21, 158, 148);
  
  ctx.strokeRect(370, 170, 150, 130);
  ctx.fillStyle = '#f0f0ff';
  ctx.fillRect(371, 171, 148, 128);
  
  // Bathrooms
  ctx.strokeRect(520, 170, 160, 130);
  ctx.fillStyle = '#e0f0ff';
  ctx.fillRect(521, 171, 158, 128);
  
  ctx.strokeRect(220, 300, 100, 80);
  ctx.fillStyle = '#ffe0e0';
  ctx.fillRect(221, 301, 98, 78);
  
  // Hallway
  ctx.strokeRect(320, 300, 360, 180);
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(321, 301, 358, 178);
  
  // Labels
  ctx.fillStyle = '#333333';
  ctx.font = '14px Arial';
  ctx.fillText('Salon/Séjour', 150, 160);
  ctx.fillText('Cuisine', 90, 390);
  ctx.fillText('WC', 250, 340);
  ctx.fillText('Chambre 1', 420, 95);
  ctx.fillText('Chambre 2', 570, 95);
  ctx.fillText('Chambre 3', 420, 235);
  ctx.fillText('Salle de bain', 560, 235);
  ctx.fillText('Entrée/Couloir', 450, 390);
  
  return canvas.toDataURL();
}

function getMaisonElements() {
  return [
    { id: 'maison-outlet-1', type: 'outlet', x: 200, y: 150, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 'maison-outlet-2', type: 'outlet', x: 100, y: 350, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 'maison-outlet-3', type: 'outlet', x: 440, y: 90, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 'maison-outlet-4', type: 'outlet', x: 590, y: 90, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 'maison-outlet-5', type: 'outlet', x: 440, y: 230, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 'maison-dcl-1', type: 'dcl', x: 195, y: 160, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 'maison-dcl-2', type: 'dcl', x: 120, y: 390, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 'maison-dcl-3', type: 'dcl', x: 445, y: 95, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 'maison-switch-1', type: 'switch', x: 50, y: 50, rotation: 0, properties: { type: 'simple', contacts: 1 }, connections: [] }
  ];
}

function generateBureauPlan(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 350;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 460, 310);
  
  // Open space
  ctx.strokeRect(20, 20, 300, 200);
  ctx.fillStyle = '#f0f8ff';
  ctx.fillRect(21, 21, 298, 198);
  
  // Private office
  ctx.strokeRect(320, 20, 160, 120);
  ctx.fillStyle = '#fff8f0';
  ctx.fillRect(321, 21, 158, 118);
  
  // Break area
  ctx.strokeRect(320, 140, 160, 80);
  ctx.fillStyle = '#f0fff0';
  ctx.fillRect(321, 141, 158, 78);
  
  // Reception
  ctx.strokeRect(20, 220, 460, 110);
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(21, 221, 458, 108);
  
  // Labels
  ctx.fillStyle = '#333333';
  ctx.font = '14px Arial';
  ctx.fillText('Open Space', 140, 120);
  ctx.fillText('Bureau', 370, 80);
  ctx.fillText('Pause', 370, 180);
  ctx.fillText('Accueil/Entrée', 220, 280);
  
  return canvas.toDataURL();
}

function getBureauElements() {
  return [
    { id: 'bureau-outlet-1', type: 'socket_20a', x: 150, y: 100, rotation: 0, properties: { power: 4600, voltage: 230 }, connections: [] },
    { id: 'bureau-outlet-2', type: 'socket_20a', x: 380, y: 70, rotation: 0, properties: { power: 4600, voltage: 230 }, connections: [] },
    { id: 'bureau-outlet-3', type: 'outlet', x: 380, y: 170, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 'bureau-dcl-1', type: 'dcl', x: 170, y: 120, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 'bureau-dcl-2', type: 'dcl', x: 400, y: 80, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 'bureau-switch-1', type: 'switch', x: 50, y: 50, rotation: 0, properties: { type: 'simple', contacts: 1 }, connections: [] }
  ];
}

function generateCommercePlan(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 550;
  canvas.height = 400;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 510, 360);
  
  // Sales area
  ctx.strokeRect(20, 20, 350, 280);
  ctx.fillStyle = '#fff8f0';
  ctx.fillRect(21, 21, 348, 278);
  
  // Storage
  ctx.strokeRect(370, 20, 160, 180);
  ctx.fillStyle = '#f0f0f8';
  ctx.fillRect(371, 21, 158, 178);
  
  // Office
  ctx.strokeRect(370, 200, 160, 100);
  ctx.fillStyle = '#f8f0f0';
  ctx.fillRect(371, 201, 158, 98);
  
  // WC
  ctx.strokeRect(20, 300, 80, 80);
  ctx.fillStyle = '#f0f8ff';
  ctx.fillRect(21, 301, 78, 78);
  
  // Entrance/corridor
  ctx.strokeRect(100, 300, 430, 80);
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(101, 301, 428, 78);
  
  // Labels
  ctx.fillStyle = '#333333';
  ctx.font = '14px Arial';
  ctx.fillText('Espace Vente', 150, 160);
  ctx.fillText('Réserve', 420, 110);
  ctx.fillText('Bureau', 420, 250);
  ctx.fillText('WC', 45, 340);
  ctx.fillText('Entrée', 280, 340);
  
  return canvas.toDataURL();
}

function getCommerceElements() {
  return [
    { id: 'commerce-outlet-1', type: 'socket_20a', x: 200, y: 150, rotation: 0, properties: { power: 4600, voltage: 230 }, connections: [] },
    { id: 'commerce-outlet-2', type: 'outlet', x: 450, y: 100, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 'commerce-outlet-3', type: 'outlet', x: 450, y: 240, rotation: 0, properties: { power: 2500, voltage: 230 }, connections: [] },
    { id: 'commerce-dcl-1', type: 'spot', x: 195, y: 160, rotation: 0, properties: { power: 50, voltage: 230, quantity: 4 }, connections: [] },
    { id: 'commerce-dcl-2', type: 'dcl', x: 450, y: 110, rotation: 0, properties: { power: 100, voltage: 230 }, connections: [] },
    { id: 'commerce-switch-1', type: 'switch', x: 50, y: 50, rotation: 0, properties: { type: 'simple', contacts: 1 }, connections: [] }
  ];
}

export default PlanTemplates;