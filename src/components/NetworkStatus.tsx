import { useState, useEffect, useMemo } from 'react';
import { Wifi, WifiOff, RefreshCw, X, Database, Cloud, CloudOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const NetworkStatus = ({ 
  showButton = true, 
  onOpenModal, 
  externalShowModal, 
  onSetShowModal 
}: { 
  showButton?: boolean, 
  onOpenModal?: () => void, 
  externalShowModal?: boolean, 
  onSetShowModal?: (val: boolean) => void 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [internalShowModal, setInternalShowModal] = useState(false);
  
  const showModal = externalShowModal !== undefined ? externalShowModal : internalShowModal;
  const setShowModal = onSetShowModal || setInternalShowModal;

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
      {showButton && (
        <button 
          onClick={onOpenModal || (() => setShowModal(true))}
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
      )}

      {/* MODAL SYNC MANAGER */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden">
           {/* Backdrop con blurring */}
           <div 
             className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500"
             onClick={() => setShowModal(false)}
           />
           
           {/* Modal Container - Forzado a estar en el centro */}
           <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-12 duration-500 border border-slate-200 dark:border-slate-800 max-h-[90vh]">
              
              {/* Nueva Cabecera Ultra-Visible */}
              <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-agri-600 rounded-2xl flex items-center justify-center shadow-lg shadow-agri-600/20">
                       {totalPending > 0 ? <CloudOff className="w-6 h-6 text-white" /> : <Cloud className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                       <h2 className="text-xl font-display font-black text-slate-900 dark:text-white leading-none">Gestor de Nube</h2>
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1.5">Sincronización Activa</p>
                    </div>
                 </div>

                 {/* Botón de Cierre con Contraste Total */}
                 <button 
                    onClick={() => setShowModal(false)}
                    className="p-3 bg-white dark:bg-slate-700 hover:bg-red-500 dark:hover:bg-red-500 text-slate-900 dark:text-white hover:text-white rounded-2xl shadow-md hover:shadow-xl transition-all active:scale-90 border border-slate-200 dark:border-slate-600 flex items-center justify-center group"
                    title="Cerrar"
                 >
                    <X className="w-5 h-5 stroke-[4]" />
                 </button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto flex-1 scrollbar-hide dark:bg-slate-900">
                 {/* Pending List */}
                 <div className="space-y-5">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Pendientes por Sincronizar</p>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-inner">
                       {pendingItems.length > 0 ? pendingItems.map(item => (
                          <div key={item.name} className="p-6 flex items-center justify-between group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                                   <Database className="w-4 h-4 text-agri-600" />
                                </div>
                                <span className="text-sm font-black text-slate-700 dark:text-slate-200">{item.name}</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-sm tracking-tighter">{item.count}</span>
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                             </div>
                          </div>
                       )) : (
                          <div className="p-12 flex flex-col items-center justify-center text-center space-y-5">
                             <div className="w-20 h-20 bg-agri-50 dark:bg-agri-900/20 text-agri-600 dark:text-agri-400 rounded-[2rem] flex items-center justify-center shadow-xl shadow-agri-600/10">
                                <CheckCircle2 className="w-10 h-10" />
                             </div>
                             <div className="space-y-1">
                                <p className="text-lg font-display font-black text-agri-900 dark:text-white italic">"Todo está en la nube"</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tus registros están seguros</p>
                             </div>
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
