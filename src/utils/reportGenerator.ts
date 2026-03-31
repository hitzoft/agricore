import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RayaSemanal } from '../store/useStore';

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return new Intl.DateTimeFormat('es-MX', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }).format(date).replace('.', '');
  } catch (e) {
    return dateStr;
  }
};

export const generatePayrollPDF = async (semana: string, rayas: RayaSemanal[], companyName: string = 'AGRICORE') => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    
    // Logo - Using a relative path for local generation
    try {
      doc.addImage('/favicon.png', 'PNG', 14, 10, 15, 15);
    } catch (e) {
      console.warn('Logo could not be loaded in PDF:', e);
    }
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 32, 18);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont('helvetica', 'bold');
    doc.text('AGRICORE - INTELIGENCIA AGRÍCOLA', 32, 23);
    
    // Title & Status
    doc.setFontSize(14);
    doc.setTextColor(22, 101, 52); // emerald-800
    doc.text(`REPORTE DE NÓMINA: ${semana}`, 148, 18, { align: 'center' });
    
    const isCerrada = rayas.length > 0 && rayas[0].cerrada;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`ESTADO: ${isCerrada ? 'NÓMINA FINAL' : 'PRE-NÓMINA (BORRADOR)'}`, 148, 24, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, 283, 15, { align: 'right' });

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
        return d.asistio ? 'O' : '-';
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
      startY: 32,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [226, 232, 240], // slate-200
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [248, 250, 252], // slate-50 (White-ish for print)
        textColor: [15, 23, 42], // slate-900
        fontStyle: 'bold',
        halign: 'center',
        lineWidth: 0.2,
      },
      columnStyles: {
        3: { halign: 'center', fontSize: 10, fontStyle: 'bold' }, // L
        4: { halign: 'center', fontSize: 10, fontStyle: 'bold' }, // M
        5: { halign: 'center', fontSize: 10, fontStyle: 'bold' }, // X
        6: { halign: 'center', fontSize: 10, fontStyle: 'bold' }, // J
        7: { halign: 'center', fontSize: 10, fontStyle: 'bold' }, // V
        8: { halign: 'center', fontSize: 10, fontStyle: 'bold' }, // S
        9: { halign: 'center', fontSize: 10, fontStyle: 'bold' }, // D
        10: { halign: 'right' },
        11: { halign: 'right' },
        12: { halign: 'right', fontStyle: 'bold' },
      },
      alternateRowStyles: { fillColor: [252, 253, 255] }, // Very subtle highlight
      margin: { top: 32 },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 32;
    
    // Totals Box (Outlined for saving ink)
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setFillColor(255, 255, 255);
    doc.rect(215, finalY + 5, 68, 12, 'S');
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL GENERAL:', 220, finalY + 13);
    
    doc.setTextColor(22, 101, 52); // emerald-800
    doc.setFont('helvetica', 'bold');
    doc.text(`$${grandTotal.toLocaleString()} MXN`, 278, finalY + 13, { align: 'right' });

    // Footer - Signature lines
    const signatureY = finalY + 30;
    if (signatureY < 185) { 
      doc.setDrawColor(203, 213, 225);
      doc.line(108, signatureY, 188, signatureY);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`FIRMA ADMINISTRACIÓN ${companyName.toUpperCase()}`, 148, signatureY + 4, { align: 'center' });
    }

    // Save
    const fileName = `Nomina_${semana}_${isCerrada ? 'FINAL' : 'PREVIEW'}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};

export const generateBalancePDF = async (
  seasonName: string, 
  data: { 
    folios: any[], 
    gastos: any[], 
    rayas: any[], 
    cuadrillas: any[],
    cuentas: any[]
  }, 
  companyName: string = 'AGRICORE'
) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header Design
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Left: Logo (covering 2 rows)
    try { 
      doc.addImage('/favicon.png', 'PNG', 14, 8, 12, 12); 
    } catch (e) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(14, 8, 12, 12, 2, 2, 'FD');
      doc.setFillColor(16, 185, 129);
      doc.circle(20, 14, 4, 'F');
    }

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 28, 13);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión Agrícola', 28, 17.5);

    // Center: Title
    doc.setFontSize(18);
    doc.setTextColor(22, 101, 52); // Green-700
    doc.setFont('helvetica', 'bold');
    doc.text('Balance Estratégico', pageWidth / 2, 25, { align: 'center' });

    // Right: Metadata
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    const genDate = `generado: ${formatDate(new Date().toISOString())}`;
    const agricPeriod = `Periodo Agrícola: ${seasonName}`;
    doc.text(genDate, pageWidth - 14, 13, { align: 'right' });
    doc.text(agricPeriod, pageWidth - 14, 17.5, { align: 'right' });

    // CALCULATION LOGIC
    const totalIngresos = data.folios.reduce((acc, f) => acc + (f.montoTotal || 0), 0);
    const totalCobrado = data.folios.reduce((acc, f) => acc + (f.abonos?.reduce((a: any, b: any) => a + b.monto, 0) || 0), 0);
    
    const totalGastos = data.gastos.reduce((acc, g) => acc + (g.monto || 0), 0);
    const totalPagadoGastos = data.gastos.reduce((acc, g) => acc + (g.abonos?.reduce((a: any, b: any) => a + b.monto, 0) || 0), 0);
    
    // Nomina totals
    const totalNominaRayas = data.rayas.reduce((acc, r) => {
      let total = 0;
      Object.values(r.asistencia || {}).forEach((dia: any) => {
        if (dia.asistio) total += r.sueldoDiario;
        if (dia.horasExtra > 0) total += (r.sueldoDiario / 8) * dia.horasExtra;
        if (dia.bonoExtra > 0) total += dia.bonoExtra;
      });
      return acc + total;
    }, 0);

    const totalNominaCuadrillas = data.cuadrillas.reduce((acc, c) => acc + (c.personas * c.tarifa) + (c.flete || 0) + (c.comida || 0) + (c.otrosGastos || 0), 0);
    const totalManoDeObra = totalNominaRayas + totalNominaCuadrillas;
    const totalEgresos = totalGastos + totalManoDeObra;

    // PAYMENT METHODS BREAKDOWN
    let cashIn = 0;
    let bankIn: Record<string, number> = {};
    data.folios.forEach(f => {
      f.abonos?.forEach((a: any) => {
        if (a.metodo === 'Efectivo') cashIn += a.monto;
        else if (a.cuentaId) bankIn[a.cuentaId] = (bankIn[a.cuentaId] || 0) + a.monto;
      });
    });

    let cashOut = 0;
    let bankOut: Record<string, number> = {};
    data.gastos.forEach(g => {
      g.abonos?.forEach((a: any) => {
        if (a.metodo === 'Efectivo') cashOut += a.monto;
        else if (a.cuentaId) bankOut[a.cuentaId] = (bankOut[a.cuentaId] || 0) + a.monto;
      });
    });
    
    const sumBank = (obj: Record<string, number>) => Object.values(obj).reduce((a, b) => a + b, 0);

    // NEW: STRATEGIC METRICS & BREAKDOWNS
    const totalKilos = data.folios.reduce((acc, f) => {
      const kilosLotes = f.lotes?.reduce((la: any, lb: any) => la + lb.pesoNeto, 0) || 0;
      const kilosDirectos = parseFloat(String(f.peso || '0').replace(/[^0-9.]/g, '')) || 0;
      return acc + (kilosLotes > 0 ? kilosLotes : kilosDirectos);
    }, 0);

    const costPerKilo = totalKilos > 0 ? (totalEgresos / totalKilos) : 0;
    const grossMargin = totalIngresos > 0 ? ((totalIngresos - totalEgresos) / totalIngresos) * 100 : 0;
    const breakEven = totalIngresos > 0 ? (totalEgresos / (totalIngresos / (totalKilos || 1))) : 0;

    // Expenses by Category
    const gastosPorCategoria: Record<string, number> = {};
    data.gastos.forEach(g => {
      const cat = g.categoria || 'Otros';
      gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + g.monto;
    });
    if (totalManoDeObra > 0) {
      gastosPorCategoria['Nómina (Mano de Obra)'] = totalManoDeObra;
    }

    // 1. PERFORMANCE SUMMARY TABLE
    autoTable(doc, {
      startY: 40,
      head: [['Resumen de Rendimiento', 'Monto Acumulado']],
      body: [
        ['Ventas Totales (Bruto)', `$${totalIngresos.toLocaleString()}`],
        ['Ingresos Efectivos (Cobrados)', `$${totalCobrado.toLocaleString()}`],
        [{ content: '', styles: { fillColor: [248, 250, 252] } }, ''],
        ['Egresos Facturados (Gatos + Nóminas)', `$${totalEgresos.toLocaleString()}`],
        ['Egresos Pagados (Liquidado)', `$${(totalPagadoGastos + totalNominaRayas + totalNominaCuadrillas).toLocaleString()}`],
        [{ content: 'UTILIDAD ESTIMADA', styles: { fontStyle: 'bold', textColor: [22, 101, 52] } }, { content: `$${(totalIngresos - totalEgresos).toLocaleString()}`, styles: { fontStyle: 'bold', textColor: [22, 101, 52] } }],
      ],
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 9 }
    });

    // 1.5 STRATEGIC KPIs TABLE
    const kpiY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('MÉTRICAS ESTRATÉGICAS (POR KG)', 14, kpiY);

    autoTable(doc, {
      startY: kpiY + 4,
      head: [['Métrica', 'Valor Individual / %']],
      body: [
        ['Producción Total Vendida', `${totalKilos.toLocaleString()} KG`],
        ['Costo de Producción por Kilo', `$${costPerKilo.toFixed(2)} / KG`],
        ['Precio Promedio de Venta', `$${(totalIngresos / (totalKilos || 1)).toFixed(2)} / KG`],
        ['Margen Bruto de Utilidad', `${grossMargin.toFixed(1)}%`],
        ['Punto de Equilibrio (Mínimo a vender)', `${Math.round(breakEven).toLocaleString()} KG`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [22, 101, 52] },
      styles: { fontSize: 9 }
    });

    // 2. EXPENSE CATEGORY BREAKDOWN
    const catY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(11);
    doc.text('DISTRIBUCIÓN DE EGRESOS POR CONCEPTO', 14, catY);

    autoTable(doc, {
      startY: catY + 4,
      head: [['Categoría', 'Inversión', '% del Total']],
      body: Object.entries(gastosPorCategoria)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, monto]) => [
          cat,
          `$${monto.toLocaleString()}`,
          `${((monto / (totalEgresos || 1)) * 100).toFixed(1)}%`
        ]),
      theme: 'striped',
      headStyles: { fillColor: [71, 85, 105] },
      styles: { fontSize: 8 }
    });

    // 3. PROJECTION (AR / AP)
    const projY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(11);
    doc.text('ESTADO DE CUENTAS PENDIENTES (CARTERA)', 14, projY);
    
    const pendCobrar = totalIngresos - totalCobrado;
    const pendPagar = totalGastos - totalPagadoGastos;

    autoTable(doc, {
      startY: projY + 4,
      head: [['Tipo de Cartera', 'Saldo Pendiente', 'Estado Impacto']],
      body: [
        ['Cuentas por Cobrar (Clientes)', `$${pendCobrar.toLocaleString()}`, { content: 'Entrada Proyectada', styles: { textColor: [22, 101, 52] } }],
        ['Cuentas por Pagar (Proveedores)', `$${pendPagar.toLocaleString()}`, { content: 'Salida Pendiente', styles: { textColor: [185, 28, 28] } }],
        [{ content: 'CAPITAL DE TRABAJO NETO', styles: { fontStyle: 'bold' } }, `$${(pendCobrar - pendPagar).toLocaleString()}`, ''],
      ],
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85] },
      styles: { fontSize: 9 }
    });

    // 4. CASH FLOW ANALYSIS (Efectivo vs Bancos)
    const currentY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(11);
    doc.text('FLUJO DE CAJA REAL (MÉTODOS DE PAGO)', 14, currentY);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Concepto', 'Efectivo (Cash)', 'Bancos (Transferencia)']],
      body: [
        ['Ingresos Recibidos', `$${cashIn.toLocaleString()}`, `$${sumBank(bankIn).toLocaleString()}`],
        ['Egresos Pagados', `$${cashOut.toLocaleString()}`, `$${sumBank(bankOut).toLocaleString()}`],
        [{ content: 'BALANCE DISPONIBLE', styles: { fontStyle: 'bold' } }, `$${(cashIn - cashOut).toLocaleString()}`, `$${(sumBank(bankIn) - sumBank(bankOut)).toLocaleString()}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 9 }
    });

    // Footnotes
    const footY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    doc.text('Este documento es un balance operativo interno basado en registros capturados.', 14, footY);
    doc.text('No constituye una declaración fiscal oficial. Agricore - Inteligencia Agrícola.', 14, footY + 4);

    doc.save(`Balance_Estrategico_${seasonName.replace(/\s+/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error('Balance PDF Error:', error);
    throw error;
  }
}

export const generateSalesReportPDF = async (
  seasonName: string,
  folios: any[],
  companyName: string = 'AGRICORE'
) => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Header Design
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Left: Logo (covering 2 rows)
    try { 
      doc.addImage('/favicon.png', 'PNG', 14, 8, 12, 12); 
    } catch (e) {
      // Fallback if image fails
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(14, 8, 12, 12, 2, 2, 'FD');
      doc.setFillColor(16, 185, 129);
      doc.circle(20, 14, 4, 'F');
    }

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 28, 13);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión Agrícola', 28, 17.5);

    // Center: Title
    doc.setFontSize(18);
    doc.setTextColor(22, 101, 52); // Green-700
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Ventas', pageWidth / 2, 25, { align: 'center' });

    // Right: Metadata
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    const genDate = `generado: ${formatDate(new Date().toISOString())}`;
    const agricPeriod = `Periodo Agrícola: ${seasonName}`;
    doc.text(genDate, pageWidth - 14, 13, { align: 'right' });
    doc.text(agricPeriod, pageWidth - 14, 17.5, { align: 'right' });

    const head = [['Folio', 'Fecha', 'Cliente / Destino', 'Variedad', 'Peso (KG)', 'Monto Total', 'Cobrado', 'Saldo', 'Estado']];
    let currentY = 32;
    
    const body = folios.map(f => {
      const cobrado = f.abonos?.reduce((acc: number, a: any) => acc + (a.monto || 0), 0) || 0;
      const saldo = (f.montoTotal || 0) - cobrado;
      return [
        f.folio || '-',
        formatDate(f.fecha),
        f.destino || '-',
        f.variedad || '-',
        f.peso || '-',
        `$${(f.montoTotal || 0).toLocaleString()}`,
        `$${cobrado.toLocaleString()}`,
        `$${saldo.toLocaleString()}`,
        (f.status || 'Pendiente').toUpperCase()
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: head,
      body: body,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42], halign: 'center' },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' },
        6: { halign: 'right' },
        7: { halign: 'right', textColor: [185, 28, 28] },
        8: { halign: 'center' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const statsTotalVentas = folios.reduce((acc, f) => acc + (f.montoTotal || 0), 0);
    const statsTotalCobrado = folios.reduce((acc, f) => acc + (f.abonos?.reduce((a: any, b: any) => a + b.monto, 0) || 0), 0);
    const statsSaldoPendiente = statsTotalVentas - statsTotalCobrado;

    // Summary Box at bottom
    doc.setFillColor(248, 250, 252);
    doc.rect(210, finalY, 73, 22, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(210, finalY, 73, 22, 'S');

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('RESUMEN DE CARTERA', 215, finalY + 6);
    
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(`Total Ventas: $${statsTotalVentas.toLocaleString()}`, 215, finalY + 11);
    doc.setTextColor(22, 101, 52);
    doc.text(`Total Cobrado: $${statsTotalCobrado.toLocaleString()}`, 215, finalY + 15);
    doc.setTextColor(185, 28, 28);
    doc.text(`Pendiente por cobrar: $${statsSaldoPendiente.toLocaleString()}`, 215, finalY + 19);

    doc.save(`Historial_Ventas_${seasonName.replace(/\s+/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error('Sales Report PDF Error:', error);
    throw error;
  }
}

export const generateExpensesReportPDF = async (
  seasonName: string,
  gastos: any[],
  rayas: any[],
  cuadrillas: any[],
  pagosNominaSemanal: any[],
  companyName: string = 'AGRICORE'
) => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Header Design
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Left: Logo (covering 2 rows)
    try { 
      doc.addImage('/favicon.png', 'PNG', 14, 8, 12, 12); 
    } catch (e) {
      // Fallback
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(14, 8, 12, 12, 2, 2, 'FD');
      doc.setFillColor(16, 185, 129);
      doc.circle(20, 14, 4, 'F');
    }

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, 28, 13);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión Agrícola', 28, 17.5);

    // Center: Title
    doc.setFontSize(18);
    doc.setTextColor(185, 28, 28); // Red-700
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Egresos', pageWidth / 2, 25, { align: 'center' });

    // Right: Metadata
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    const genDate = `generado: ${formatDate(new Date().toISOString())}`;
    const agricPeriod = `Periodo Agrícola: ${seasonName}`;
    doc.text(genDate, pageWidth - 14, 13, { align: 'right' });
    doc.text(agricPeriod, pageWidth - 14, 17.5, { align: 'right' });

    let currentY = 32;

    // Table 1: General Expenses
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('GASTOS OPERATIVOS Y COMPRAS', 14, currentY + 6);
    currentY += 10;

    const head = [['Proveedor', 'Fecha', 'Categoría', 'Concepto', 'Total', 'Pagado', 'Saldo', 'Método']];
    
    const body = gastos.map(g => {
      const pagado = g.abonos?.reduce((acc: number, a: any) => acc + (a.monto || 0), 0) || 0;
      const saldo = (g.monto || 0) - pagado;
      return [
        g.proveedor || '-',
        formatDate(g.fecha),
        g.categoria || '-',
        g.concepto || '-',
        `$${(g.monto || 0).toLocaleString()}`,
        `$${pagado.toLocaleString()}`,
        `$${saldo.toLocaleString()}`,
        g.metodo || '-'
      ];
    });

    autoTable(doc, {
      startY: 42,
      head: head,
      body: body,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [51, 65, 85], halign: 'center' },
      columnStyles: {
        4: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'right' },
        6: { halign: 'right', textColor: [185, 28, 28] }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // Table 2: Payroll Summary (Rayas)
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('RESUMEN DE NÓMINA', 14, currentY);

    // Aggregate Rayas by week
    const groupedRayas = rayas.reduce((acc: Record<string, { total: number, personas: number, cerrada: boolean }>, r) => {
      const sem = r.semana;
      let montoRaya = 0;
      Object.values(r.asistencia || {}).forEach((dia: any) => {
        if (dia.asistio) montoRaya += r.sueldoDiario;
        if (dia.horasExtra > 0) montoRaya += (r.sueldoDiario / 8) * dia.horasExtra;
        if (dia.bonoExtra > 0) montoRaya += dia.bonoExtra;
      });

      if (!acc[sem]) acc[sem] = { total: 0, personas: 0, cerrada: r.cerrada };
      acc[sem].total += montoRaya;
      acc[sem].personas += 1;
      return acc;
    }, {});

    const rayaHead = [['Semana', 'Personal', 'Egresado', 'Pagado', 'Saldo', 'Estado']];
    const rayaBody = Object.entries(groupedRayas)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([sem, data]) => {
        const pagoRecord = pagosNominaSemanal.find(p => p.semana === sem);
        const pagado = pagoRecord?.totalPagado || 0;
        const saldo = data.total - pagado;
        
        let status = 'ABIERTA';
        if (pagoRecord) {
          if (pagoRecord.status === 'Pagada') status = 'LIQUIDADA';
          else if (pagoRecord.status === 'Parcial') status = 'PARCIAL';
        } else if (data.cerrada) status = 'CERRADA';

        return [
          `Semana ${sem}`,
          `${data.personas}`,
          `$${data.total.toLocaleString()}`,
          `$${pagado.toLocaleString()}`,
          `$${saldo.toLocaleString()}`,
          status
        ];
      });

    autoTable(doc, {
      startY: currentY + 4,
      head: rayaHead,
      body: rayaBody,
      theme: 'striped',
      styles: { fontSize: 7 },
      headStyles: { fillColor: [71, 85, 105], halign: 'center' }, // Default center for headers
      columnStyles: { 
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'center' }
      },
      didParseCell: (data) => {
        if (data.section === 'head') {
          if (data.column.index === 0) data.cell.styles.halign = 'left';
          if ([2, 3, 4].includes(data.column.index)) data.cell.styles.halign = 'right';
          if ([1, 5].includes(data.column.index)) data.cell.styles.halign = 'center';
        }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 12;

    // Table 3: Cuadrillas Summary (Grouped by Week)
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('RESUMEN DE CUADRILLAS', 14, currentY);

    const cuadrillasPorSemana = cuadrillas.reduce((acc: any, c: any) => {
      const otros = (c.flete || 0) + (c.comida || 0) + (c.otrosGastos || 0);
      const total = ((c.tarifa || 0) * (c.personas || 0)) + otros;
      const pagado = (c.pagos || []).reduce((sum: number, p: any) => sum + (p.monto || 0), 0);
      const sem = c.semana || 'Sin Semana';
      
      if (!acc[sem]) {
        acc[sem] = { jornadas: 0, personas: 0, total: 0, pagado: 0 };
      }
      acc[sem].jornadas += 1;
      acc[sem].personas += (c.personas || 0);
      acc[sem].total += total;
      acc[sem].pagado += pagado;
      return acc;
    }, {});

    const cuadroHead = [['Semana', 'Jornadas', 'Personas', 'Egresado', 'Pagado', 'Saldo', 'Estado']];
    const cuadroBody = Object.entries(cuadrillasPorSemana).sort((a, b) => b[0].localeCompare(a[0])).map(([sem, data]: [string, any]) => {
      const saldo = data.total - data.pagado;
      const estado = saldo <= 0 ? 'LIQUIDADA' : data.pagado > 0 ? 'PARCIAL' : 'PENDIENTE';
      
      return [
        sem,
        data.jornadas,
        data.personas,
        `$${data.total.toLocaleString()}`,
        `$${data.pagado.toLocaleString()}`,
        `$${saldo.toLocaleString()}`,
        estado
      ];
    });

    autoTable(doc, {
      startY: currentY + 4,
      head: cuadroHead,
      body: cuadroBody,
      theme: 'grid',
      styles: { fontSize: 7, halign: 'center' },
      headStyles: { fillColor: [100, 116, 139] },
      columnStyles: { 
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' },
        6: { halign: 'center' }
      },
      didParseCell: (data) => {
        if (data.section === 'head') {
          if (data.column.index === 0) data.cell.styles.halign = 'left';
          if ([3, 4, 5].includes(data.column.index)) data.cell.styles.halign = 'right';
          if ([1, 2, 6].includes(data.column.index)) data.cell.styles.halign = 'center';
        }
      }
    });

    // Status Legend
    const legendY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('REFERENCIA DE ESTADOS:', 14, legendY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const legendText = 'ABIERTA: En captura • CERRADA: Captura finalizada • PARCIAL: Con abono registrado • LIQUIDADA: Pago total cubierto';
    doc.text(legendText, 14, legendY + 4);

    // Final Totals calculation
    const totalEGastos = gastos.reduce((acc, g) => acc + (g.monto || 0), 0);
    const totalPGastos = gastos.reduce((acc, g) => {
      const p = (g.abonos || []).reduce((sum: number, a: any) => sum + (a.monto || 0), 0);
      return acc + p;
    }, 0);

    const totalERayas = Object.values(groupedRayas).reduce((acc, r) => acc + r.total, 0);
    const totalPRayas = Object.keys(groupedRayas).reduce((acc, sem) => {
      const p = pagosNominaSemanal.find(pr => pr.semana === sem)?.totalPagado || 0;
      return acc + p;
    }, 0);

    const totalECuadrillas = cuadrillas.reduce((acc, c) => {
      const otros = (c.flete || 0) + (c.comida || 0) + (c.otrosGastos || 0);
      return acc + (c.tarifa * (c.personas || 0)) + otros;
    }, 0);
    const totalPCuadrillas = cuadrillas.reduce((acc, c) => {
      const p = (c.pagos || []).reduce((sum: number, pa: any) => sum + (pa.monto || 0), 0);
      return acc + p;
    }, 0);

    const totalEgresos = totalEGastos + totalERayas + totalECuadrillas;
    const totalPagado = totalPGastos + totalPRayas + totalPCuadrillas;
    const totalSaldo = totalEgresos - totalPagado;

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.rect(210, finalY, 73, 22, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(210, finalY, 73, 22, 'S');

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('RESUMEN DE OPERACIÓN', 215, finalY + 6);
    
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(`Total Neto: $${totalEgresos.toLocaleString()}`, 215, finalY + 11);
    doc.setTextColor(22, 101, 52);
    doc.text(`Total Pagado: $${totalPagado.toLocaleString()}`, 215, finalY + 15);
    doc.setTextColor(185, 28, 28);
    doc.text(`Saldo Pendiente: $${totalSaldo.toLocaleString()}`, 215, finalY + 19);

    doc.save(`Reporte_Egresos_${seasonName.replace(/\s+/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error('Expenses Report PDF Error:', error);
    throw error;
  }
}
