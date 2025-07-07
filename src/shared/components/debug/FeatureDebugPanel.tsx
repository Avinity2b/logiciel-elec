/**
 * Panneau de debug pour les feature flags (dev uniquement)
 */

import React from 'react';
import { Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { useFeatures } from '../../hooks/useFeatures';
import { ENV } from '../../../core/config';

export const FeatureDebugPanel: React.FC = () => {
  const { features, toggle } = useFeatures();

  // Seulement en développement
  if (!ENV.IS_DEVELOPMENT) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-xs">
      <div className="flex items-center space-x-2 mb-3">
        <Settings className="w-4 h-4" />
        <h3 className="text-sm font-medium">Feature Flags</h3>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {Object.entries(features).map(([feature, enabled]) => (
          <div key={feature} className="flex items-center justify-between">
            <span className="text-xs text-gray-300">{feature}</span>
            <button
              onClick={() => toggle(feature as any)}
              className={`p-1 rounded ${enabled ? 'text-green-400' : 'text-gray-500'}`}
            >
              {enabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};