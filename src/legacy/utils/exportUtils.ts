import { Project } from '../types/electrical';
import { generateSchematic } from './schematicGenerator';

export async function exportProject(project: Project, format: 'json' | 'pdf' | 'csv'): Promise<void> {
  switch (format) {
    case 'json':
      await exportJSON(project);
      break;
    case 'pdf':
      await generateSchematic(project);
      break;
    case 'csv':
      await exportMaterialCSV(project);
      break;
  }
}

async function exportJSON(project: Project): Promise<void> {
  const dataStr = JSON.stringify(project, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${project.name.replace(/\s+/g, '-').toLowerCase()}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

async function exportMaterialCSV(project: Project): Promise<void> {
  if (!project.calculations) {
    throw new Error('Aucun calcul disponible pour exporter la liste de matériel');
  }

  const headers = ['Désignation', 'Marque', 'Référence', 'Quantité', 'Prix Unitaire', 'Prix Total', 'Catégorie'];
  const csvContent = [
    headers.join(','),
    ...project.calculations.materialList.map(item => [
      `"${item.name}"`,
      `"${item.brand}"`,
      `"${item.reference}"`,
      item.quantity,
      item.unitPrice.toFixed(2),
      item.totalPrice.toFixed(2),
      `"${item.category}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `materiel-${project.name.replace(/\s+/g, '-').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}