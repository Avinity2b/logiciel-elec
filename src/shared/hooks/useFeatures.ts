/**
 * Hook pour gérer les feature flags
 */

import { useState, useEffect } from 'react';
import { FeatureFlag } from '../../core/config';
import { serviceManager } from '../services';

export function useFeatures() {
  const [features, setFeatures] = useState<Record<FeatureFlag, boolean>>({} as any);

  useEffect(() => {
    if (serviceManager.isServiceInitialized()) {
      setFeatures(serviceManager.features.getAllFeatures());
    }
  }, []);

  const isEnabled = (feature: FeatureFlag): boolean => {
    return serviceManager.features.isEnabled(feature);
  };

  const toggle = (feature: FeatureFlag): boolean => {
    const newState = serviceManager.features.toggle(feature);
    setFeatures(serviceManager.features.getAllFeatures());
    return newState;
  };

  const enable = (feature: FeatureFlag): void => {
    serviceManager.features.enable(feature);
    setFeatures(serviceManager.features.getAllFeatures());
  };

  const disable = (feature: FeatureFlag): void => {
    serviceManager.features.disable(feature);
    setFeatures(serviceManager.features.getAllFeatures());
  };

  return {
    features,
    isEnabled,
    toggle,
    enable,
    disable
  };
}