import { Project, ExportOptions } from '../types/electrical';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExportSettings extends ExportOptions {
  zone?: ExportZone;
  paperFormat: 'A4' | 'A3';
  orientation: 'portrait' | 'landscape';
  action: 'download' | 'print' | 'save';
}

export async function exportPlan(project: Project, settings: ExportSettings, canvasElement: HTMLElement): Promise<void> {
  try {
    // Find the Konva stage
    const stage = (window as any).stageRef?.current;
    if (!stage) {
      throw new Error('Stage Konva non trouvé');
    }

    // Get the exact canvas with proper scaling
    const canvas = await createExactCanvas(project, settings, stage);
    
    if (settings.action === 'download') {
      if (settings.format === 'pdf') {
        await exportToPDF(canvas, project.name, settings);
      } else {
        await exportToJPG(canvas, project.name, settings);
      }
    } else if (settings.action === 'print') {
      await printCanvas(canvas);
    } else if (settings.action === 'save') {
      await saveToLocalStorage(canvas, project.name, settings);
    }
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    alert('Erreur lors de l\'export du plan. Veuillez réessayer.');
  }
}

async function createExactCanvas(project: Project, settings: ExportSettings, stage: any): Promise<HTMLCanvasElement> {
  const stageCanvas = stage.getCanvas()._canvas;
  const stageScale = stage.scaleX();
  const stagePosition = stage.position();
  
  // Calculate export dimensions
  let exportWidth = stageCanvas.width;
  let exportHeight = stageCanvas.height;
  let sourceX = 0;
  let sourceY = 0;
  
  // If zone is specified, use it
  if (settings.zone) {
    sourceX = settings.zone.x * stageScale + stagePosition.x;
    sourceY = settings.zone.y * stageScale + stagePosition.y;
    exportWidth = settings.zone.width * stageScale;
    exportHeight = settings.zone.height * stageScale;
  }
  
  // Create export canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  
  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw background image if exists
  if (project.backgroundImage) {
    await drawBackgroundImage(ctx, project.backgroundImage, canvas, stageScale, stagePosition, settings.zone);
  }
  
  // Get elements to show
  const elementsToShow = getElementsToShow(project, settings);
  
  // Draw elements with exact positioning
  elementsToShow.forEach(element => {
    drawElectricalElementExact(ctx, element, stageScale, stagePosition, settings.zone);
  });
  
  // Draw connections if needed
  if (shouldShowConnections(settings)) {
    drawConnectionsExact(ctx, project, elementsToShow, stageScale, stagePosition, settings.zone);
  }
  
  return canvas;
}

async function drawBackgroundImage(
  ctx: CanvasRenderingContext2D, 
  imageUrl: string, 
  canvas: HTMLCanvasElement,
  stageScale: number,
  stagePosition: { x: number; y: number },
  zone?: ExportZone
): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.globalAlpha = 0.7;
      
      if (zone) {
        // Draw only the zone portion
        const sourceX = Math.max(0, zone.x - stagePosition.x / stageScale);
        const sourceY = Math.max(0, zone.y - stagePosition.y / stageScale);
        const sourceWidth = Math.min(img.width - sourceX, zone.width);
        const sourceHeight = Math.min(img.height - sourceY, zone.height);
        
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, canvas.width, canvas.height
        );
      } else {
        // Scale and position the image exactly as in the stage
        const scaledWidth = img.width * stageScale;
        const scaledHeight = img.height * stageScale;
        
        ctx.drawImage(
          img,
          stagePosition.x, stagePosition.y,
          scaledWidth, scaledHeight
        );
      }
      
      ctx.globalAlpha = 1.0;
      resolve();
    };
    img.onerror = () => resolve();
    img.src = imageUrl;
  });
}

function drawElectricalElementExact(
  ctx: CanvasRenderingContext2D,
  element: any,
  stageScale: number,
  stagePosition: { x: number; y: number },
  zone?: ExportZone
): void {
  // Calculate exact position
  let x = element.x * stageScale + stagePosition.x;
  let y = element.y * stageScale + stagePosition.y;
  
  // Adjust for zone if specified
  if (zone) {
    x -= zone.x * stageScale + stagePosition.x;
    y -= zone.y * stageScale + stagePosition.y;
  }
  
  // Skip if outside canvas
  if (x < -50 || y < -50 || x > ctx.canvas.width + 50 || y > ctx.canvas.height + 50) {
    return;
  }
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((element.rotation || 0) * Math.PI / 180);
  ctx.scale(stageScale, stageScale);
  
  // Draw the element with exact styling
  drawElementSymbol(ctx, element);
  
  ctx.restore();
}

function drawElementSymbol(ctx: CanvasRenderingContext2D, element: any): void {
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  switch (element.type) {
    case 'outlet':
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-3, 0, 1.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(3, 0, 1.5, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 6);
      ctx.stroke();
      break;
      
    case 'socket_20a':
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-8, -8, 16, 16);
      ctx.strokeRect(-8, -8, 16, 16);
      ctx.fillStyle = '#000000';
      ctx.fillText('20A', 0, 0);
      break;
      
    case 'socket_20a_spe':
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(-8, -8, 16, 16);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.strokeRect(-8, -8, 16, 16);
      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 8px Arial';
      ctx.fillText('20A', 0, -2);
      ctx.fillText('SPÉ', 0, 4);
      break;
      
    case 'socket_32a':
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-10, -8, 20, 16);
      ctx.strokeRect(-10, -8, 20, 16);
      ctx.fillStyle = '#000000';
      ctx.fillText('32A', 0, 0);
      break;
      
    case 'cable_outlet_16a':
      ctx.fillStyle = '#F3E8FF';
      ctx.fillRect(-9, -7, 18, 14);
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 2;
      ctx.strokeRect(-9, -7, 18, 14);
      ctx.fillStyle = '#6B21A8';
      ctx.font = 'bold 6px Arial';
      ctx.fillText('SC', 0, -2);
      ctx.fillText('16A', 0, 4);
      ctx.strokeStyle = '#8B5CF6';
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-9, 0);
      ctx.stroke();
      break;
      
    case 'cable_outlet_20a':
      ctx.fillStyle = '#FEE2E2';
      ctx.fillRect(-9, -7, 18, 14);
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 2;
      ctx.strokeRect(-9, -7, 18, 14);
      ctx.fillStyle = '#991B1B';
      ctx.font = 'bold 6px Arial';
      ctx.fillText('SC', 0, -2);
      ctx.fillText('CE', 0, 4);
      ctx.strokeStyle = '#DC2626';
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-9, 0);
      ctx.stroke();
      break;
      
    case 'cable_outlet_32a':
      ctx.fillStyle = '#D1FAE5';
      ctx.fillRect(-9, -7, 18, 14);
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 2;
      ctx.strokeRect(-9, -7, 18, 14);
      ctx.fillStyle = '#064E3B';
      ctx.font = 'bold 6px Arial';
      ctx.fillText('SC', 0, -2);
      ctx.fillText('32A', 0, 4);
      ctx.strokeStyle = '#059669';
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-9, 0);
      ctx.stroke();
      break;
      
    case 'dcl':
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.font = '6px Arial';
      ctx.fillText('DCL', 0, 0);
      break;
      
    case 'dcl_motion':
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.font = '5px Arial';
      ctx.fillText('DCL', 0, -2);
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 4px Arial';
      ctx.fillText('DET', 0, 2);
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(6, -6, 2, 0, 2 * Math.PI);
      ctx.fill();
      break;
      
    case 'spot':
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      if (element.properties?.quantity > 1) {
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 6px Arial';
        ctx.fillText(element.properties.quantity.toString(), 8, -8);
      }
      break;
      
    case 'applique':
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -5, 12, 10);
      ctx.strokeRect(-6, -5, 12, 10);
      ctx.beginPath();
      ctx.moveTo(-4, -3);
      ctx.lineTo(4, 3);
      ctx.moveTo(-4, 3);
      ctx.lineTo(4, -3);
      ctx.stroke();
      break;
      
    case 'applique_motion':
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -5, 12, 10);
      ctx.strokeRect(-6, -5, 12, 10);
      ctx.beginPath();
      ctx.moveTo(-4, -3);
      ctx.lineTo(4, 3);
      ctx.moveTo(-4, 3);
      ctx.lineTo(4, -3);
      ctx.stroke();
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(8, -8, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 4px Arial';
      ctx.fillText('D', 8, -8);
      break;
      
    case 'switch':
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(4, -2);
      ctx.stroke();
      break;
      
    case 'switch_double':
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-7, -6, 14, 12);
      ctx.strokeRect(-7, -6, 14, 12);
      ctx.beginPath();
      ctx.moveTo(-5, -2);
      ctx.lineTo(-1, -4);
      ctx.moveTo(1, 2);
      ctx.lineTo(5, 0);
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 5px Arial';
      ctx.fillText('2', 4, -8);
      break;
      
    case 'switch_dimmer':
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(4, -2);
      ctx.stroke();
      ctx.strokeStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(-2, 3);
      ctx.lineTo(0, 5);
      ctx.lineTo(2, 3);
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 8px Arial';
      ctx.fillText('~', 0, -8);
      break;
      
    case 'motion_detector':
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 5px Arial';
      ctx.fillText('DET', 0, 0);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(-6, -6);
      ctx.moveTo(-10, 0);
      ctx.lineTo(-8, 0);
      ctx.moveTo(-10, 10);
      ctx.lineTo(-6, 6);
      ctx.stroke();
      break;
  }
}

function drawConnectionsExact(
  ctx: CanvasRenderingContext2D,
  project: Project,
  elementsToShow: any[],
  stageScale: number,
  stagePosition: { x: number; y: number },
  zone?: ExportZone
): void {
  const elementIds = new Set(elementsToShow.map(el => el.id));
  
  project.connections.forEach(connection => {
    const fromElement = project.elements.find(el => el.id === connection.from);
    const toElement = project.elements.find(el => el.id === connection.to);
    
    if (fromElement && toElement && elementIds.has(fromElement.id) && elementIds.has(toElement.id)) {
      let fromX = fromElement.x * stageScale + stagePosition.x;
      let fromY = fromElement.y * stageScale + stagePosition.y;
      let toX = toElement.x * stageScale + stagePosition.x;
      let toY = toElement.y * stageScale + stagePosition.y;
      
      if (zone) {
        const zoneX = zone.x * stageScale + stagePosition.x;
        const zoneY = zone.y * stageScale + stagePosition.y;
        fromX -= zoneX;
        fromY -= zoneY;
        toX -= zoneX;
        toY -= zoneY;
      }
      
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.globalAlpha = 0.8;
      
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      
      ctx.setLineDash([]);
      ctx.globalAlpha = 1.0;
    }
  });
}

function getElementsToShow(project: Project, options: ExportOptions) {
  switch (options.elements) {
    case 'outlets':
      return project.elements.filter(el => 
        ['outlet', 'socket_20a', 'socket_20a_spe', 'socket_32a', 'cable_outlet_16a', 'cable_outlet_20a', 'cable_outlet_32a'].includes(el.type)
      );
    
    case 'lighting':
      return project.elements.filter(el => 
        ['dcl', 'dcl_motion', 'spot', 'applique', 'applique_motion', 'switch', 'switch_double', 'switch_dimmer', 'motion_detector'].includes(el.type)
      );
    
    default:
      return project.elements;
  }
}

function shouldShowConnections(options: ExportOptions): boolean {
  return options.elements === 'lighting' && options.showConnections;
}

async function exportToPDF(canvas: HTMLCanvasElement, projectName: string, settings: ExportSettings): Promise<void> {
  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // Paper dimensions in mm
  const paperSizes = {
    A4: { width: 210, height: 297 },
    A3: { width: 297, height: 420 }
  };
  
  const paper = paperSizes[settings.paperFormat];
  const isLandscape = settings.orientation === 'landscape';
  const pdfWidth = isLandscape ? paper.height : paper.width;
  const pdfHeight = isLandscape ? paper.width : paper.height;
  
  const pdf = new jsPDF({
    orientation: settings.orientation,
    unit: 'mm',
    format: settings.paperFormat.toLowerCase() as any
  });
  
  // Calculate image dimensions to fit page
  const margin = 10;
  const availableWidth = pdfWidth - 2 * margin;
  const availableHeight = pdfHeight - 60; // Space for header
  
  const imgRatio = canvas.width / canvas.height;
  let imgWidth = availableWidth;
  let imgHeight = imgWidth / imgRatio;
  
  if (imgHeight > availableHeight) {
    imgHeight = availableHeight;
    imgWidth = imgHeight * imgRatio;
  }
  
  // Center the image
  const x = (pdfWidth - imgWidth) / 2;
  const y = 40;
  
  // Add header
  pdf.setFontSize(16);
  pdf.text(`Plan électrique - ${projectName}`, margin, 20);
  
  pdf.setFontSize(10);
  pdf.text(`Généré le ${new Date().toLocaleDateString()}`, margin, 30);
  
  let exportInfo = '';
  switch (settings.elements) {
    case 'outlets':
      exportInfo = 'Prises et sorties de câble';
      break;
    case 'lighting':
      exportInfo = `Éclairage et commandes${settings.showConnections ? ' (avec liaisons)' : ''}`;
      break;
    default:
      exportInfo = 'Tous les éléments';
  }
  pdf.text(`Export: ${exportInfo}`, margin, 35);
  
  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
  
  pdf.save(`plan-electrique-${projectName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

async function exportToJPG(canvas: HTMLCanvasElement, projectName: string, settings: ExportSettings): Promise<void> {
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plan-electrique-${projectName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, 'image/jpeg', 0.95);
}

async function printCanvas(canvas: HTMLCanvasElement): Promise<void> {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Plan électrique</title>
          <style>
            body { margin: 0; padding: 20px; }
            img { max-width: 100%; height: auto; }
            @media print {
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${canvas.toDataURL()}" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}

async function saveToLocalStorage(canvas: HTMLCanvasElement, projectName: string, settings: ExportSettings): Promise<void> {
  const imageData = canvas.toDataURL('image/png', 0.8);
  const savedExports = JSON.parse(localStorage.getItem('savedExports') || '[]');
  
  const exportData = {
    id: Date.now().toString(),
    name: `${projectName} - Export`,
    date: new Date().toISOString(),
    settings,
    imageData
  };
  
  savedExports.push(exportData);
  localStorage.setItem('savedExports', JSON.stringify(savedExports));
  
  alert('Export sauvegardé localement !');
}