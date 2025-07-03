import React from 'react';
import { Activity, Lightbulb, AlertCircle, Link } from 'lucide-react';

interface StatusBarProps {
  elementCount: number;
  circuitCount: number;
  connectionCount: number;
  aiSuggestions: string[];
}

const StatusBar: React.FC<StatusBarProps> = ({
  elementCount,
  circuitCount,
  connectionCount,
  aiSuggestions
}) => {
  return (
    <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>{elementCount} éléments</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>⚡</span>
            <span>{circuitCount} circuits</span>
          </div>
          <div className="flex items-center space-x-2">
            <Link className="w-4 h-4" />
            <span>{connectionCount} connexions</span>
          </div>
        </div>

        {aiSuggestions.length > 0 && (
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <div className="relative group">
              <button className="text-sm text-yellow-400 hover:text-yellow-300">
                {aiSuggestions.length} suggestions IA
              </button>
              <div className="absolute bottom-full right-0 mb-2 w-80 bg-gray-900 border border-gray-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3">
                  <h4 className="text-sm font-medium text-yellow-400 mb-2">
                    Suggestions d'optimisation
                  </h4>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertCircle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-300">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBar;