import { useState, useEffect, useMemo } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Truck, Users, Receipt, Menu, X, BookOpen, Wallet, LogOut, Smartphone, User, WifiOff, CloudOff, Calendar, ChevronDown, CheckCircle2, Send, Settings, Sun, Moon, Shield, Clock, Zap } from 'lucide-react';
import NetworkStatus from '../components/NetworkStatus';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import LogoutModal from '../components/LogoutModal';

const MainLayout = () => {
  const { signOut, currentUser, isAdmin, userMetadata } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'mensual' | 'anual'>('mensual');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [seasonDropdownOpen, setSeasonDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOpenSub = () => setShowSubscriptionModal(true);
    window.addEventListener('open-subscription-modal', handleOpenSub);
    return () => window.removeEventListener('open-subscription-modal', handleOpenSub);
  }, []);

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

  const { activeSeasonId, setActiveSeason, temporadas, darkMode, toggleDarkMode } = state;

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

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
      if (temporadas.length > 0 && !activeSeasonId) {
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
    window.location.href = '/';
  };

  const mainNav = [
    { to: '/dashboard/inicio', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
    { to: '/dashboard/reportes', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Reportes' },
  ];

  const operationsNav = [
    { to: '/dashboard/ventas', icon: <Truck className="w-5 h-5" />, label: 'Ventas' },
    { to: '/dashboard/gastos', icon: <Receipt className="w-5 h-5" />, label: 'Gastos' },
    { to: '/dashboard/cxc', icon: <Wallet className="w-5 h-5" />, label: 'Cobranza' },
    { to: '/dashboard/nomina', icon: <Users className="w-5 h-5" />, label: 'Nómina' },
  ];

  const adminNav = [
    { to: '/dashboard/catalogos', icon: <BookOpen className="w-5 h-5" />, label: 'Catálogos' },
    { to: '/dashboard/configuracion', icon: <Settings className="w-5 h-5" />, label: 'Configuración' },
  ];

  const mobileNavItems = [
    { to: '/dashboard/inicio', icon: <Home className="w-6 h-6" />, label: 'Inicio' },
    { to: '/dashboard/ventas', icon: <Truck className="w-6 h-6" />, label: 'Ventas' },
    { to: '/dashboard/gastos', icon: <Receipt className="w-6 h-6" />, label: 'Gastos' },
    { to: '/dashboard/nomina', icon: <Users className="w-6 h-6" />, label: 'Nómina' },
    { to: '/dashboard/configuracion', icon: <Settings className="w-6 h-6" />, label: 'Configuración' },
  ];

  const NavItem = ({ item, onClick }: { item: any, onClick: () => void }) => {
    const isLink = !!item.to;
    
    const baseStyle = "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group";
    const activeStyle = "bg-agri-600 text-white shadow-lg shadow-agri-600/20 font-bold translate-x-1";
    const inactiveStyle = "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white";

    if (isLink) {
      return (
        <NavLink
          to={item.to}
          onClick={onClick}
          className={({ isActive }) => `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`}
        >
          <div className="shrink-0 group-hover:scale-110 transition-transform duration-300">
            {item.icon}
          </div>
          <span className="text-sm tracking-tight">{item.label}</span>
        </NavLink>
      );
    }

    return (
      <button
        onClick={item.onClick || onClick}
        className={`${baseStyle} ${inactiveStyle}`}
      >
        <div className="shrink-0 group-hover:scale-110 transition-transform duration-300">
          {item.icon}
        </div>
        <span className="text-sm tracking-tight">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header Premium Glassmorphism */}
      {/* Header Premium Glassmorphism */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-[60] px-4 py-2 md:px-6 shadow-sm transition-all duration-300">
        <div className="flex justify-between items-center max-w-full mx-auto w-full gap-4">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 active:scale-95 transition-all lg:hidden border border-slate-200/60 dark:border-slate-700 shadow-sm"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            <div className="flex items-center gap-2.5 md:gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl group transition-all hover:rotate-6 duration-500 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 p-0.5 overflow-hidden">
                 <img src="/favicon.png" alt="Agricore Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-lg md:text-xl font-display font-black tracking-tight leading-none bg-gradient-to-br from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-0.5">Agricore</h1>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                  <span className="text-slate-400 dark:text-slate-500 font-black text-[7px] md:text-[8px] uppercase tracking-[0.2em] leading-none">Sistema de Gestión Agrícola</span>
                </div>
              </div>
            </div>

            {/* Selector de Temporada Central (Custom Dropdown) */}
            <div id="tour-season" className="hidden md:flex flex-grow justify-center max-w-[240px] relative">
              <div 
                onClick={() => setSeasonDropdownOpen(!seasonDropdownOpen)}
                className="flex items-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-xl border-2 border-emerald-100 dark:border-emerald-900/50 transition-all group cursor-pointer shadow-sm active:scale-95 relative overflow-hidden w-full"
              >
                <div className="bg-emerald-500 p-2 rounded-lg text-white shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform pointer-events-none z-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                
                <div className="flex flex-col flex-1 pointer-events-none z-0">
                  <span className="text-[8px] font-black text-emerald-500 dark:text-emerald-400/80 uppercase tracking-[0.2em] leading-none mb-1">Ciclo Activo</span>
                  <div className="text-[11px] font-black text-emerald-900 dark:text-emerald-50 uppercase tracking-tight leading-none truncate pr-4">
                    {temporadas.find(t => t.id === activeSeasonId)?.nombre.substring(0, 18) || 'Seleccionar'}
                  </div>
                </div>

                <div className={`absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none transition-transform z-0 ${seasonDropdownOpen ? 'rotate-180' : 'group-hover:translate-y-[-40%]'}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Menu Desplegable Custom */}
              {seasonDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[100] animate-in zoom-in-95 duration-200 origin-top">
                  <div className="p-1.5 max-h-[300px] overflow-y-auto">
                    {temporadas.map((temp) => (
                      <button
                        key={temp.id}
                        onClick={() => {
                          setActiveSeason(temp.id);
                          setSeasonDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                          activeSeasonId === temp.id 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span className="truncate pr-2">{temp.nombre}</span>
                        {activeSeasonId === temp.id && (
                          <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Estado de Sincronización (Separado) */}
            <button
              id="tour-sync"
              onClick={() => setShowSyncModal(true)}
              className={`p-2.5 rounded-xl border transition-all shadow-sm active:scale-95 flex items-center gap-2 ${
                !isOnline 
                  ? 'bg-red-50 border-red-200 text-red-600' 
                  : totalPending > 0 
                    ? 'bg-orange-50 border-orange-200 text-orange-600' 
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              }`}
            >
              {!isOnline ? <WifiOff size={18} /> : totalPending > 0 ? <CloudOff size={18} /> : <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              {totalPending > 0 && <span className="text-[10px] font-black">{totalPending}</span>}
            </button>

            {/* Toggle Tema (NUEVO) */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-sm"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Perfil del Usuario (Suscripción) */}
            <div 
              id="tour-user"
              onClick={() => setShowSubscriptionModal(true)}
              className="flex items-center bg-slate-100/80 dark:bg-slate-800 rounded-xl p-1 pr-3 border border-slate-200/50 dark:border-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-all group relative cursor-pointer"
            >
               <div className="w-8 h-8 md:w-9 md:h-9 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-agri-600 transition-transform group-hover:scale-105 active:scale-95">
                  <User size={18} className="stroke-[2.5]" />
               </div>
               
               <div className="ml-2.5 hidden sm:flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase leading-none mb-0.5">Usuario</span>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-none truncate max-w-[100px]">
                    {(userMetadata?.nombre || currentUser?.displayName || currentUser?.email?.split('@')[0])?.split(' ').slice(0, 2).join(' ')}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Moderno */}
        <nav className={`
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed lg:static top-0 lg:top-auto z-50 w-72 h-screen lg:h-[calc(100vh-80px)] bg-white dark:bg-slate-900 shadow-2xl lg:shadow-none transition-transform duration-500 ease-out
          lg:translate-x-0 lg:w-64 xl:w-72 lg:border-r lg:border-slate-200 dark:lg:border-slate-800 pt-[96px] lg:pt-0 flex flex-col
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

            <div id="tour-admin" className="space-y-3">
              <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Administración</p>
              <div className="space-y-1">
                {adminNav.map(item => <NavItem key={item.to} item={item} onClick={() => setMenuOpen(false)} />)}
                {isAdmin && (
                  <NavItem 
                    item={{ to: '/dashboard/admin', icon: <Shield className="w-5 h-5" />, label: 'Suscripciones' }} 
                    onClick={() => setMenuOpen(false)} 
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 pb-28 lg:pb-6">
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
                className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 hover:border-red-100 dark:hover:border-red-900/50 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
              
              <div className="mt-2 flex justify-center">
                <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em] bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-center">Agricore v1.3.1</span>
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
        <main className="flex-1 overflow-y-auto w-full p-4 lg:p-10 bg-white/50 dark:bg-slate-950/50 pb-24 lg:pb-10">
          <Outlet />
        </main>

        {/* Bottom Nav (Mobile Only) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-gray-100 dark:border-slate-800 z-40 px-6 pb-2">
          <div className="flex justify-between items-center h-full max-w-lg mx-auto">
            {mobileNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1.5 px-3 transition-all relative ${
                    isActive ? 'text-agri-600' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-agri-50 dark:bg-agri-950 scale-110' : ''}`}>
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
              className="flex flex-col items-center justify-center gap-1.5 px-3 text-gray-400 dark:text-slate-500"
            >
              <div className="p-1 rounded-xl">
                <Menu className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">Menú</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay for missing season - Controlled initialization */}
      {temporadas.length === 0 && (
        <MissingSeasonOverlay addTemporada={state.addTemporada} />
      )}


      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />

      {/* Gestor de Sincronización Global */}
      <NetworkStatus 
        showButton={false} 
        onOpenModal={() => setShowSyncModal(true)} 
        externalShowModal={showSyncModal} 
        onSetShowModal={setShowSyncModal} 
      />

      {/* Modal de Detalles de Suscripción */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
            <div className="p-6 bg-gradient-to-br from-agri-600 to-agri-700 text-white relative">
              <button 
                onClick={() => setShowSubscriptionModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-display font-black leading-tight">Tu Suscripción</h3>
              <p className="text-agri-100 text-xs mt-1 opacity-90">Gestiona tu acceso y facturación.</p>
            </div>

            <div className="p-8 space-y-6">
              {/* Plan Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan Actual</p>
                  <p className="font-bold text-agri-600 dark:text-agri-400 capitalize">
                    {userMetadata?.planType || 'Prueba'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="font-bold text-slate-800 dark:text-white">Activo</p>
                  </div>
                </div>
              </div>

              {/* Billing Date */}
              <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-agri-100 dark:bg-agri-900/30 rounded-xl flex items-center justify-center text-agri-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Próximo Cobro</p>
                    <p className="font-bold text-slate-800 dark:text-white">
                      {userMetadata?.nextBillingDate ? new Date(userMetadata.nextBillingDate).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Pendiente'}
                    </p>
                  </div>
                </div>
              </div>


              {/* Plan Selection */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cambiar o Renovar Plan</p>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => setSelectedPlan('mensual')}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                      selectedPlan === 'mensual' 
                        ? 'border-agri-600 bg-agri-50 dark:bg-agri-950/30' 
                        : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPlan === 'mensual' ? 'bg-agri-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className={`font-bold leading-none ${selectedPlan === 'mensual' ? 'text-agri-600 dark:text-agri-400' : 'text-slate-800 dark:text-white'}`}>Plan Mensual</p>
                        <p className="text-[10px] font-medium text-slate-500 mt-1">$0 MXN / mes</p>
                      </div>
                    </div>
                    {selectedPlan === 'mensual' && <CheckCircle2 className="w-5 h-5 text-agri-600" />}
                  </button>

                  <button 
                    onClick={() => setSelectedPlan('anual')}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between group relative overflow-hidden ${
                      selectedPlan === 'anual' 
                        ? 'border-agri-600 bg-agri-50 dark:bg-agri-950/30' 
                        : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPlan === 'anual' ? 'bg-agri-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <p className={`font-bold leading-none ${selectedPlan === 'anual' ? 'text-agri-600 dark:text-agri-400' : 'text-slate-800 dark:text-white'}`}>Plan Anual</p>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 mt-1">$1 MXN / año</p>
                      </div>
                    </div>
                    {selectedPlan === 'anual' && <CheckCircle2 className="w-5 h-5 text-agri-600" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => {
                    setShowSubscriptionModal(false);
                    const event = new CustomEvent('open-payment-modal', { 
                      detail: { plan: selectedPlan } 
                    });
                    window.dispatchEvent(event);
                  }}
                  className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95"
                >
                  <Send className="w-4 h-4 text-agri-400" /> Obtener Datos para {selectedPlan === 'mensual' ? 'Mensual' : 'Anual'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Componente para creación controlada de la primera temporada
const MissingSeasonOverlay = ({ addTemporada }: { addTemporada: any }) => {
  const [name, setName] = useState(`Temporada ${new Date().getFullYear()}`);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    addTemporada({ nombre: name, activa: true });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10 text-center space-y-8">
          <div className="mx-auto w-30 h-30 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-slate-100 dark:border-slate-800 p-1 overflow-hidden">
            <img src="/favicon.png" alt="Agricore Logo" className="w-full h-full object-cover" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white leading-tight">
              Configura tu <span className="text-agri-600">Primer Ciclo</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Necesitas definir una temporada o ciclo agrícola para comenzar a registrar datos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Nombre del Ciclo / Temporada
              </label>
              <input 
                required
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-agri-500 outline-none transition-all shadow-sm text-slate-900 dark:text-white"
                placeholder="Ej: Temporada Berries 2026"
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-agri-600 hover:bg-agri-700 text-white py-5 rounded-2xl shadow-xl shadow-agri-600/20 font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Comenzar Ahora'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

