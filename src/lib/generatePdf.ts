import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TestResult } from './firestore';
import { format } from 'date-fns';

interface PatientInfo {
  name: string;
  age?: number;
  email?: string;
  phone?: string;
}

interface ReportData {
  patient: PatientInfo;
  testResults: TestResult[];
  medicationAdherence: { taken: number; total: number; rate: number };
  period: 'weekly' | 'monthly';
}

export const generatePatientReport = (data: ReportData): jsPDF => {
  const doc = new jsPDF();
  const { patient, testResults, medicationAdherence, period } = data;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(45, 160, 145); // primary teal
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ParkiSense', 14, 18);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${period === 'weekly' ? 'Weekly' : 'Monthly'} Patient Report`, 14, 28);
  doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy')}`, 14, 35);

  // Patient Info
  let y = 52;
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 14, y);
  y += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${patient.name}`, 14, y);
  if (patient.age) doc.text(`Age: ${patient.age} years`, 100, y);
  y += 7;
  if (patient.email) doc.text(`Email: ${patient.email}`, 14, y);
  if (patient.phone) doc.text(`Phone: ${patient.phone}`, 100, y);
  y += 12;

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // Test Results Summary
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Test Results Summary', 14, y);
  y += 8;

  const testTypes = ['tapping', 'speech', 'spiral'] as const;
  const summaryRows: string[][] = [];

  testTypes.forEach(type => {
    const tests = testResults.filter(t => t.testType === type);
    if (tests.length === 0) {
      summaryRows.push([type.charAt(0).toUpperCase() + type.slice(1), '0', '--', '--', '--']);
      return;
    }
    const scores = tests.map(t => t.score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const latest = scores[0];
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    
    // Trend
    let trend = 'Stable';
    if (tests.length >= 2) {
      if (scores[0] > scores[1] * 1.05) trend = '↑ Improving';
      else if (scores[0] < scores[1] * 0.95) trend = '↓ Declining';
    }

    summaryRows.push([
      type.charAt(0).toUpperCase() + type.slice(1),
      `${tests.length}`,
      `${latest}%`,
      `${avg}% (${min}-${max})`,
      trend,
    ]);
  });

  autoTable(doc, {
    startY: y,
    head: [['Test Type', 'Count', 'Latest', 'Avg (Range)', 'Trend']],
    body: summaryRows,
    theme: 'striped',
    headStyles: { fillColor: [45, 160, 145], fontSize: 10 },
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 14;

  // Medication Adherence
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Medication Adherence', 14, y);
  y += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Doses Taken: ${medicationAdherence.taken} / ${medicationAdherence.total}`, 14, y);
  doc.text(`Adherence Rate: ${medicationAdherence.rate}%`, 100, y);
  y += 14;

  // Detailed Test History
  if (testResults.length > 0) {
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 10;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Test History', 14, y);
    y += 8;

    const detailRows = testResults.slice(0, 30).map(t => [
      t.createdAt ? format(t.createdAt, 'MMM d, yyyy h:mm a') : 'N/A',
      t.testType.charAt(0).toUpperCase() + t.testType.slice(1),
      `${t.score}%`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Date', 'Test Type', 'Score']],
      body: detailRows,
      theme: 'striped',
      headStyles: { fillColor: [45, 160, 145], fontSize: 10 },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `ParkiSense Report — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
};

export const downloadPatientReport = (data: ReportData) => {
  const doc = generatePatientReport(data);
  const filename = `ParkiSense_${data.period}_report_${data.patient.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(filename);
};
