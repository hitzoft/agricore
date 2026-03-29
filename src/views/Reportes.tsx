import { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Layers,
  FileWarning, 
  Clock,
  Activity,
  BarChart3,
  Search
} from 'lucide-react';
import { useStore } from '../store/useStore';

const Reportes = () => {
  const state = useStore();
  const { folios, gastos, cuadrillas, rayasSemanales } = state;

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

  const gastosSinComprobante = useMemo(() => gastos.filter((g: any) => !g.tieneComprobante).length, [gastos]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-agri-600 mb-2">
             <BarChart3 className="w-5 h-5" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Análisis Gerencial</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display text-agri-900 tracking-tight">Reportes</h1>
          <p className="text-agri-400 text-sm font-medium max-w-lg leading-relaxed italic">Monitoreo integral del rendimiento operativo y salud financiera del ciclo actual.</p>
        </div>
        
        <div className="flex gap-4">
           <button className="bg-white border border-agri-100 p-4 rounded-2xl text-agri-400 hover:bg-agri-50 transition-all shadow-sm">
             <Search className="w-5 h-5" />
           </button>
           <button className="bg-agri-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-agri-600/20 active:scale-95 transition-all">Exportar PDF</button>
        </div>
      </div>

      {/* Primary Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-agri-100/50 group hover:border-agri-200 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-agri-50 text-agri-600 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Ventas Brutas</p>
          </div>
          <h3 className="text-3xl font-display text-agri-900 tracking-tight">${totalVentas.toLocaleString()}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Acumulado del Periodo</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100/50 group hover:border-orange-200 transition-all text-orange-950">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Cobranza Real</p>
          </div>
          <h3 className="text-3xl font-display text-gray-800 tracking-tight">${totalCobrado.toLocaleString()}</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-400 transition-all duration-1000" 
                style={{ width: `${totalVentas > 0 ? (totalCobrado / totalVentas) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-orange-600">{totalVentas > 0 ? Math.round((totalCobrado / totalVentas) * 100) : 0}%</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100/50 group hover:border-red-200 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
              <TrendingDown className="w-6 h-6" />
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Costo Operativo</p>
          </div>
          <h3 className="text-3xl font-display text-gray-800 tracking-tight">${totalEgresos.toLocaleString()}</h3>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Insumos + Nóminas</p>
        </div>

        <div className={`bg-white p-8 rounded-3xl shadow-sm border group transition-all ${margenOperativo >= 0 ? 'border-agri-100/50 hover:border-agri-200' : 'border-red-100 hover:border-red-200'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform ${margenOperativo >= 0 ? 'bg-agri-50 text-agri-600' : 'bg-red-50 text-red-600'}`}>
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Utilidad Estimada</p>
          </div>
          <h3 className={`text-3xl font-display tracking-tight ${margenOperativo >= 0 ? 'text-agri-700' : 'text-red-600'}`}>
            ${margenOperativo.toLocaleString()}
          </h3>
          <div className="flex items-center gap-2 mt-2">
             <span className={`text-[10px] font-black ${margenOperativo >= 0 ? 'text-agri-500' : 'text-red-500'} uppercase`}>
                {totalVentas > 0 ? ((margenOperativo / totalVentas) * 100).toFixed(1) : 0}% Margen
             </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <FileWarning className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Cartera Pendiente</p>
            <p className="text-2xl font-bold text-orange-600">${saldoPendiente.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Gastos Pend. Factura</p>
            <p className="text-2xl font-bold text-gray-800">{gastosSinComprobante}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-agri-50 text-agri-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Proveedores x Pagar</p>
            <p className="text-2xl font-bold text-agri-700">${gastos.reduce((s: any, g: any) => {
               if (g.metodo !== 'Crédito') return s;
               const pagado = g.abonos?.reduce((acc: any, a: any) => acc + (a.monto || 0), 0) || 0;
               return s + ((g.monto || 0) - pagado);
            }, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-agri-100/30 p-10">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-display text-agri-900 tracking-tight">Distribución de Ingresos</h2>
                <p className="text-agri-400 text-[10px] font-bold uppercase tracking-widest mt-1">Ranking de variedades por volumen de venta</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-agri-500 rounded-full" />
                    <span className="text-[9px] font-black text-gray-400 uppercase">Monto Bruto</span>
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
                  <div key={idx} className="space-y-2 group">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-black text-agri-900 uppercase tracking-tight">{d.name}</p>
                      <p className="text-sm font-display text-agri-600">${d.value.toLocaleString()}</p>
                    </div>
                    <div className="h-3 bg-agri-50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-agri-600 rounded-full transition-all duration-1000 group-hover:bg-agri-700"
                        style={{ width: `${(d.value / maxVal) * 100}%` }}
                      />
                    </div>
                  </div>
                ));
              })()}
           </div>
        </div>

        {/* Bottom Panel Summary */}
        <div className="bg-agri-900 rounded-[40px] shadow-2xl p-10 text-white flex flex-col justify-between overflow-hidden relative">
           <div className="absolute top-0 right-0 w-40 h-40 bg-agri-600/20 rounded-full blur-[60px]" />
           
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
    </div>
  );
};

export default Reportes;
