import { useState, useEffect, useMemo } from 'react';
import { Wifi, WifiOff, RefreshCw, X, Database, Cloud, CloudOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const state = useStore();
  const syncPending = state.syncPending;

  const collections = [
    'empleados', 'clientes', 'proveedores', 'huertas', 
    'cabos', 'cuentasBancarias', 'folios', 'gastos', 
    'cuadrillas', 'rayasSemanales', 'pagosNominaSemanal', 'productos'
  ];

  const pendingItems = useMemo(() => {
    const list: { name: string, count: number }[] = [];
    collections.forEach(col => {
      // @ts-ignore
      const items = state[col] || [];
      const count = items.filter((i: any) => i.syncStatus === 'pending').length;
      if (count > 0) {
        list.push({ 
          name: col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1'), 
          count 
        });
      }
    });
    return list;
  }, [state]);

  const totalPending = pendingItems.reduce((acc, curr) => acc + curr.count, 0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    try {
      await syncPending();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className={`relative flex items-center gap-2 text-xs md:text-sm font-medium px-4 py-2 rounded-2xl shadow-lg shadow-black/5 transition-all active:scale-95 ${
          !isOnline 
            ? 'bg-red-500 text-white animate-pulse' 
            : totalPending > 0 
              ? 'bg-orange-500 text-white hover:bg-orange-600' 
              : 'bg-agri-600 text-white hover:bg-agri-700'
        }`}
      >
        {!isOnline ? (
          <WifiOff className="w-4 h-4" />
        ) : isSyncing ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Wifi className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {!isOnline 
            ? `Modo Offline (${totalPending})` 
            : totalPending > 0 
              ? `Subida Pendiente (${totalPending})` 
              : 'Nube Sincronizada'}
        </span>
        <span className="sm:hidden font-black">{totalPending}</span>
      </button>

      {/* MODAL SYNC MANAGER */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 bg-agri-900 text-white relative flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    {totalPending > 0 ? <CloudOff className="w-6 h-6 text-orange-400" /> : <Cloud className="w-6 h-6 text-agri-400" />}
                 </div>
                 <div>
                    <h2 className="text-xl font-display leading-none">Gestor de Nube</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-1">Sincronización de Datos</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 p-2 bg-white/10 hover:bg-white/20 rounded-xl">
                    <X className="w-4 h-4" />
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 {/* Connection Status Card */}
                 <div className={`p-6 rounded-[2rem] border-2 flex items-center justify-between ${isOnline ? 'bg-agri-50/30 border-agri-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-2xl ${isOnline ? 'bg-agri-600 text-white shadow-lg shadow-agri-600/20' : 'bg-red-600 text-white'}`}>
                          {isOnline ? <Wifi className="w-5 h-5"/> : <WifiOff className="w-5 h-5"/>}
                       </div>
                       <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-agri-600' : 'text-red-600'}`}>Internet</p>
                          <p className="text-sm font-bold text-slate-800">{isOnline ? 'Conexión Estable' : 'Sin conexión a red'}</p>
                       </div>
                    </div>
                 </div>

                 {/* Pending List */}
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Pendientes por Sincronizar</p>
                    <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                       {pendingItems.length > 0 ? pendingItems.map(item => (
                          <div key={item.name} className="p-5 flex items-center justify-between group hover:bg-white transition-colors">
                             <div className="flex items-center gap-3">
                                <Database className="w-4 h-4 text-slate-300" />
                                <span className="text-sm font-black text-slate-700">{item.name}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <span className="bg-white border border-slate-200 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-xl shadow-sm tracking-tighter">{item.count}</span>
                                <AlertCircle className="w-4 h-4 text-orange-400" />
                             </div>
                          </div>
                       )) : (
                          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                             <div className="w-16 h-16 bg-agri-100 text-agri-600 rounded-3xl flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8" />
                             </div>
                             <p className="text-sm font-black text-agri-900 italic">"Todo está en la nube"</p>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Action */}
                 <div className="pt-4">
                    <button 
                      onClick={handleSync}
                      disabled={!isOnline || totalPending === 0 || isSyncing}
                      className={`w-full py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                        isSyncing 
                          ? 'bg-blue-600 text-white' 
                          : totalPending > 0 
                            ? 'bg-agri-600 text-white hover:bg-agri-700 shadow-agri-600/20' 
                            : 'bg-slate-100 text-slate-300 shadow-none'
                      }`}
                    >
                       {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                       {isSyncing ? 'Subiendo cambios...' : 'Sincronizar Ahora'}
                    </button>
                    {totalPending > 0 && isOnline && !isSyncing && (
                      <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 animate-pulse">Pulse para forzar la subida a la Nube</p>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default NetworkStatus;
