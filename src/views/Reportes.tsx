import { useMemo, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Layers,
  FileWarning, 
  Clock, 
  Activity,
  BarChart3,
  X,
  ChevronRight,
  HelpCircle,
  Scale,
  FileText,
  LayoutDashboard,
  Download
} from 'lucide-react';
import { useStore } from '../store/useStore';

const DrillDownModal = ({ isOpen, onClose, title, items }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20 dark:border-slate-800">
        <div className="p-10 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between bg-agri-50/30 dark:bg-slate-800/50">
          <div>
            <h3 className="text-3xl font-display text-agri-900 dark:text-agri-50 italic tracking-tight">Detalle de <span className="not-italic font-bold">{title}</span></h3>
            <p className="text-[10px] font-black text-agri-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">{items.length} Registros encontrados</p>
          </div>
          <button onClick={onClose} className="p-4 bg-white dark:bg-slate-800 rounded-2xl text-gray-400 dark:text-slate-500 hover:text-agri-600 dark:hover:text-agri-400 transition-all shadow-sm hover:rotate-90">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-4 pt-6">
          {items.length === 0 ? (
            <div className="py-24 text-center">
               <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                 <BarChart3 className="w-8 h-8 text-gray-200 dark:text-slate-700" />
               </div>
               <p className="text-gray-400 dark:text-slate-500 text-sm font-medium uppercase tracking-widest italic">No hay registros para mostrar</p>
            </div>
          ) : (
            items.map((item: any, idx: number) => (
              <div key={idx} className="p-6 bg-white dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 rounded-3xl flex items-center justify-between group hover:border-agri-200 dark:hover:border-agri-500/50 hover:shadow-xl hover:shadow-agri-900/5 transition-all text-left">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${
                    item.statusColor?.includes('red') ? 'bg-red-50 dark:bg-red-950/30 text-red-600' : 
                    item.statusColor?.includes('orange') ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600' : 
                    'bg-agri-50 dark:bg-agri-900/30 text-agri-600 dark:text-agri-400'
                  }`}>
                    {title.includes('Cartera') ? <Wallet className="w-5 h-5" /> : 
                     title.includes('Factura') ? <FileWarning className="w-5 h-5" /> : 
                     <Activity className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-agri-900 dark:text-agri-50 uppercase tracking-tight line-clamp-1">{item.title}</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-display text-agri-900 dark:text-agri-50">${(item.amount || 0).toLocaleString()}</p>
                  <p className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 ${item.statusColor || 'text-agri-400 dark:text-agri-500'}`}>{item.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-8 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-100 dark:border-slate-800 flex justify-end">
           <button 
             onClick={onClose}
             className="px-8 py-3 bg-agri-900 dark:bg-agri-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-agri-500 transition-all shadow-lg active:scale-95"
           >
             Cerrar Ventana
           </button>
        </div>
      </div>
    </div>
  );
};

const Reportes = () => {
  const state = useStore();
  const { activeSeasonId, temporadas } = state;

  const currentSeason = useMemo(() => 
    temporadas.find(t => t.id === activeSeasonId)
  , [temporadas, activeSeasonId]);

  const folios = useMemo(() => state.folios.filter(f => f.seasonId === activeSeasonId), [state.folios, activeSeasonId]);
  const gastos = useMemo(() => state.gastos.filter(g => g.seasonId === activeSeasonId), [state.gastos, activeSeasonId]);
  const cuadrillas = useMemo(() => state.cuadrillas.filter(c => c.seasonId === activeSeasonId), [state.cuadrillas, activeSeasonId]);
  const rayasSemanales = useMemo(() => state.rayasSemanales.filter(r => r.seasonId === activeSeasonId), [state.rayasSemanales, activeSeasonId]);

  const totalVentas = useMemo(() => 
    folios.reduce((acc: number, f: any) => acc + (f.montoTotal || 0), 0)
  , [folios]);

  const totalCobrado = useMemo(() => 
    folios.reduce((acc: number, f: any) => 
      acc + (f.abonos?.reduce((sum: number, a: any) => sum + a.monto, 0) || 0)
    , 0)
  , [folios]);

  const saldoPendiente = totalVentas - totalCobrado;

  const totalGastosCompras = useMemo(() => 
    gastos.reduce((acc: number, g: any) => acc + (g.monto || 0), 0)
  , [gastos]);

  const totalGastosNomina = useMemo(() => {
    const totalCuadrillas = cuadrillas.reduce((acc: number, c: any) => 
      acc + (c.tarifa * (c.personas || 0)) + (c.flete || 0) + (c.comida || 0) + (c.otrosGastos || 0)
    , 0);

    const totalRayas = rayasSemanales.reduce((acc: number, r: any) => {
      const diasAsistidos = Object.values(r.asistencia || {}).filter((a: any) => a.asistio).length;
      const extras = Object.values(r.asistencia || {}).reduce((sum: number, a: any) => sum + (a.bonoExtra || 0), 0);
      return acc + (r.sueldoDiario * diasAsistidos) + extras;
    }, 0);

    return totalCuadrillas + totalRayas;
  }, [cuadrillas, rayasSemanales]);

  const totalEgresos = totalGastosCompras + totalGastosNomina;
  const margenOperativo = totalVentas - totalEgresos;

  const [drilling, setDrilling] = useState<{ open: boolean; title: string; items: any[] }>({
    open: false,
    title: '',
    items: []
  });

  const gastosSinComprobanteItems = useMemo(() => 
    gastos.filter((g: any) => !g.tieneComprobante)
      .map(g => ({
        title: g.concepto || 'Compra de Insumos',
        subtitle: `${g.categoria} • ${g.proveedor || 'Sin Proveedor'}`,
        amount: g.monto,
        status: 'Sin Factura',
        statusColor: 'text-orange-500'
      }))
  , [gastos]);

  const carteraPendienteItems = useMemo(() => 
    folios.filter(f => (f.montoTotal || 0) > (f.abonos?.reduce((sum: number, a: any) => sum + a.monto, 0) || 0))
      .map(f => {
        const pagado = f.abonos?.reduce((sum: number, a: any) => sum + a.monto, 0) || 0;
        return {
          title: `Folio: ${f.folio}`,
          subtitle: f.destino,
          amount: f.montoTotal - pagado,
          status: 'Adeudo Cliente',
          statusColor: 'text-red-500'
        };
      })
  , [folios]);

  const proveedoresPorPagarItems = useMemo(() => 
    gastos.filter(g => g.metodo === 'Crédito')
      .map(g => {
        const pagado = g.abonos?.reduce((acc: any, a: any) => acc + (a.monto || 0), 0) || 0;
        const pendiente = (g.monto || 0) - pagado;
        if (pendiente <= 0) return null;
        return {
          title: g.concepto || 'Crédito Proveedor',
          subtitle: g.proveedor,
          amount: pendiente,
          status: 'Por Liquidar',
          statusColor: 'text-agri-500'
        };
      }).filter((i): i is any => i !== null)
  , [gastos]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'documents'>('dashboard');

  const handleDownloadReport = async (type: string) => {
    state.addToast(`Preparando reporte de ${type}...`, 'info');
    
    try {
      const { generateBalancePDF, generateSalesReportPDF, generateExpensesReportPDF } = await import('../utils/reportGenerator');
      
      if (type === 'Balance') {
        await generateBalancePDF(
          currentSeason?.nombre || 'General',
          {
            folios,
            gastos,
            rayas: rayasSemanales,
            cuadrillas,
            cuentas: state.cuentasBancarias
          },
          'Agricore'
        );
        state.addToast('Balance General generado con éxito', 'success');
      } else if (type === 'Ventas') {
        await generateSalesReportPDF(
          currentSeason?.nombre || 'General',
          folios,
          'Agricore'
        );
        state.addToast('Historial de Ventas generado con éxito', 'success');
      } else if (type === 'Gastos') {
        await generateExpensesReportPDF(
          currentSeason?.nombre || 'General',
          gastos,
          rayasSemanales,
          cuadrillas,
          state.pagosNominaSemanal,
          'Agricore'
        );
        state.addToast('Reporte de Egresos generado con éxito', 'success');
      } else if (type === 'Inventario') {
        const { generateInventoryReportPDF } = await import('../utils/reportGenerator');
        await generateInventoryReportPDF(
          currentSeason?.nombre || 'General',
          folios,
          'Agricore'
        );
        state.addToast('Inventario de Salida generado con éxito', 'success');
      } else {
        state.addToast(`El reporte de ${type} estará disponible pronto.`, 'warning');
      }
    } catch (error) {
      console.error('Error:', error);
      state.addToast('Error al generar el reporte', 'error');
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-agri-600 dark:text-agri-400 mb-2">
             <BarChart3 className="w-5 h-5" />
             <span className="label-tiny">Análisis Gerencial</span>
             <div className="h-4 w-px bg-agri-200 dark:bg-slate-700 mx-1" />
             <span className="label-tiny !text-agri-400 dark:!text-slate-500">
               {currentSeason?.nombre || 'General'}
             </span>
          </div>
          <h1 className="title-primary text-5xl md:text-6xl">Reportes</h1>
          <p className="subtitle-secondary !text-sm max-w-lg">Monitoreo integral del rendimiento operativo y generación de documentos oficiales.</p>
        </div>
        
        <div className="flex bg-agri-50 dark:bg-slate-900 p-1.5 rounded-2xl border border-agri-100 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-agri-600 text-agri-900 dark:text-white shadow-sm' : 'text-agri-400 dark:text-slate-500 hover:text-agri-600'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'documents' ? 'bg-white dark:bg-agri-600 text-agri-900 dark:text-white shadow-sm' : 'text-agri-400 dark:text-slate-500 hover:text-agri-600'}`}
          >
            <FileText className="w-4 h-4" />
            Documentos
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          {/* Primary Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-agri-100/50 dark:border-slate-800 group hover:border-agri-200 dark:hover:border-agri-500/50 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-agri-50 dark:bg-agri-950/30 text-agri-600 dark:text-agri-400 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">Ventas Brutas</p>
              <div className="group/help relative cursor-help">
                <HelpCircle className="w-3 h-3 text-gray-300 dark:text-slate-700 hover:text-agri-500 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[8px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-50 text-center leading-tight">
                  Monto total facturado/pactado de todas las ventas en este ciclo.
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-display text-agri-900 dark:text-agri-50 tracking-tight">${totalVentas.toLocaleString()}</h3>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 font-medium">Acumulado del Periodo</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-orange-100/50 dark:border-slate-800 group hover:border-orange-200 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-2xl group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">Cobranza Real</p>
              <div className="group/help relative cursor-help">
                <HelpCircle className="w-3 h-3 text-gray-300 dark:text-slate-700 hover:text-orange-500 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[8px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-50 text-center leading-tight">
                  Monto total efectivamente cobrado y registrado en caja.
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-display text-gray-800 dark:text-agri-50 tracking-tight">${totalCobrado.toLocaleString()}</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-400 transition-all duration-1000" 
                style={{ width: `${totalVentas > 0 ? (totalCobrado / totalVentas) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-orange-600 dark:text-orange-400">{totalVentas > 0 ? Math.round((totalCobrado / totalVentas) * 100) : 0}%</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-red-100/50 dark:border-slate-800 group hover:border-red-200 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">Costo Operativo</p>
              <div className="group/help relative cursor-help">
                <HelpCircle className="w-3 h-3 text-gray-300 dark:text-slate-700 hover:text-red-500 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[8px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-50 text-center leading-tight">
                  Suma total de gastos (insumos, servicios) y pago de nóminas.
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-3xl font-display text-gray-800 dark:text-agri-50 tracking-tight">${totalEgresos.toLocaleString()}</h3>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 font-medium">Gastos + Nóminas</p>
        </div>

        <div className={`bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border group transition-all ${margenOperativo >= 0 ? 'border-agri-100/50 dark:border-slate-800 hover:border-agri-200 dark:hover:border-agri-500/50' : 'border-red-100 dark:border-red-900/50 hover:border-red-200'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform ${margenOperativo >= 0 ? 'bg-agri-50 dark:bg-agri-950/30 text-agri-600 dark:text-agri-400' : 'bg-red-50 dark:bg-red-950/30 text-red-600'}`}>
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">Utilidad Estimada</p>
              <div className="group/help relative cursor-help">
                <HelpCircle className="w-3 h-3 text-gray-300 dark:text-slate-700 hover:text-agri-500 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[8px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-50 text-center leading-tight">
                  Diferencia entre Ventas Brutas y Costos Operativos.
                </div>
              </div>
            </div>
          </div>
          <h3 className={`text-3xl font-display tracking-tight ${margenOperativo >= 0 ? 'text-agri-700 dark:text-agri-400' : 'text-red-600'}`}>
            ${margenOperativo.toLocaleString()}
          </h3>
          <div className="flex items-center gap-2 mt-2">
             <span className={`text-[10px] font-black ${margenOperativo >= 0 ? 'text-agri-500 dark:text-agri-500' : 'text-red-500'} uppercase`}>
                {totalVentas > 0 ? ((margenOperativo / totalVentas) * 100).toFixed(1) : 0}% Margen
             </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics - CLICKABLE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setDrilling({ open: true, title: 'Cartera Pendiente', items: carteraPendienteItems })}
          className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800 flex items-start gap-4 hover:shadow-xl hover:border-orange-200 dark:hover:border-orange-500/50 transition-all text-left group"
        >
          <div className="p-4 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
            <FileWarning className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Cartera Pendiente</p>
              <div className="group/help relative cursor-help">
                <HelpCircle className="w-3 h-3 text-gray-300 dark:text-slate-700 hover:text-agri-500 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[8px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-50 text-center leading-tight">
                  Monto total de ventas realizadas que aún no han sido cobradas.
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">${saldoPendiente.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Ver detalle</span>
               <ChevronRight className="w-3 h-3 text-orange-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => setDrilling({ open: true, title: 'Gastos Pend. Factura', items: gastosSinComprobanteItems })}
          className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800 flex items-start gap-4 hover:shadow-xl hover:border-yellow-200 dark:hover:border-yellow-500/50 transition-all text-left group"
        >
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Gastos Pend. Factura</p>
              <div className="group/help relative cursor-help">
                <HelpCircle className="w-3 h-3 text-gray-300 dark:text-slate-700 hover:text-agri-500 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[8px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-50 text-center leading-tight">
                  Número de gastos registrados que no tienen marcado el recibo de comprobante fiscal.
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-agri-50">{gastosSinComprobanteItems.length}</p>
            <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[9px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">Ver detalle</span>
               <ChevronRight className="w-3 h-3 text-yellow-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>

        <button 
          onClick={() => setDrilling({ open: true, title: 'Proveedores POR Pagar', items: proveedoresPorPagarItems })}
          className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-gray-100 dark:border-slate-800 flex items-start gap-4 hover:shadow-xl hover:border-agri-200 dark:hover:border-agri-500/50 transition-all text-left group"
        >
          <div className="p-4 bg-agri-50 dark:bg-agri-950/30 text-agri-600 dark:text-agri-400 rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Proveedores POR Pagar</p>
              <div className="group/help relative cursor-help">
                <HelpCircle className="w-3 h-3 text-gray-300 dark:text-slate-700 hover:text-agri-500 transition-colors" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-white text-[8px] font-bold uppercase tracking-widest rounded-lg opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all z-50 text-center leading-tight">
                  Saldo total adeudado a proveedores en compras realizadas a crédito.
                </div>
              </div>
            </div>
            <p className="text-2xl font-bold text-agri-700 dark:text-agri-400">${proveedoresPorPagarItems.reduce((acc, i) => acc + i.amount, 0).toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[9px] font-black text-agri-500 uppercase tracking-widest">Ver detalle</span>
               <ChevronRight className="w-3 h-3 text-agri-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </button>
      </div>

      <DrillDownModal 
        isOpen={drilling.open} 
        onClose={() => setDrilling({ ...drilling, open: false })}
        title={drilling.title}
        items={drilling.items}
      />

      {/* Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-agri-100/30 dark:border-slate-800 p-10">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-display text-agri-900 dark:text-agri-50 tracking-tight">Distribución de Ingresos</h2>
                <p className="text-agri-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Ranking de variedades por volumen de venta</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-agri-500 rounded-full" />
                    <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase">Monto Bruto</span>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              {(() => {
                const distribution = folios.reduce((acc: Record<string, number>, f: any) => {
                  const varName = f.variedad || 'Otras';
                  acc[varName] = (acc[varName] || 0) + (f.montoTotal || 0);
                  return acc;
                }, {});

                const sortedData = Object.entries(distribution)
                  .map(([name, value]) => ({ name, value }))
                  .sort((a: any, b: any) => b.value - a.value)
                  .slice(0, 5);

                const maxVal = Math.max(...sortedData.map((d: any) => d.value), 1);

                if (sortedData.length === 0) {
                  return (
                    <div className="h-64 flex flex-col items-center justify-center text-center opacity-40 italic border-2 border-dashed border-gray-100 rounded-[2rem]">
                      <BarChart3 className="w-12 h-12 mb-4 text-gray-200" />
                      <p className="text-sm font-medium uppercase tracking-widest">Sin datos para graficar</p>
                    </div>
                  );
                }

                return sortedData.map((d: any, idx: number) => (
                  <div key={idx} className="space-y-2 group text-left">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-black text-agri-900 dark:text-agri-50 uppercase tracking-tight">{d.name}</p>
                      <p className="text-sm font-display text-agri-600 dark:text-agri-400">${d.value.toLocaleString()}</p>
                    </div>
                    <div className="h-3 bg-agri-50 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-agri-600 dark:bg-agri-500 rounded-full transition-all duration-1000 group-hover:bg-agri-700 dark:group-hover:bg-agri-400"
                        style={{ width: `${(d.value / maxVal) * 100}%` }}
                      />
                    </div>
                  </div>
                ));
              })()}
           </div>
        </div>

        {/* Weight Distribution Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[40px] shadow-sm border border-agri-100/30 dark:border-slate-800 p-10 mt-8">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-display text-agri-900 dark:text-agri-50 tracking-tight">Carga por Variedad</h2>
                <p className="text-agri-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Total de kilogramos distribuidos en el mercado</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase">KG Netos</span>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              {(() => {
                const weightDist = folios.reduce((acc: Record<string, number>, f: any) => {
                  const varName = f.variedad || 'Otras';
                  const weight = Number(f.peso) || 0;
                  acc[varName] = (acc[varName] || 0) + weight;
                  return acc;
                }, {});

                const sortedWeights = Object.entries(weightDist)
                  .map(([name, value]) => ({ name, value }))
                  .sort((a: any, b: any) => b.value - a.value)
                  .slice(0, 5);

                const maxWeight = Math.max(...sortedWeights.map((d: any) => d.value), 1);

                if (sortedWeights.length === 0) {
                  return (
                    <div className="h-64 flex flex-col items-center justify-center text-center opacity-40 italic border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[2rem]">
                      <Scale className="w-12 h-12 mb-4 text-gray-200 dark:text-slate-700" />
                      <p className="text-sm font-medium uppercase tracking-widest">Sin datos para graficar</p>
                    </div>
                  );
                }

                return sortedWeights.map((d: any, idx: number) => (
                  <div key={idx} className="space-y-2 group text-left">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-black text-agri-900 dark:text-agri-50 uppercase tracking-tight">{d.name}</p>
                      <p className="text-sm font-display text-blue-600 dark:text-blue-400">{d.value.toLocaleString()} <span className="text-[10px] not-italic text-gray-400">KG</span></p>
                    </div>
                    <div className="h-3 bg-blue-50 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000 group-hover:bg-blue-700 dark:group-hover:bg-blue-400"
                        style={{ width: `${(d.value / maxWeight) * 100}%` }}
                      />
                    </div>
                  </div>
                ));
              })()}
           </div>
        </div>

        {/* Bottom Panel Summary */}
        <div className="bg-agri-900 dark:bg-slate-900 rounded-[40px] shadow-2xl p-10 text-white flex flex-col justify-between overflow-hidden relative border border-white/5 dark:border-slate-800">
           <div className="absolute top-0 right-0 w-40 h-40 bg-agri-600/20 dark:bg-agri-500/10 rounded-full blur-[60px]" />
           
           <div className="relative z-10">
              <h2 className="text-2xl font-display italic tracking-tight mb-2">Flujo de Caja</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-12">Consolidado operativo</p>
              
              <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-10 bg-agri-400 rounded-full" />
                    <div>
                       <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest leading-none mb-1">Margen Cobrado Real</p>
                       <p className={`text-2xl font-display ${totalCobrado - totalEgresos >= 0 ? 'text-white' : 'text-red-400'}`}>
                          ${(totalCobrado - totalEgresos).toLocaleString()}
                       </p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="w-2 h-10 bg-white/20 rounded-full" />
                    <div>
                       <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest leading-none mb-1">Ventas por Facturar/Cobrar</p>
                       <p className="text-2xl font-display text-white/60">${saldoPendiente.toLocaleString()}</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="relative z-10 pt-10 mt-auto border-t border-white/10">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-4">Eficiencia Financiera</p>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${margenOperativo > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                 <span className="text-[10px] font-black uppercase tracking-tight">Utilidad del {totalVentas > 0 ? ((margenOperativo / totalVentas) * 100).toFixed(1) : 0}%</span>
              </div>
           </div>
        </div>
        </div>
      </>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
        {[
          { 
            title: 'Historial de Ventas', 
            desc: 'Detalle completo de folios, clientes y facturación del periodo.', 
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'bg-agri-50 text-agri-600',
            type: 'Ventas'
          },
          { 
            title: 'Reporte de Egresos', 
            desc: 'Desglose de gastos operativos, insumos y compras a proveedores.', 
            icon: <TrendingDown className="w-6 h-6" />,
            color: 'bg-red-50 text-red-600',
            type: 'Gastos'
          },
          { 
            title: 'Cuentas por Cobrar', 
            desc: 'Estado actual de cartera vencida y pagos pendientes de clientes.', 
            icon: <Wallet className="w-6 h-6" />,
            color: 'bg-orange-50 text-orange-600',
            type: 'Cartera'
          },
          { 
            title: 'Balance General', 
            desc: 'Resumen financiero consolidado: Ingresos vs Egresos del ciclo.', 
            icon: <Activity className="w-6 h-6" />,
            color: 'bg-blue-50 text-blue-600',
            type: 'Balance'
          },
          { 
            title: 'Inventario de Salida', 
            desc: 'Reporte por tonelaje y variedad de producto comercializado.', 
            icon: <Scale className="w-6 h-6" />,
            color: 'bg-slate-100 text-slate-600',
            type: 'Inventario'
          }
        ].map((report, idx) => (
          <div 
            key={idx}
            className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-agri-100 dark:border-slate-800 shadow-sm group hover:shadow-2xl hover:shadow-agri-900/5 transition-all flex flex-col justify-between h-80"
          >
            <div>
               <div className={`p-4 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform ${report.color} dark:bg-slate-800`}>
                 {report.icon}
               </div>
               <h3 className="text-2xl font-display text-agri-900 dark:text-agri-50 italic mb-2">{report.title}</h3>
               <p className="text-xs text-gray-400 dark:text-slate-500 font-medium leading-relaxed uppercase tracking-tighter">{report.desc}</p>
            </div>
            
            <button 
              onClick={() => handleDownloadReport(report.type)}
              className="mt-8 flex items-center justify-between p-5 bg-agri-50 dark:bg-slate-800/50 rounded-2xl group/btn hover:bg-agri-600 dark:hover:bg-agri-500 transition-all"
            >
               <span className="text-[10px] font-black uppercase tracking-widest text-agri-600 dark:text-agri-400 group-hover/btn:text-white">Descargar PDF</span>
               <Download className="w-4 h-4 text-agri-400 group-hover/btn:text-white animate-bounce" />
            </button>
          </div>
        ))}

        {/* Info Card helper */}
        <div className="bg-agri-900 dark:bg-slate-800 p-10 rounded-[3rem] text-white flex flex-col justify-center relative overflow-hidden h-80">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4">Información</p>
           <h3 className="text-3xl font-display italic leading-tight">Exporta registros oficiales</h3>
           <p className="mt-4 text-sm text-white/60 leading-relaxed italic">Todos los reportes se generan filtrando automáticamente los datos de la temporada: <span className="text-agri-400 font-bold not-italic font-sans">{currentSeason?.nombre}</span></p>
        </div>
      </div>
    )}
  </div>
);
};

export default Reportes;
