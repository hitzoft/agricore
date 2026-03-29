import { useState, useEffect, useMemo } from 'react';
import { 
  Info, 
  Calendar, 
  Wifi, 
  WifiOff, 
  Zap,
  Truck,
  ArrowUpRight,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';

const Inicio = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const state = useStore();
  const { currentUser } = useAuth();

  // Get first and second name if available
  const userName = useMemo(() => {
    if (!currentUser?.displayName) return 'Administrador';
    const names = currentUser.displayName.split(' ');
    // Return first two names if they exist, otherwise just the first
    return names.length >= 2 ? `${names[0]} ${names[1]}` : names[0];
  }, [currentUser]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { folios, gastos, activeSeasonId } = state;

  const ActividadReciente = useMemo(() => {
    const recentFolios = folios
      .filter(f => f.seasonId === activeSeasonId)
      .map(f => ({
        id: f.id,
        type: 'venta',
        title: `Venta: ${f.folio}`,
        subtitle: f.destino,
        monto: f.montoTotal,
        time: f.fecha,
        icon: Truck,
        color: 'bg-agri-500/10 text-agri-600 dark:text-agri-400'
      }));

    const recentGastos = gastos
      .filter(g => g.seasonId === activeSeasonId)
      .map(g => ({
        id: g.id,
        type: 'gasto',
        title: g.proveedor,
        subtitle: g.concepto,
        monto: g.monto,
        time: g.fecha,
        icon: DollarSign,
        color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
      }));

    return [...recentFolios, ...recentGastos]
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 10);
  }, [folios, gastos, activeSeasonId]);

  const pendingCount = useMemo(() => {
    const collections = [
      'empleados', 'clientes', 'proveedores', 'huertas', 
      'cabos', 'cuentasBancarias', 'folios', 'gastos', 
      'cuadrillas', 'rayasSemanales', 'pagosNominaSemanal', 'productos'
    ];
    let count = 0;
    collections.forEach(col => {
      // @ts-ignore
      const items = state[col] || [];
      count += items.filter((i: any) => i.syncStatus === 'pending').length;
    });
    return count;
  }, [state]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-agri-600 dark:text-agri-400 mb-2">
             <Zap className="w-5 h-5 animate-pulse" />
             <span className="label-tiny !text-agri-600/80 dark:!text-agri-400/80">Panel de Control</span>
             <div className="h-4 w-px bg-agri-200 dark:bg-slate-800 mx-1" />
             <span className="label-tiny !text-agri-400 dark:!text-slate-500">
               {state.temporadas.find(t => t.id === state.activeSeasonId)?.nombre || 'Cargando...'}
             </span>
          </div>
          <h1 className="title-primary text-5xl md:text-6xl italic">Bienvenido, <span className="text-agri-accent not-italic">{userName}</span></h1>
          <p className="subtitle-secondary !text-sm max-w-md">Centro de mando y control operativo de Agricore.</p>
        </div>
      </div>

      {/* Grid Quick Actions / status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sync Card */}
        <div className="lg:col-span-3 bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 dark:border-slate-800">
           <div className="absolute top-0 right-0 w-64 h-64 bg-agri-600/20 rounded-full blur-[80px] -mr-32 -mt-32" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-16 h-16 bg-white/10 dark:bg-slate-800/50 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/10 dark:border-slate-700 transition-colors">
                    {isOnline ? <Wifi className="w-8 h-8 text-agri-400" /> : <WifiOff className="w-8 h-8 text-red-400" />}
                 </div>
                  <div>
                    <h2 className="text-2xl font-display italic leading-none">Estado de la Nube</h2>
                  </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                 {[
                   { label: 'Nómina', count: state.rayasSemanales.filter(r => r.seasonId === state.activeSeasonId).length },
                   { label: 'Ventas', count: state.folios.filter(f => f.seasonId === state.activeSeasonId).length },
                   { label: 'Gastos', count: state.gastos.filter(g => g.seasonId === state.activeSeasonId).length },
                   { 
                     label: 'Personal', 
                     count: state.empleados.filter(e => e.activo !== false).length 
                   },
                 ].map((item) => (
                   <div key={item.label} className="bg-white/5 border border-white/5 dark:border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center">
                     <span className="label-tiny !text-white/30 mb-1">{item.label}</span>
                     <span className="text-xl font-display">{item.count}</span>
                   </div>
                 ))}
              </div>

              <div className="mt-auto p-6 bg-white/5 dark:bg-slate-800/50 rounded-[2rem] border border-white/5 dark:border-slate-700/50 backdrop-blur-sm transition-colors">
                 <div className="flex items-center justify-between mb-2">
                    <p className="label-tiny !text-white/40 mt-1">Sincronización de Datos</p>
                    {pendingCount === 0 ? (
                       <span className="text-[8px] font-black bg-agri-500/20 text-agri-400 px-2 py-1 rounded-full uppercase">Al Día</span>
                    ) : (
                       <span className="text-[8px] font-black bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full uppercase animate-pulse">Pendiente</span>
                    )}
                 </div>
                 <p className="text-sm font-medium italic text-white/60">
                    {pendingCount > 0 
                       ? `${pendingCount} registros locales esperando conexión para subirse.` 
                       : '✓ Todos tus datos están seguros y actualizados en la nube.'}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="card-base overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-800/20 flex items-center justify-between transition-colors">
          <div>
            <h2 className="title-primary text-xl">Actividad Reciente</h2>
            <p className="label-tiny mt-1">Sincronizado con datos reales</p>
          </div>
          <Calendar className="w-5 h-5 text-slate-300 dark:text-slate-600 transition-colors" />
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
          {ActividadReciente.length === 0 && (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Info className="w-8 h-8 text-slate-300 dark:text-slate-600 transition-colors" />
              </div>
              <p className="subtitle-secondary !text-sm">Sin actividad reciente en este ciclo agrícola.</p>
            </div>
          )}
          {ActividadReciente.map((item) => (
            <div key={item.id} className="p-6 flex items-start gap-6 hover:bg-slate-50/20 dark:hover:bg-slate-800/50 transition-colors group">
              <div className={`p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="title-primary !text-sm font-bold">{item.title}</p>
                    <p className="label-tiny">{item.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="label-tiny bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full block mb-1 transition-colors">{item.time}</span>
                    <p className="text-xs font-display text-agri-accent italic">${item.monto.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inicio;
