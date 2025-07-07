import React from 'react';
import { Group, Circle, Rect, Line, Text, Arc } from 'react-konva';
import { ElectricalElement } from '../types/electrical';

interface ElectricalSymbolProps {
  element: ElectricalElement;
  isSelected: boolean;
  onClick: () => void;
  onDrag: (newPos: { x: number; y: number }) => void;
  connections?: string[];
}

const ElectricalSymbol: React.FC<ElectricalSymbolProps> = ({
  element,
  isSelected,
  onClick,
  onDrag,
  connections = []
}) => {
  const renderSymbol = () => {
    const baseProps = {
      x: element.x,
      y: element.y,
      draggable: true,
      onClick,
      onDragEnd: (e: any) => {
        onDrag({ x: e.target.x(), y: e.target.y() });
      },
      rotation: element.rotation,
    };

    const selectionBox = isSelected ? (
      <Rect
        x={-15}
        y={-15}
        width={30}
        height={30}
        stroke="#3B82F6"
        strokeWidth={2}
        dash={[3, 3]}
        fill="transparent"
      />
    ) : null;

    switch (element.type) {
      // PRISES - Symboles normés NF C 15-100
      case 'outlet':
        return (
          <Group {...baseProps}>
            {/* Prise 16A standard - Cercle avec 2 contacts + terre */}
            <Circle
              radius={10}
              fill="#ffffff"
              stroke="#000000"
              strokeWidth={2}
            />
            {/* Contacts phase/neutre */}
            <Circle x={-4} y={0} radius={2} fill="#000000" />
            <Circle x={4} y={0} radius={2} fill="#000000" />
            {/* Contact terre */}
            <Line points={[0, -8, 0, 8]} stroke="#000000" strokeWidth={2} />
            {selectionBox}
          </Group>
        );

      case 'outlet_high':
        return (
          <Group {...baseProps}>
            <Circle radius={10} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Circle x={-4} y={0} radius={2} fill="#000000" />
            <Circle x={4} y={0} radius={2} fill="#000000" />
            <Line points={[0, -8, 0, 8]} stroke="#000000" strokeWidth={2} />
            {/* Indicateur hauteur */}
            <Text text="h" fontSize={8} x={-3} y={-18} fill="#000000" fontStyle="bold" />
            {selectionBox}
          </Group>
        );

      case 'outlet_double':
        return (
          <Group {...baseProps}>
            {/* Double prise - 2 cercles accolés */}
            <Circle x={-8} y={0} radius={8} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Circle x={8} y={0} radius={8} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            {/* Contacts gauche */}
            <Circle x={-10} y={0} radius={1.5} fill="#000000" />
            <Circle x={-6} y={0} radius={1.5} fill="#000000" />
            <Line points={[-8, -6, -8, 6]} stroke="#000000" strokeWidth={1.5} />
            {/* Contacts droite */}
            <Circle x={6} y={0} radius={1.5} fill="#000000" />
            <Circle x={10} y={0} radius={1.5} fill="#000000" />
            <Line points={[8, -6, 8, 6]} stroke="#000000" strokeWidth={1.5} />
            {selectionBox}
          </Group>
        );

      case 'outlet_double_high':
        return (
          <Group {...baseProps}>
            <Circle x={-8} y={0} radius={8} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Circle x={8} y={0} radius={8} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Circle x={-10} y={0} radius={1.5} fill="#000000" />
            <Circle x={-6} y={0} radius={1.5} fill="#000000" />
            <Line points={[-8, -6, -8, 6]} stroke="#000000" strokeWidth={1.5} />
            <Circle x={6} y={0} radius={1.5} fill="#000000" />
            <Circle x={10} y={0} radius={1.5} fill="#000000" />
            <Line points={[8, -6, 8, 6]} stroke="#000000" strokeWidth={1.5} />
            <Text text="h" fontSize={8} x={-3} y={-18} fill="#000000" fontStyle="bold" />
            {selectionBox}
          </Group>
        );

      case 'socket_20a':
        return (
          <Group {...baseProps}>
            {/* Prise 20A - Carré avec marquage */}
            <Rect
              width={20}
              height={20}
              x={-10}
              y={-10}
              fill="#ffffff"
              stroke="#000000"
              strokeWidth={2}
            />
            <Text text="20A" fontSize={8} x={-8} y={-3} fill="#000000" fontStyle="bold" />
            {selectionBox}
          </Group>
        );

      case 'socket_20a_spe':
        return (
          <Group {...baseProps}>
            {/* Prise 20A spécialisée - Carré orange */}
            <Rect
              width={20}
              height={20}
              x={-10}
              y={-10}
              fill="#FFA500"
              stroke="#FF8C00"
              strokeWidth={3}
            />
            <Text text="20A" fontSize={7} x={-8} y={-5} fill="#8B4513" fontStyle="bold" />
            <Text text="SPÉ" fontSize={6} x={-8} y={2} fill="#8B4513" fontStyle="bold" />
            {selectionBox}
          </Group>
        );

      case 'socket_32a':
        return (
          <Group {...baseProps}>
            {/* Prise 32A - Rectangle plus large */}
            <Rect
              width={24}
              height={20}
              x={-12}
              y={-10}
              fill="#ffffff"
              stroke="#000000"
              strokeWidth={2}
            />
            <Text text="32A" fontSize={8} x={-10} y={-3} fill="#000000" fontStyle="bold" />
            {selectionBox}
          </Group>
        );

      case 'cable_outlet_16a':
        return (
          <Group {...baseProps}>
            {/* Sortie de câble - Rectangle avec câble */}
            <Rect
              width={20}
              height={16}
              x={-10}
              y={-8}
              fill="#E6E6FA"
              stroke="#8A2BE2"
              strokeWidth={2}
            />
            <Text text="SC" fontSize={7} x={-6} y={-6} fill="#4B0082" fontStyle="bold" />
            <Text text="16A" fontSize={6} x={-8} y={2} fill="#4B0082" fontStyle="bold" />
            {/* Câble sortant */}
            <Line points={[-15, 0, -10, 0]} stroke="#8A2BE2" strokeWidth={3} />
            {selectionBox}
          </Group>
        );

      case 'outlet_controlled':
        return (
          <Group {...baseProps}>
            <Circle radius={10} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Circle x={-4} y={0} radius={2} fill="#000000" />
            <Circle x={4} y={0} radius={2} fill="#000000" />
            <Line points={[0, -8, 0, 8]} stroke="#000000" strokeWidth={2} />
            {/* Symbole de commande */}
            <Line points={[-15, -12, -8, -5]} stroke="#FF0000" strokeWidth={2} />
            <Text text="C" fontSize={8} x={-18} y={-15} fill="#FF0000" fontStyle="bold" />
            {selectionBox}
          </Group>
        );

      case 'outlet_usb':
        return (
          <Group {...baseProps}>
            <Circle radius={10} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Circle x={-4} y={0} radius={2} fill="#000000" />
            <Circle x={4} y={0} radius={2} fill="#000000" />
            <Line points={[0, -8, 0, 8]} stroke="#000000" strokeWidth={2} />
            {/* Symbole USB */}
            <Rect x={-6} y={-18} width={12} height={6} fill="#00AA00" stroke="#008800" strokeWidth={1} />
            <Text text="USB" fontSize={5} x={-6} y={-16} fill="#ffffff" fontStyle="bold" />
            {selectionBox}
          </Group>
        );

      // COMMANDES - Symboles normés
      case 'switch':
        return (
          <Group {...baseProps}>
            {/* Interrupteur simple - Cercle avec contact basculant */}
            <Circle radius={8} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Line points={[-5, 0, 3, -4]} stroke="#000000" strokeWidth={2} />
            <Circle x={-5} y={0} radius={1} fill="#000000" />
            <Circle x={5} y={0} radius={1} fill="#000000" />
            {connections.length > 0 && (
              <Circle radius={12} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'switch_pilot':
        return (
          <Group {...baseProps}>
            <Circle radius={8} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Line points={[-5, 0, 3, -4]} stroke="#000000" strokeWidth={2} />
            <Circle x={-5} y={0} radius={1} fill="#000000" />
            <Circle x={5} y={0} radius={1} fill="#000000" />
            {/* Voyant lumineux */}
            <Circle x={0} y={0} radius={3} fill="#FFA500" stroke="#FF8C00" strokeWidth={1} />
            {connections.length > 0 && (
              <Circle radius={12} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'switch_double':
        return (
          <Group {...baseProps}>
            {/* Interrupteur double - Rectangle avec 2 contacts */}
            <Rect width={16} height={14} x={-8} y={-7} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Line points={[-6, -3, -2, -5]} stroke="#000000" strokeWidth={2} />
            <Line points={[2, 3, 6, 1]} stroke="#000000" strokeWidth={2} />
            <Circle x={-6} y={-3} radius={1} fill="#000000" />
            <Circle x={-6} y={3} radius={1} fill="#000000" />
            <Circle x={6} y={-3} radius={1} fill="#000000" />
            <Circle x={6} y={3} radius={1} fill="#000000" />
            <Text text="2" fontSize={6} x={6} y={-12} fill="#000000" fontStyle="bold" />
            {connections.length > 0 && (
              <Rect x={-12} y={-11} width={24} height={22} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'switch_double_pilot':
        return (
          <Group {...baseProps}>
            <Rect width={16} height={14} x={-8} y={-7} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Line points={[-6, -3, -2, -5]} stroke="#000000" strokeWidth={2} />
            <Line points={[2, 3, 6, 1]} stroke="#000000" strokeWidth={2} />
            <Circle x={-6} y={-3} radius={1} fill="#000000" />
            <Circle x={-6} y={3} radius={1} fill="#000000" />
            <Circle x={6} y={-3} radius={1} fill="#000000" />
            <Circle x={6} y={3} radius={1} fill="#000000" />
            {/* Voyants */}
            <Circle x={-3} y={0} radius={2} fill="#FFA500" stroke="#FF8C00" strokeWidth={1} />
            <Circle x={3} y={0} radius={2} fill="#FFA500" stroke="#FF8C00" strokeWidth={1} />
            <Text text="2" fontSize={6} x={6} y={-12} fill="#000000" fontStyle="bold" />
            {connections.length > 0 && (
              <Rect x={-12} y={-11} width={24} height={22} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'switch_va_et_vient':
        return (
          <Group {...baseProps}>
            {/* Va-et-vient - Cercle avec contact à 3 positions */}
            <Circle radius={8} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Line points={[-5, -2, 0, 0]} stroke="#000000" strokeWidth={2} />
            <Line points={[0, 0, 3, -3]} stroke="#000000" strokeWidth={2} />
            <Line points={[0, 0, 3, 3]} stroke="#000000" strokeWidth={2} />
            <Circle x={-5} y={-2} radius={1} fill="#000000" />
            <Circle x={5} y={-3} radius={1} fill="#000000" />
            <Circle x={5} y={3} radius={1} fill="#000000" />
            {connections.length > 0 && (
              <Circle radius={12} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'switch_va_et_vient_pilot':
        return (
          <Group {...baseProps}>
            <Circle radius={8} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Line points={[-5, -2, 0, 0]} stroke="#000000" strokeWidth={2} />
            <Line points={[0, 0, 3, -3]} stroke="#000000" strokeWidth={2} />
            <Line points={[0, 0, 3, 3]} stroke="#000000" strokeWidth={2} />
            <Circle x={-5} y={-2} radius={1} fill="#000000" />
            <Circle x={5} y={-3} radius={1} fill="#000000" />
            <Circle x={5} y={3} radius={1} fill="#000000" />
            <Circle x={0} y={0} radius={3} fill="#FFA500" stroke="#FF8C00" strokeWidth={1} />
            {connections.length > 0 && (
              <Circle radius={12} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'push_button':
        return (
          <Group {...baseProps}>
            {/* Bouton poussoir - Cercle avec contact normalement ouvert */}
            <Circle radius={8} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Circle x={0} y={0} radius={4} fill="transparent" stroke="#000000" strokeWidth={1} />
            <Line points={[-3, -3, 3, 3]} stroke="#000000" strokeWidth={2} />
            <Circle x={-5} y={0} radius={1} fill="#000000" />
            <Circle x={5} y={0} radius={1} fill="#000000" />
            {connections.length > 0 && (
              <Circle radius={12} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'push_button_pilot':
        return (
          <Group {...baseProps}>
            <Circle radius={8} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Circle x={0} y={0} radius={4} fill="transparent" stroke="#000000" strokeWidth={1} />
            <Line points={[-3, -3, 3, 3]} stroke="#000000" strokeWidth={2} />
            <Circle x={-5} y={0} radius={1} fill="#000000" />
            <Circle x={5} y={0} radius={1} fill="#000000" />
            <Circle x={0} y={0} radius={2.5} fill="#FFA500" stroke="#FF8C00" strokeWidth={1} />
            {connections.length > 0 && (
              <Circle radius={12} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'switch_dimmer':
        return (
          <Group {...baseProps}>
            {/* Variateur - Cercle avec symbole de variation */}
            <Circle radius={9} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            <Line points={[-5, 0, 3, -4]} stroke="#000000" strokeWidth={2} />
            <Circle x={-5} y={0} radius={1} fill="#000000" />
            <Circle x={5} y={0} radius={1} fill="#000000" />
            {/* Symbole de variation */}
            <Line points={[-3, 5, 0, 7, 3, 5]} stroke="#FF8C00" strokeWidth={2} />
            <Text text="~" fontSize={8} x={-3} y={-12} fill="#FF8C00" fontStyle="bold" />
            {connections.length > 0 && (
              <Circle radius={13} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'motion_detector':
        return (
          <Group {...baseProps}>
            {/* Détecteur de mouvement - Cercle avec ondes */}
            <Circle radius={10} fill="#ffffff" stroke="#FF0000" strokeWidth={2} />
            <Text text="DET" fontSize={6} x={-8} y={-2} fill="#FF0000" fontStyle="bold" />
            {/* Ondes de détection */}
            <Arc x={0} y={0} innerRadius={12} outerRadius={12} angle={60} rotation={-30} stroke="#FF0000" strokeWidth={1} />
            <Arc x={0} y={0} innerRadius={15} outerRadius={15} angle={60} rotation={-30} stroke="#FF0000" strokeWidth={1} />
            <Arc x={0} y={0} innerRadius={18} outerRadius={18} angle={60} rotation={-30} stroke="#FF0000" strokeWidth={1} />
            {connections.length > 0 && (
              <Circle radius={14} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'switch_shutter':
        return (
          <Group {...baseProps}>
            {/* Interrupteur volet roulant - Rectangle avec flèches */}
            <Rect width={16} height={14} x={-8} y={-7} fill="#ffffff" stroke="#000000" strokeWidth={2} />
            {/* Flèche montée */}
            <Line points={[-4, -5, -4, -1]} stroke="#000000" strokeWidth={2} />
            <Line points={[-6, -3, -4, -5, -2, -3]} stroke="#000000" strokeWidth={2} />
            {/* Flèche descente */}
            <Line points={[4, 1, 4, 5]} stroke="#000000" strokeWidth={2} />
            <Line points={[2, 3, 4, 5, 6, 3]} stroke="#000000" strokeWidth={2} />
            <Text text="VR" fontSize={5} x={-6} y={-12} fill="#000000" fontStyle="bold" />
            {connections.length > 0 && (
              <Rect x={-12} y={-11} width={24} height={22} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      // ÉCLAIRAGE - Symboles normés
      case 'dcl':
        return (
          <Group {...baseProps}>
            {/* DCL plafonnier - Cercle avec croix */}
            <Circle radius={10} fill="#FFFF99" stroke="#000000" strokeWidth={2} />
            <Line points={[-7, 0, 7, 0]} stroke="#000000" strokeWidth={2} />
            <Line points={[0, -7, 0, 7]} stroke="#000000" strokeWidth={2} />
            <Text text="DCL" fontSize={6} x={-8} y={-15} fill="#000000" fontStyle="bold" />
            {connections.length > 0 && (
              <Circle radius={14} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'dcl_applique':
        return (
          <Group {...baseProps}>
            {/* DCL applique - Demi-cercle contre mur */}
            <Arc x={0} y={0} innerRadius={10} outerRadius={10} angle={180} rotation={0} fill="#FFFF99" stroke="#000000" strokeWidth={2} />
            <Line points={[-10, 0, 10, 0]} stroke="#000000" strokeWidth={3} />
            <Line points={[0, -10, 0, 0]} stroke="#000000" strokeWidth={2} />
            <Text text="DCL" fontSize={6} x={-8} y={-15} fill="#000000" fontStyle="bold" />
            {connections.length > 0 && (
              <Rect x={-14} y={-14} width={28} height={18} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'spot':
        return (
          <Group {...baseProps}>
            {/* Spot encastré - Cercle avec point central */}
            <Circle radius={8} fill="#FFFF99" stroke="#000000" strokeWidth={2} />
            <Circle radius={4} fill="#000000" />
            <Circle radius={2} fill="#FFFF99" />
            {element.properties?.quantity > 1 && (
              <Text
                text={`×${element.properties.quantity}`}
                fontSize={6}
                x={10}
                y={-10}
                fill="#000000"
                fontStyle="bold"
              />
            )}
            {connections.length > 0 && (
              <Circle radius={12} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'led_strip':
        return (
          <Group {...baseProps}>
            {/* Réglette LED - Rectangle avec segments */}
            <Rect width={24} height={8} x={-12} y={-4} fill="#FFFF99" stroke="#000000" strokeWidth={2} />
            <Line points={[-10, 0, -6, 0]} stroke="#000000" strokeWidth={2} />
            <Line points={[-2, 0, 2, 0]} stroke="#000000" strokeWidth={2} />
            <Line points={[6, 0, 10, 0]} stroke="#000000" strokeWidth={2} />
            <Text text="LED" fontSize={5} x={-8} y={-12} fill="#000000" fontStyle="bold" />
            {connections.length > 0 && (
              <Rect x={-16} y={-8} width={32} height={16} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'led_projector':
        return (
          <Group {...baseProps}>
            {/* Projecteur LED - Rectangle avec faisceaux */}
            <Rect width={16} height={12} x={-8} y={-6} fill="#FFFF99" stroke="#000000" strokeWidth={2} />
            <Line points={[-6, -4, 6, 4]} stroke="#000000" strokeWidth={1} />
            <Line points={[-6, 4, 6, -4]} stroke="#000000" strokeWidth={1} />
            {/* Faisceaux lumineux */}
            <Line points={[8, -4, 14, -8]} stroke="#FFD700" strokeWidth={2} />
            <Line points={[8, 0, 14, 0]} stroke="#FFD700" strokeWidth={2} />
            <Line points={[8, 4, 14, 8]} stroke="#FFD700" strokeWidth={2} />
            <Text text="LED" fontSize={5} x={-8} y={-15} fill="#000000" fontStyle="bold" />
            {connections.length > 0 && (
              <Rect x={-12} y={-10} width={24} height={20} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      // Legacy compatibility - versions simplifiées
      case 'dcl_motion':
        return (
          <Group {...baseProps}>
            <Circle radius={10} fill="#FFFF99" stroke="#000000" strokeWidth={2} />
            <Line points={[-7, 0, 7, 0]} stroke="#000000" strokeWidth={2} />
            <Line points={[0, -7, 0, 7]} stroke="#000000" strokeWidth={2} />
            <Circle x={8} y={-8} radius={3} fill="#FF0000" />
            <Text text="DET" fontSize={4} x={6} y={-10} fill="#FF0000" fontStyle="bold" />
            {connections.length > 0 && (
              <Circle radius={14} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'applique':
        return (
          <Group {...baseProps}>
            <Arc x={0} y={0} innerRadius={10} outerRadius={10} angle={180} rotation={0} fill="#FFFF99" stroke="#000000" strokeWidth={2} />
            <Line points={[-10, 0, 10, 0]} stroke="#000000" strokeWidth={3} />
            <Line points={[0, -10, 0, 0]} stroke="#000000" strokeWidth={2} />
            {connections.length > 0 && (
              <Rect x={-14} y={-14} width={28} height={18} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      case 'applique_motion':
        return (
          <Group {...baseProps}>
            <Arc x={0} y={0} innerRadius={10} outerRadius={10} angle={180} rotation={0} fill="#FFFF99" stroke="#000000" strokeWidth={2} />
            <Line points={[-10, 0, 10, 0]} stroke="#000000" strokeWidth={3} />
            <Line points={[0, -10, 0, 0]} stroke="#000000" strokeWidth={2} />
            <Circle x={12} y={-12} radius={3} fill="#FF0000" />
            <Text text="D" fontSize={4} x={10} y={-14} fill="#FF0000" fontStyle="bold" />
            {connections.length > 0 && (
              <Rect x={-14} y={-14} width={28} height={18} stroke="#10B981" strokeWidth={2} fill="transparent" />
            )}
            {selectionBox}
          </Group>
        );

      default:
        return (
          <Group {...baseProps}>
            <Rect
              width={20}
              height={20}
              x={-10}
              y={-10}
              fill="#CCCCCC"
              stroke="#000000"
              strokeWidth={2}
            />
            <Text text="?" fontSize={12} x={-4} y={-4} fill="#000000" />
            {selectionBox}
          </Group>
        );
    }
  };

  return renderSymbol();
};

export default ElectricalSymbol;