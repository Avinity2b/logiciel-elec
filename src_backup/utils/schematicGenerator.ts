import { Project } from '../types/electrical';
import jsPDF from 'jspdf';

export async function generateSchematic(project: Project): Promise<void> {
  if (!project.calculations) {
    throw new Error('Aucun calcul disponible pour générer le schéma');
  }

  const pdf = new jsPDF();
  
  // Title
  pdf.setFontSize(20);
  pdf.text('Schéma Unifilaire', 20, 30);
  
  // Project info
  pdf.setFontSize(12);
  pdf.text(`Projet: ${project.name}`, 20, 50);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
  pdf.text(`Puissance totale: ${project.calculations.totalPower}W`, 20, 70);
  
  // Main breaker
  pdf.setFontSize(14);
  pdf.text('Disjoncteur Général', 20, 90);
  pdf.rect(20, 95, 40, 20);
  pdf.text(`${project.calculations.mainBreaker}A`, 30, 107);
  
  // Differential breakers
  let yPosition = 130;
  project.calculations.differentialBreakers.forEach((diff, index) => {
    pdf.text(`Différentiel ${diff.rating}A ${diff.sensitivity}mA`, 20, yPosition);
    pdf.rect(20, yPosition + 5, 40, 15);
    yPosition += 30;
  });
  
  // Circuits
  yPosition = 180;
  pdf.setFontSize(10);
  project.calculations.circuits.forEach((circuit, index) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.text(`${circuit.name} - ${circuit.breakerRating}A`, 20, yPosition);
    pdf.text(`${circuit.power}W - ${circuit.cableSection}mm²`, 20, yPosition + 10);
    pdf.rect(15, yPosition - 5, 5, 5);
    yPosition += 20;
  });
  
  // Material list
  pdf.addPage();
  pdf.setFontSize(16);
  pdf.text('Liste du Matériel', 20, 30);
  
  yPosition = 50;
  pdf.setFontSize(10);
  
  // Table headers
  pdf.text('Désignation', 20, yPosition);
  pdf.text('Marque', 80, yPosition);
  pdf.text('Référence', 120, yPosition);
  pdf.text('Qté', 160, yPosition);
  pdf.text('Prix U.', 180, yPosition);
  pdf.text('Total', 200, yPosition);
  
  yPosition += 10;
  pdf.line(20, yPosition, 210, yPosition);
  yPosition += 5;
  
  let totalPrice = 0;
  project.calculations.materialList.forEach((item) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.text(item.name.substring(0, 25), 20, yPosition);
    pdf.text(item.brand, 80, yPosition);
    pdf.text(item.reference, 120, yPosition);
    pdf.text(item.quantity.toString(), 160, yPosition);
    pdf.text(`${item.unitPrice.toFixed(2)}€`, 180, yPosition);
    pdf.text(`${item.totalPrice.toFixed(2)}€`, 200, yPosition);
    
    totalPrice += item.totalPrice;
    yPosition += 10;
  });
  
  // Total
  yPosition += 10;
  pdf.line(20, yPosition, 210, yPosition);
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.text(`Total: ${totalPrice.toFixed(2)}€`, 200, yPosition, { align: 'right' });
  
  // Save the PDF
  pdf.save(`schema-${project.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}