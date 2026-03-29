import { useState, useEffect, useMemo } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Truck, Users, Receipt, Menu, X, BookOpen, Wallet, LogOut, Smartphone, User, WifiOff, CloudOff, Calendar, ChevronRight, Plus } from 'lucide-react';
import NetworkStatus from '../components/NetworkStatus';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import LogoutModal from '../components/LogoutModal';

const MainLayout = () => {
  const { signOut, currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const state = useStore();
  const collections = [
    'empleados', 'clientes', 'proveedores', 'huertas', 
    'cabos', 'cuentasBancarias', 'folios', 'gastos', 
    'cuadrillas', 'rayasSemanales', 'pagosNominaSemanal', 'productos'
  ];

  const totalPending = useMemo(() => {
    let total = 0;
    collections.forEach(col => {
      // @ts-ignore
      const items = state[col] || [];
      total += items.filter((i: any) => i.syncStatus === 'pending').length;
    });
    return total;
  }, [state]);

  const { activeSeasonId, setActiveSeason, temporadas } = state;

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

   // Inicializar Temporada por defecto si no existen
   // Se crea una por defecto (ej. Temporada 2024-2025) SOLO si la lista está vacía
   // y no hay una temporada activa, para evitar duplicados.
    useEffect(() => {
      if (temporadas.length === 0 && !activeSeasonId) {
        // We no longer auto-add a hardcoded season here to let the MissingSeasonOverlay 
        // handle the name provided by the user.
      } else if (temporadas.length > 0 && !activeSeasonId) {
        const active = temporadas.find(t => t.activa) || temporadas[0];
        if (active) setActiveSeason(active.id);
      }
    }, [temporadas.length, activeSeasonId, setActiveSeason]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(true);
    }
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBtn(false);
      }
    } else {
      alert("En iPhone: Presiona 'Compartir' (el cuadro con flecha) y luego 'Agregar a Inicio'.");
    }
  };

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await signOut();
  };

  const mainNav = [
    { to: '/inicio', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
    { to: '/reportes', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Reportes' },
  ];

  const operationsNav = [
    { to: '/ventas', icon: <Truck className="w-5 h-5" />, label: 'Ventas' },
    { to: '/gastos', icon: <Receipt className="w-5 h-5" />, label: 'Gastos' },
    { to: '/cxc', icon: <Wallet className="w-5 h-5" />, label: 'Cobranza' },
    { to: '/nomina', icon: <Users className="w-5 h-5" />, label: 'Nómina' },
  ];

  const adminNav = [
    { to: '/catalogos', icon: <BookOpen className="w-5 h-5" />, label: 'Catálogos' },
  ];

  const mobileNavItems = [
    { to: '/inicio', icon: <Home className="w-6 h-6" />, label: 'Inicio' },
    { to: '/ventas', icon: <Truck className="w-6 h-6" />, label: 'Ventas' },
    { to: '/gastos', icon: <Receipt className="w-6 h-6" />, label: 'Gastos' },
    { to: '/nomina', icon: <Users className="w-6 h-6" />, label: 'Nómina' },
  ];

  const NavItem = ({ item, onClick }: { item: any, onClick: () => void }) => (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
          isActive 
            ? 'bg-agri-600 text-white shadow-lg shadow-agri-600/20 font-bold translate-x-1' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <div className="shrink-0 group-hover:scale-110 transition-transform duration-300">
        {item.icon}
      </div>
      <span className="text-sm tracking-tight">{item.label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Header Premium Glassmorphism (Light Theme) */}
      <header className="bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 sticky top-0 z-[60] px-4 py-3 md:px-8 md:py-4 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center max-w-full mx-auto w-full gap-4">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 active:scale-95 transition-all lg:hidden border border-slate-200/60 shadow-sm"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-11 h-11 md:w-14 md:h-14 bg-white rounded-2xl md:rounded-[1.25rem] shadow-md border-2 border-slate-100 shrink-0 group transition-all hover:shadow-xl hover:scale-105 duration-500 overflow-hidden flex items-center justify-center">
                 <img src="/logo.png" alt="Agricore Logo" className="w-full h-full object-cover scale-[2.2] group-hover:scale-[2.4] transition-transform duration-700" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-display font-black tracking-tight leading-none bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent mb-0.5">Agricore</h1>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                  <span className="text-slate-400 font-black text-[8px] md:text-[9px] uppercase tracking-[0.2em] leading-none">Management Cloud</span>
                </div>
              </div>
            </div>

            {/* Selector de Temporada Central */}
            <div className="hidden md:flex flex-grow justify-center max-w-xs">
              <div className="flex items-center gap-3 bg-agri-600/5 hover:bg-agri-600/10 px-4 py-2.5 rounded-[1.25rem] border-2 border-agri-600/10 transition-all group cursor-pointer shadow-sm active:scale-95 relative overflow-hidden min-w-[200px]">
                <div className="bg-agri-600 p-2.5 rounded-xl text-white shadow-md shadow-agri-600/20 group-hover:scale-110 transition-transform pointer-events-none z-0">
                  <Calendar className="w-4 h-4" />
                </div>
                
                <div className="flex flex-col flex-1 pointer-events-none z-0">
                  <span className="text-[8px] font-black text-agri-400 uppercase tracking-[0.2em] leading-none mb-1">Ciclo Activo</span>
                  <div className="text-sm font-black text-agri-900 uppercase tracking-tight leading-none truncate pr-4">
                    {temporadas.find(t => t.id === activeSeasonId)?.nombre || 'Seleccionar'}
                  </div>
                </div>

                {/* Select real oculto que atrapa el click en TODA la tarjeta */}
                <select 
                  value={activeSeasonId} 
                  onChange={(e) => setActiveSeason(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                >
                  {temporadas.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-agri-400 pointer-events-none group-hover:translate-y-[-40%] transition-transform z-0">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Perfil y Estado (Header) */}
            <div className="flex items-center bg-slate-100/80 rounded-2xl p-1 pr-3 border border-slate-200/50 hover:bg-slate-200/50 transition-all group relative cursor-pointer" onClick={() => setShowSyncModal(true)}>
               <div className="relative">
                 <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-agri-600 transition-transform group-hover:scale-105 active:scale-95">
                    <User size={20} className="stroke-[2.5]" />
                 </div>
                 {/* Badge de Estado Simple */}
                 <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                   !isOnline ? 'bg-red-500' : totalPending > 0 ? 'bg-orange-500' : 'bg-emerald-500'
                 }`}>
                   {!isOnline ? (
                     <WifiOff size={8} className="text-white" />
                   ) : totalPending > 0 ? (
                     <CloudOff size={8} className="text-white" />
                   ) : (
                     <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                   )}
                 </div>
               </div>
               
               <div className="ml-3 hidden sm:flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase leading-none mb-1">
                    {totalPending > 0 ? `${totalPending} Pendientes` : isOnline ? 'Sincronizado' : 'Sin Red'}
                  </span>
                  <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                    {currentUser?.email?.split('@')[0]}
                  </p>
               </div>
            </div>
            
            <NetworkStatus showButton={false} onOpenModal={() => setShowSyncModal(true)} externalShowModal={showSyncModal} onSetShowModal={setShowSyncModal} />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Moderno */}
        <nav className={`
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed lg:static top-0 lg:top-auto z-50 w-72 h-screen lg:h-[calc(100vh-80px)] bg-white shadow-2xl lg:shadow-none transition-transform duration-500 ease-out
          lg:translate-x-0 lg:w-64 xl:w-72 lg:border-r lg:border-slate-200 pt-[96px] lg:pt-0 flex flex-col
        `}>
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            
            <div className="space-y-3">
              <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Principal</p>
              <div className="space-y-1">
                {mainNav.map(item => <NavItem key={item.to} item={item} onClick={() => setMenuOpen(false)} />)}
              </div>
            </div>

            <div className="space-y-3">
              <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Operaciones</p>
              <div className="space-y-1">
                {operationsNav.map(item => <NavItem key={item.to} item={item} onClick={() => setMenuOpen(false)} />)}
              </div>
            </div>

            <div className="space-y-3">
              <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Administración</p>
              <div className="space-y-1">
                {adminNav.map(item => <NavItem key={item.to} item={item} onClick={() => setMenuOpen(false)} />)}
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 pb-28 lg:pb-6">
            <div className="flex flex-col gap-3">
              {showInstallBtn && (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-agri-600 text-white shadow-xl shadow-agri-600/20 hover:bg-agri-700 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Instalar Aplicación</span>
                </button>
              )}

              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
              
              <div className="mt-2 flex justify-center">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] bg-slate-100 px-3 py-1 rounded-full">Agricore v1.3.1</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Overlay Blur Mobile */}
        {menuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-500"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Contenido Principal */}
        <main className="flex-1 overflow-y-auto w-full p-4 lg:p-10 bg-gray-50/50 pb-24 lg:pb-10">
          <Outlet />
        </main>

        {/* Bottom Nav (Mobile Only) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-2xl border-t border-gray-100 z-40 px-6 pb-2">
          <div className="flex justify-between items-center h-full max-w-lg mx-auto">
            {mobileNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1.5 px-3 transition-all relative ${
                    isActive ? 'text-agri-600' : 'text-gray-400 hover:text-gray-600'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-agri-50 scale-110' : ''}`}>
                      {item.icon}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute -top-1 w-1 h-1 rounded-full bg-agri-600 animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
            <button 
              onClick={() => setMenuOpen(true)}
              className="flex flex-col items-center justify-center gap-1.5 px-3 text-gray-400"
            >
              <div className="p-1 rounded-xl">
                <Menu className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">Menú</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay for missing season */}
      {(!activeSeasonId || temporadas.length === 0) && (
        <MissingSeasonOverlay addTemporada={state.addTemporada} temporadas={temporadas} />
      )}

      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default MainLayout;

// Interactive Overlay Component
const MissingSeasonOverlay = ({ addTemporada, temporadas }: { addTemporada: any, temporadas: any[] }) => {
  const [step, setStep] = useState<'prompt' | 'create'>(temporadas.length === 0 ? 'prompt' : 'prompt'); // Always start with branded prompt
  const [name, setName] = useState(`Temporada ${new Date().getFullYear()}`);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addTemporada({ nombre: name, activa: true });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md transition-all duration-700">
      <div className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-500">
        <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-agri-100/50 overflow-hidden">
          <div className="p-10 text-center space-y-8">
            {/* Visual Icon */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-agri-50 to-agri-100 rounded-3xl flex items-center justify-center text-agri-600 relative">
               <div className="absolute inset-0 bg-agri-500/10 rounded-3xl animate-pulse" />
               <Calendar className="w-10 h-10 relative z-10" />
               <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-watermelon-500 rounded-2xl flex items-center justify-center text-white border-4 border-white transition-transform hover:scale-110">
                  <Plus className="w-4 h-4" />
               </div>
            </div>

            {step === 'prompt' ? (
              <>
                <div className="space-y-3">
                  <h2 className="text-3xl font-display text-agri-900 leading-tight">
                    Ciclo Agrícola <br/> No Seleccionado
                  </h2>
                  <p className="text-agri-400 text-sm font-medium leading-relaxed px-4 italic">
                    Para comenzar a registrar tus operaciones, necesitas inicializar una temporada de cosecha.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setStep('create')}
                    className="group bg-agri-600 hover:bg-agri-700 text-white w-full py-4 rounded-2xl shadow-xl shadow-agri-600/20 font-bold text-sm tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    CONFIGURAR AHORA
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleCreate} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 text-left">
                <div className="space-y-3">
                  <h2 className="text-2xl font-display text-agri-900 leading-tight text-center">
                    Nueva Temporada
                  </h2>
                  <div className="space-y-2 pt-2">
                    <label className="font-display text-[10px] font-black uppercase tracking-widest text-agri-900/40 ml-1">Nombre del Ciclo</label>
                    <input 
                      autoFocus
                      required
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-agri-50 border border-agri-100 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-agri-500/10 outline-none font-bold text-agri-900 transition-all shadow-inner"
                      placeholder="Ej: Temporada 2025"
                    />
                  </div>
                  <p className="text-[10px] text-agri-400 text-center font-medium opacity-60">Esto activará el ciclo automáticamente para tus registros.</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('prompt')}
                    className="flex-1 bg-white border border-agri-100 text-agri-400 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-agri-600 hover:bg-agri-700 text-white py-4 rounded-2xl shadow-xl shadow-agri-600/20 font-bold text-xs tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    CREAR Y ACTIVAR
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Decorative accent */}
          <div className="h-2 bg-gradient-to-r from-agri-500 via-agri-400 to-watermelon-400" />
        </div>
        
        <p className="mt-8 text-center text-agri-300 text-[10px] font-bold tracking-widest uppercase">
          AgriCore Enterprise System
        </p>
      </div>
    </div>
  );
};
