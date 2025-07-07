import React, { useState, useEffect } from 'react';

interface SymbolIconProps {
  svgUrl: string;
  alt: string;
  className?: string;
  size?: number;
  symbolId?: string; // Add symbolId to identify specific symbols
}

const SymbolIcon: React.FC<SymbolIconProps> = ({ 
  svgUrl, 
  alt, 
  className = '', 
  size = 24,
  symbolId
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Check if this symbol should be scaled up
  const shouldScaleUp = symbolId === 'clim' || symbolId === 'tgbt';
  const actualSize = shouldScaleUp ? Math.round(size * 1.5) : size;

  useEffect(() => {
    const loadSvg = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const response = await fetch(svgUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const svgText = await response.text();
        
        // Modify SVG to ensure proper sizing and clean styling
        const modifiedSvg = svgText
          .replace(/<svg[^>]*>/, (match) => {
            return match.replace(/width="[^"]*"/, `width="${actualSize}"`)
                       .replace(/height="[^"]*"/, `height="${actualSize}"`);
          });
        
        setSvgContent(modifiedSvg);
      } catch (error) {
        console.error('Error loading SVG:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (svgUrl) {
      loadSvg();
    }
  }, [svgUrl, actualSize]);

  if (isLoading) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-200 rounded ${className}`}
        style={{ width: actualSize, height: actualSize }}
      >
        <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (hasError || !svgContent) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-200 rounded ${className}`}
        style={{ width: actualSize, height: actualSize }}
      >
        <span className="text-xs text-gray-400 font-medium">?</span>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: actualSize, height: actualSize }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      title={alt}
    />
  );
};

export default SymbolIcon;