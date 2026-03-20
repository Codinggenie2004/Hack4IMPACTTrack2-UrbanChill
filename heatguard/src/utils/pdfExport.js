import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportReport(cityName, zone, elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, { backgroundColor: '#161b22' });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `HeatGuard_${cityName.replace(/\s+/g, '')}_${zone.name.replace(/\s+/g, '')}_${date}.pdf`;
    
    pdf.save(filename);
  } catch (error) {
    console.error('Failed to export PDF', error);
  }
}
