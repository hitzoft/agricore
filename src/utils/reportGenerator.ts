import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RayaSemanal } from '../store/useStore';

export const generatePayrollPDF = async (semana: string, rayas: RayaSemanal[]) => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    
    // Header background
    doc.setFillColor(22, 101, 52); // Agri-800
    doc.rect(0, 0, 297, 40, 'F');
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('AGRICORE', 14, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('SISTEMA INTEGRAL DE GESTIÓN AGRÍCOLA', 14, 28);
    
    doc.setFontSize(16);
    doc.text(`REPORTE DE NÓMINA: ${semana}`, 140, 20, { align: 'center' });
    
    const isCerrada = rayas.length > 0 && rayas[0].cerrada;
    doc.setFontSize(10);
    doc.text(`ESTADO: ${isCerrada ? 'CERRADA' : 'EN CURSO'}`, 140, 28, { align: 'center' });
    
    doc.setFontSize(9);
    doc.text(`Fecha de impresión: ${new Date().toLocaleString('es-MX')}`, 240, 32);

    // Table Data Preparation
    const head = [['#', 'Empleado', 'Puesto', 'L', 'M', 'X', 'J', 'V', 'S', 'D', 'Sueldo/d', 'Extras', 'Total']];
    
    const body = rayas.map((r, index) => {
      let totalExtras = 0;
      Object.values(r.asistencia).forEach(dia => {
        if (dia.horasExtra > 0) totalExtras += (r.sueldoDiario / 8) * dia.horasExtra;
        if (dia.bonoExtra > 0) totalExtras += dia.bonoExtra;
      });

      const calcularTotalRaya = () => {
        let total = 0;
        Object.values(r.asistencia).forEach(dia => {
          if (dia.asistio) total += r.sueldoDiario;
        });
        return total + totalExtras;
      };

      const getAsistenciaChar = (dia: string) => {
        // @ts-ignore
        const d = r.asistencia[dia];
        if (!d) return '-';
        return d.asistio ? 'P' : '-';
      };

      return [
        index + 1,
        r.empleadoNombre,
        r.puesto,
        getAsistenciaChar('L'),
        getAsistenciaChar('M'),
        getAsistenciaChar('X'),
        getAsistenciaChar('J'),
        getAsistenciaChar('V'),
        getAsistenciaChar('S'),
        getAsistenciaChar('D'),
        `$${r.sueldoDiario}`,
        `$${totalExtras.toFixed(0)}`,
        `$${calcularTotalRaya().toLocaleString()}`
      ];
    });

    // Global Total
    const grandTotal = rayas.reduce((acc, r) => {
      let total = 0;
      Object.values(r.asistencia).forEach(dia => {
        if (dia.asistio) total += r.sueldoDiario;
        if (dia.horasExtra > 0) total += (r.sueldoDiario / 8) * dia.horasExtra;
        if (dia.bonoExtra > 0) total += dia.bonoExtra;
      });
      return acc + total;
    }, 0);

    autoTable(doc, {
      head: head,
      body: body,
      startY: 45,
      theme: 'grid',
      headStyles: { 
        fillColor: [22, 101, 52], 
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { halign: 'center' },
        9: { halign: 'center' },
        10: { halign: 'right' },
        11: { halign: 'right' },
        12: { halign: 'right', fontStyle: 'bold' },
      },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      margin: { top: 40 },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 45;
    
    // Totals Box
    doc.setFillColor(249, 250, 251);
    doc.rect(220, finalY + 5, 63, 15, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.rect(220, finalY + 5, 63, 15, 'S');
    
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);
    doc.setFont('helvetica', 'normal');
    doc.text('TOTAL SEMANA:', 225, finalY + 15);
    
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${grandTotal.toLocaleString()}`, 280, finalY + 15, { align: 'right' });

    // Save using Blob to avoid browser blocks
    const fileName = `Nomina_${semana}_${isCerrada ? 'FINAL' : 'PREVIEW'}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};
