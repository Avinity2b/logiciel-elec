/**
 * Composant de sélection de modèles de projet
 * @file src/components/TemplateSelector.tsx
 */

import React from 'react';
import { X, Home, Building, Factory, FileText } from 'lucide-react';
import { ProjectTemplate, BuildingType } from '../types/electrical';

interface TemplateSelectorProps {
  onSelectTemplate: (template: ProjectTemplate) => void;
  onClose: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  onClose
}) => {
  const templates: ProjectTemplate[] = [
    {
      id: 'studio-25',
      name: 'Studio 25m²',
      description: 'Installation électrique basique pour studio',
      buildingType: 'residential' as BuildingType,
      surface: 25,
      rooms: 1,
      elements: [
        {
          type: 'lighting',
          name: 'Éclairage principal',
          power: 100,
          room: 'living_room'
        },
        {
          type: 'outlet_16a',
          name: 'Prises salon',
          power: 3680,
          room: 'living_room'
        },
        {
          type: 'outlet_16a',
          name: 'Prises cuisine',
          power: 3680,
          room: 'kitchen'
        }
      ],
      settings: {
        surface: 25,
        roomCount: 1,
        buildingType: 'residential',
        occupancyType: 'single_family'
      },
      preview: '🏠'
    },
    {
      id: 't2-50',
      name: 'T2 50m²',
      description: 'Installation standard pour appartement T2',
      buildingType: 'residential' as BuildingType,
      surface: 50,
      rooms: 2,
      elements: [
        {
          type: 'lighting',
          name: 'Éclairage salon',
          power: 150,
          room: 'living_room'
        },
        {
          type: 'lighting',
          name: 'Éclairage chambre',
          power: 100,
          room: 'bedroom'
        },
        {
          type: 'outlet_16a',
          name: 'Prises salon',
          power: 3680,
          room: 'living_room'
        },
        {
          type: 'outlet_16a',
          name: 'Prises chambre',
          power: 3680,
          room: 'bedroom'
        },
        {
          type: 'kitchen_outlet',
          name: 'Prises cuisine',
          power: 4600,
          room: 'kitchen'
        }
      ],
      settings: {
        surface: 50,
        roomCount: 2,
        buildingType: 'residential',
        occupancyType: 'single_family'
      },
      preview: '🏠'
    },
    {
      id: 't3-75',
      name: 'T3 75m²',
      description: 'Installation complète pour appartement T3',
      buildingType: 'residential' as BuildingType,
      surface: 75,
      rooms: 3,
      elements: [
        {
          type: 'lighting',
          name: 'Éclairage salon',
          power: 200,
          room: 'living_room'
        },
        {
          type: 'lighting',
          name: 'Éclairage chambres',
          power: 150,
          room: 'bedroom'
        },
        {
          type: 'outlet_16a',
          name: 'Prises salon',
          power: 3680,
          room: 'living_room'
        },
        {
          type: 'outlet_16a',
          name: 'Prises chambres',
          power: 3680,
          room: 'bedroom'
        },
        {
          type: 'kitchen_outlet',
          name: 'Prises cuisine',
          power: 4600,
          room: 'kitchen'
        },
        {
          type: 'specialized',
          name: 'Lave-linge',
          power: 2500,
          room: 'bathroom',
          specialized: true
        }
      ],
      settings: {
        surface: 75,
        roomCount: 3,
        buildingType: 'residential',
        occupancyType: 'single_family'
      },
      preview: '🏠'
    },
    {
      id: 'maison-100',
      name: 'Maison 100m²',
      description: 'Installation complète pour maison individuelle',
      buildingType: 'residential' as BuildingType,
      surface: 100,
      rooms: 4,
      elements: [
        {
          type: 'lighting',
          name: 'Éclairage général',
          power: 300,
          room: 'living_room'
        },
        {
          type: 'outlet_16a',
          name: 'Prises générales',
          power: 3680,
          room: 'living_room'
        },
        {
          type: 'kitchen_outlet',
          name: 'Prises cuisine',
          power: 4600,
          room: 'kitchen'
        },
        {
          type: 'specialized',
          name: 'Électroménager',
          power: 3000,
          room: 'kitchen',
          specialized: true
        },
        {
          type: 'specialized',
          name: 'Chauffe-eau',
          power: 3000,
          room: 'bathroom',
          specialized: true
        }
      ],
      settings: {
        surface: 100,
        roomCount: 4,
        buildingType: 'residential',
        occupancyType: 'single_family'
      },
      preview: '🏡'
    },
    {
      id: 'bureau-50',
      name: 'Bureau 50m²',
      description: 'Installation pour espace de bureau',
      buildingType: 'commercial' as BuildingType,
      surface: 50,
      rooms: 2,
      elements: [
        {
          type: 'lighting',
          name: 'Éclairage bureau',
          power: 400,
          room: 'office'
        },
        {
          type: 'outlet_16a',
          name: 'Prises informatique',
          power: 3680,
          room: 'office'
        },
        {
          type: 'specialized',
          name: 'Climatisation',
          power: 2500,
          room: 'office',
          specialized: true
        }
      ],
      settings: {
        surface: 50,
        roomCount: 2,
        buildingType: 'commercial',
        occupancyType: 'office'
      },
      preview: '🏢'
    }
  ];

  const getTemplateIcon = (buildingType: BuildingType) => {
    switch (buildingType) {
      case 'residential':
        return Home;
      case 'commercial':
        return Building;
      case 'industrial':
        return Factory;
      default:
        return FileText;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Choisir un modèle de projet
            </h2>
            <p className="text-gray-600 mt-1">
              Sélectionnez un modèle prédéfini pour démarrer rapidement
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Grille des modèles */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => {
              const IconComponent = getTemplateIcon(template.buildingType);
              
              return (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className="p-6 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                >
                  {/* Icône et titre */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {template.buildingType}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">
                    {template.description}
                  </p>

                  {/* Spécifications */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Surface:</span>
                      <span className="font-medium">{template.surface}m²</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pièces:</span>
                      <span className="font-medium">{template.rooms}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Éléments:</span>
                      <span className="font-medium">{template.elements.length}</span>
                    </div>
                  </div>

                  {/* Badge type */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      template.buildingType === 'residential' 
                        ? 'bg-green-100 text-green-800'
                        : template.buildingType === 'commercial'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {template.buildingType === 'residential' 
                        ? 'Résidentiel'
                        : template.buildingType === 'commercial'
                        ? 'Commercial'
                        : 'Industriel'
                      }
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pied de page */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Les modèles incluent les éléments de base et peuvent être personnalisés
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;