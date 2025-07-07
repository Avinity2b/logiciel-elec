/**
 * Hook React pour le Canvas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { CanvasManager } from '../services/CanvasManager';
import { CanvasState, CanvasActions } from '../types';
import { ElectricalElement } from '../../../core/types';

export function useCanvas(initialConfig?: any) {
  const managerRef = useRef<CanvasManager>();
  const [state, setState] = useState<CanvasState>({
    elements: [],
    selectedElements: [],
    zoom: 1,
    pan: { x: 0, y: 0 },
    showGrid: true,
    showConnections: true,
    backgroundImage: null,
    mode: 'select'
  });

  // Initialisation du manager
  useEffect(() => {
    const manager = new CanvasManager(initialConfig);
    managerRef.current = manager;

    manager.initialize();

    // S'abonner aux changements d'état
    const unsubscribe = manager.subscribe(setState);

    return () => {
      unsubscribe();
      manager.cleanup();
    };
  }, []);

  // Actions
  const actions: CanvasActions = {
    addElement: useCallback((element: ElectricalElement) => {
      managerRef.current?.addElement(element);
    }, []),

    updateElement: useCallback((id: string, updates: Partial<ElectricalElement>) => {
      managerRef.current?.updateElement(id, updates);
    }, []),

    deleteElement: useCallback((id: string) => {
      managerRef.current?.deleteElement(id);
    }, []),

    selectElement: useCallback((id: string, multi?: boolean) => {
      managerRef.current?.selectElement(id, multi);
    }, []),

    clearSelection: useCallback(() => {
      managerRef.current?.clearSelection();
    }, []),

    setZoom: useCallback((zoom: number) => {
      managerRef.current?.setZoom(zoom);
    }, []),

    setPan: useCallback((pan: { x: number; y: number }) => {
      managerRef.current?.setPan(pan);
    }, []),

    setMode: useCallback((mode: CanvasState['mode']) => {
      if (managerRef.current) {
        const currentState = managerRef.current.getState();
        setState(prev => ({ ...prev, mode }));
      }
    }, []),

    toggleGrid: useCallback(() => {
      if (managerRef.current) {
        const currentState = managerRef.current.getState();
        setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
      }
    }, []),

    toggleConnections: useCallback(() => {
      if (managerRef.current) {
        const currentState = managerRef.current.getState();
        setState(prev => ({ ...prev, showConnections: !prev.showConnections }));
      }
    }, [])
  };

  return { state, actions, manager: managerRef.current };
}