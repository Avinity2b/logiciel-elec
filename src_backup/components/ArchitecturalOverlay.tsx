import React from 'react';
import { Layer, Group, Line, Rect, Circle, Text } from 'react-konva';
import { PlanAnalysisResult, ArchitecturalElement, Room } from '../types/architectural';

interface ArchitecturalOverlayProps {
  analysisResult: PlanAnalysisResult | null;
  visibleElements: Record<string, boolean>;
  scale: number;
}

const ArchitecturalOverlay: React.FC<ArchitecturalOverlayProps> = ({
  analysisResult,
  visibleElements,
  scale
}) => {
  if (!analysisResult) return null;

  const renderWalls = () => {
    if (!visibleElements.walls) return null;
    
    return analysisResult.walls.map((wall) => (
      <Group key={wall.id}>
        <Line
          points={wall.points.flatMap(p => [p.x * scale, p.y * scale])}
          stroke="#2563EB"
          strokeWidth={wall.properties.thickness || 4}
          opacity={0.8}
        />
        {/* Label pour les murs */}
        {wall.points.length >= 2 && (
          <Text
            x={(wall.points[0].x + wall.points[1].x) / 2 * scale}
            y={(wall.points[0].y + wall.points[1].y) / 2 * scale - 10}
            text="MUR"
            fontSize={8}
            fill="#2563EB"
            align="center"
          />
        )}
      </Group>
    ));
  };

  const renderDoors = () => {
    if (!visibleElements.doors) return null;
    
    return analysisResult.doors.map((door) => (
      <Group key={door.id}>
        <Rect
          x={door.points[0].x * scale}
          y={door.points[0].y * scale}
          width={(door.points[2].x - door.points[0].x) * scale}
          height={(door.points[2].y - door.points[0].y) * scale}
          stroke="#10B981"
          strokeWidth={2}
          fill="rgba(16, 185, 129, 0.1)"
        />
        {/* Arc d'ouverture de porte */}
        <Line
          points={[
            door.points[0].x * scale,
            door.points[0].y * scale,
            (door.points[0].x + 30) * scale,
            (door.points[0].y + 30) * scale
          ]}
          stroke="#10B981"
          strokeWidth={1}
          dash={[5, 5]}
        />
        <Text
          x={door.points[0].x * scale + 5}
          y={door.points[0].y * scale - 15}
          text="PORTE"
          fontSize={8}
          fill="#10B981"
        />
      </Group>
    ));
  };

  const renderWindows = () => {
    if (!visibleElements.windows) return null;
    
    return analysisResult.windows.map((window) => (
      <Group key={window.id}>
        <Rect
          x={window.points[0].x * scale}
          y={window.points[0].y * scale}
          width={(window.points[2].x - window.points[0].x) * scale}
          height={(window.points[2].y - window.points[0].y) * scale}
          stroke="#F59E0B"
          strokeWidth={2}
          fill="rgba(245, 158, 11, 0.1)"
        />
        {/* Lignes de fenêtre */}
        <Line
          points={[
            (window.points[0].x + (window.points[2].x - window.points[0].x) / 2) * scale,
            window.points[0].y * scale,
            (window.points[0].x + (window.points[2].x - window.points[0].x) / 2) * scale,
            window.points[2].y * scale
          ]}
          stroke="#F59E0B"
          strokeWidth={1}
        />
        <Text
          x={window.points[0].x * scale + 5}
          y={window.points[0].y * scale - 15}
          text="FENÊTRE"
          fontSize={8}
          fill="#F59E0B"
        />
      </Group>
    ));
  };

  const renderRooms = () => {
    if (!visibleElements.rooms) return null;
    
    return analysisResult.rooms.map((room) => (
      <Group key={room.id}>
        <Rect
          x={room.bounds.minX * scale}
          y={room.bounds.minY * scale}
          width={(room.bounds.maxX - room.bounds.minX) * scale}
          height={(room.bounds.maxY - room.bounds.minY) * scale}
          stroke="#8B5CF6"
          strokeWidth={1}
          dash={[10, 5]}
          fill="rgba(139, 92, 246, 0.05)"
        />
        {/* Nom et surface de la pièce */}
        <Text
          x={(room.bounds.minX + room.bounds.maxX) / 2 * scale}
          y={(room.bounds.minY + room.bounds.maxY) / 2 * scale - 10}
          text={room.name}
          fontSize={12}
          fill="#8B5CF6"
          align="center"
          fontStyle="bold"
        />
        <Text
          x={(room.bounds.minX + room.bounds.maxX) / 2 * scale}
          y={(room.bounds.minY + room.bounds.maxY) / 2 * scale + 5}
          text={`${room.area.toFixed(1)} m²`}
          fontSize={10}
          fill="#8B5CF6"
          align="center"
        />
      </Group>
    ));
  };

  const renderFurniture = () => {
    if (!visibleElements.furniture) return null;
    
    return analysisResult.furniture.map((furniture) => (
      <Group key={furniture.id}>
        <Line
          points={furniture.points.flatMap(p => [p.x * scale, p.y * scale])}
          stroke="#EF4444"
          strokeWidth={2}
          fill="rgba(239, 68, 68, 0.1)"
          closed={true}
        />
        <Text
          x={furniture.points[0].x * scale}
          y={furniture.points[0].y * scale - 15}
          text={furniture.properties.furnitureType?.toUpperCase() || 'MOBILIER'}
          fontSize={8}
          fill="#EF4444"
        />
      </Group>
    ));
  };

  const renderDimensions = () => {
    if (!visibleElements.dimensions) return null;
    
    return analysisResult.dimensions.map((dimension) => (
      <Group key={dimension.id}>
        <Line
          points={dimension.points.flatMap(p => [p.x * scale, p.y * scale])}
          stroke="#6B7280"
          strokeWidth={1}
        />
        {/* Flèches aux extrémités */}
        {dimension.points.length >= 2 && (
          <>
            <Line
              points={[
                dimension.points[0].x * scale - 5,
                dimension.points[0].y * scale - 5,
                dimension.points[0].x * scale,
                dimension.points[0].y * scale,
                dimension.points[0].x * scale - 5,
                dimension.points[0].y * scale + 5
              ]}
              stroke="#6B7280"
              strokeWidth={1}
            />
            <Line
              points={[
                dimension.points[1].x * scale + 5,
                dimension.points[1].y * scale - 5,
                dimension.points[1].x * scale,
                dimension.points[1].y * scale,
                dimension.points[1].x * scale + 5,
                dimension.points[1].y * scale + 5
              ]}
              stroke="#6B7280"
              strokeWidth={1}
            />
          </>
        )}
        <Text
          x={(dimension.points[0].x + dimension.points[1].x) / 2 * scale}
          y={(dimension.points[0].y + dimension.points[1].y) / 2 * scale - 10}
          text={`${dimension.properties.value}${dimension.properties.unit}`}
          fontSize={8}
          fill="#6B7280"
          align="center"
        />
      </Group>
    ));
  };

  const renderTexts = () => {
    if (!visibleElements.texts) return null;
    
    return analysisResult.texts.map((textElement) => (
      <Group key={textElement.id}>
        <Rect
          x={textElement.points[0].x * scale}
          y={textElement.points[0].y * scale}
          width={(textElement.points[2].x - textElement.points[0].x) * scale}
          height={(textElement.points[2].y - textElement.points[0].y) * scale}
          stroke="#9CA3AF"
          strokeWidth={1}
          dash={[3, 3]}
          fill="rgba(156, 163, 175, 0.1)"
        />
        <Text
          x={textElement.points[0].x * scale + 2}
          y={textElement.points[0].y * scale + 2}
          text={textElement.properties.content}
          fontSize={textElement.properties.fontSize || 10}
          fill="#9CA3AF"
        />
      </Group>
    ));
  };

  return (
    <Layer>
      {renderWalls()}
      {renderDoors()}
      {renderWindows()}
      {renderRooms()}
      {renderFurniture()}
      {renderDimensions()}
      {renderTexts()}
    </Layer>
  );
};

export default ArchitecturalOverlay;