import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ScheduleEntry } from '@/types/schedule';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function generateSchedulePDF(schedule: ScheduleEntry[], startDate: Date, endDate: Date) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Monthly Work Shift Schedule', 20, 30);
  
  // Date range
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const startDateStr = startDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const endDateStr = endDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`${startDateStr} - ${endDateStr}`, 20, 45);
  
  // Group schedule by date
  const scheduleByDate = new Map<string, ScheduleEntry[]>();
  schedule.forEach(entry => {
    const dateKey = entry.date.toDateString();
    if (!scheduleByDate.has(dateKey)) {
      scheduleByDate.set(dateKey, []);
    }
    scheduleByDate.get(dateKey)!.push(entry);
  });
  
  // Prepare table data
  const tableData: any[] = [];
  
  scheduleByDate.forEach((entries, dateKey) => {
    const date = new Date(dateKey);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric' 
    });
    
    // Group by shift type
    const morningWorkers = entries.filter(e => e.shift === 'morning').map(e => e.workerName);
    const eveningWorkers = entries.filter(e => e.shift === 'evening').map(e => e.workerName);
    const nightWorkers = entries.filter(e => e.shift === 'night').map(e => e.workerName);
    const leaveWorkers = entries.filter(e => e.shift === 'leave').map(e => e.workerName);
    
    tableData.push([
      formattedDate,
      morningWorkers.join(', ') || '-',
      eveningWorkers.join(', ') || '-',
      nightWorkers.join(', ') || '-',
      leaveWorkers.join(', ') || '-'
    ]);
  });
  
  // Generate table
  doc.autoTable({
    head: [['Date', 'Morning Shift', 'Evening Shift', 'Night Shift', 'On Leave']],
    body: tableData,
    startY: 60,
    styles: {
      fontSize: 10,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
      4: { cellWidth: 35 }
    }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
      20,
      doc.internal.pageSize.height - 10
    );
  }
  
  return doc;
}