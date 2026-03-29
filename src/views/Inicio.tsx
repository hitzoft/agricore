import { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Info, 
  Calendar, 
  AlertTriangle, 
  FileWarning, 
  Wifi, 
  WifiOff, 
  Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';

const Inicio = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const state = useStore();

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

  const { alertas } = state;

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
      {/* Header Bienvenida */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-agri-600 mb-2">
             <Zap className="w-5 h-5 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Panel de Control</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display text-agri-900 tracking-tight">Hola, <span className="text-agri-600 italic">Paul</span></h1>
          <p className="text-agri-400 text-sm font-medium max-w-md leading-relaxed italic">Bienvenido de nuevo al centro de mando de Agricore.</p>
        </div>
        
        <div className={`px-6 py-4 rounded-[2rem] border-2 flex items-center gap-4 transition-all shadow-xl shadow-agri-900/5 ${isOnline ? 'bg-white border-agri-100' : 'bg-red-50 border-red-100'}`}>
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
          <div>
             <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isOnline ? 'text-agri-700' : 'text-red-600'}`}>
               {isOnline ? 'Sistema en Línea' : 'Modo Sin Conexión'}
             </p>
             <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Latencia Proyectada: &lt; 50ms</p>
          </div>
        </div>
      </div>

      {/* Grid Quick Actions / status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sync Card */}
        <div className="lg:col-span-2 bg-agri-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-agri-600/20 rounded-full blur-[80px] -mr-32 -mt-32" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/10">
                    {isOnline ? <Wifi className="w-8 h-8 text-agri-400" /> : <WifiOff className="w-8 h-8 text-red-400" />}
                 </div>
                  <div>
                    <h2 className="text-2xl font-display italic leading-none">Estado de la Nube</h2>
                  </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                 {[
                   { label: 'Nómina', count: state.rayasSemanales.length },
                   { label: 'Ventas', count: state.folios.length },
                   { label: 'Gastos', count: state.gastos.length },
                   { 
                     label: 'Catálogos', 
                     count: state.empleados.length + state.productos.length + state.clientes.length + state.huertas.length + state.proveedores.length + state.cabos.length 
                   },
                 ].map((item) => (
                   <div key={item.label} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                     <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">{item.label}</span>
                     <span className="text-xl font-display">{item.count}</span>
                   </div>
                 ))}
              </div>

              <div className="mt-auto p-6 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                 <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-1">Sincronización de Datos</p>
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

        {/* Quick Health Section */}
        <div className="bg-white rounded-[3rem] p-10 border border-agri-100 shadow-sm flex flex-col">
           <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-agri-50 text-agri-600 rounded-2xl">
                 <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-display text-agri-900 tracking-tight">Salud del Sistema</h3>
           </div>
           
           <div className="space-y-6 flex-1">
              <div className="flex items-center justify-between group cursor-help">
                 <p className="text-xs font-bold text-gray-500 group-hover:text-agri-600 transition-colors">Base de Datos Local</p>
                 <span className="text-[10px] font-black text-agri-600 bg-agri-50 px-3 py-1 rounded-full uppercase">Local</span>
              </div>
              <div className="flex items-center justify-between group cursor-help">
                 <p className="text-xs font-bold text-gray-500 group-hover:text-agri-600 transition-colors">Estado de Memoria</p>
                 <span className="text-[10px] font-black text-agri-600 bg-agri-50 px-3 py-1 rounded-full uppercase">Optimizado</span>
              </div>
              <div className="flex items-center justify-between group cursor-help">
                 <p className="text-xs font-bold text-gray-500 group-hover:text-agri-600 transition-colors">Alertas Hoy</p>
                 <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase">{alertas.length} Activas</span>
              </div>
           </div>


        </div>

      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-[40px] shadow-sm border border-agri-100/30 overflow-hidden">
        <div className="p-8 border-b border-agri-50 bg-agri-50/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display text-agri-900 tracking-tight">Actividad Reciente</h2>
            <p className="text-agri-400 text-[10px] font-bold uppercase tracking-widest mt-1">Historial detallado de operaciones</p>
          </div>
          <Calendar className="w-5 h-5 text-agri-300" />
        </div>
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {alertas.length === 0 && (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm font-medium italic">Todo en orden. No hay alertas pendientes por ahora.</p>
            </div>
          )}
          {alertas.map((alert: any) => (
            <div key={alert.id} className="p-6 flex items-start gap-6 hover:bg-agri-50/20 transition-colors">
              <div className={`p-2 rounded-lg shrink-0 ${
                alert.type === 'error' ? 'bg-red-50 text-red-500' : 
                alert.type === 'warning' ? 'bg-yellow-50 text-yellow-600' : 
                'bg-agri-50 text-agri-600'
              }`}>
                {alert.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                {alert.type === 'error' && <FileWarning className="w-5 h-5" />}
                {alert.type === 'info' && <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-agri-900 font-bold text-sm tracking-tight">{alert.text}</p>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter bg-gray-50 px-2 py-0.5 rounded-full">{alert.time}</span>
                </div>
                <p className="text-xs text-gray-400 font-medium">Registro automático de auditoría</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inicio;
