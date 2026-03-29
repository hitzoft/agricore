import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Truck, Users, Receipt, Menu, X, BookOpen, Wallet, LogOut, Smartphone } from 'lucide-react';
import NetworkStatus from '../components/NetworkStatus';
import { useAuth } from '../context/AuthContext';
import LogoutModal from '../components/LogoutModal';

const MainLayout = () => {
  const { signOut, currentUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

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

  const navItems = [
    { to: '/inicio', icon: <Home className="w-5 h-5" />, label: 'Inicio' },
    { to: '/reportes', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Reportes' },
    { to: '/catalogos', icon: <BookOpen className="w-5 h-5" />, label: 'Catálogos' },
    { to: '/nomina', icon: <Users className="w-5 h-5" />, label: 'Nómina' },
    { to: '/ventas', icon: <Truck className="w-5 h-5" />, label: 'Ventas' },
    { to: '/gastos', icon: <Receipt className="w-5 h-5" />, label: 'Gastos' },
    { to: '/cxc', icon: <Wallet className="w-5 h-5" />, label: 'Cobranza' },
  ];

  const mobileNavItems = [
    { to: '/inicio', icon: <Home className="w-6 h-6" />, label: 'Inicio' },
    { to: '/ventas', icon: <Truck className="w-6 h-6" />, label: 'Ventas' },
    { to: '/gastos', icon: <Receipt className="w-6 h-6" />, label: 'Gastos' },
    { to: '/nomina', icon: <Users className="w-6 h-6" />, label: 'Nómina' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Mobile & Desktop */}
      <header className="bg-agri-700 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded-md hover:bg-agri-600 focus:outline-none lg:hidden">
            {menuOpen ? <X /> : <Menu />}
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full shadow-2xl border-4 border-agri-600/20 shrink-0 group transition-all hover:scale-105 duration-300 overflow-hidden flex items-center justify-center">
               <img src="/logo.png" alt="Agricore Logo" className="w-full h-full object-cover scale-[2.5]" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-display tracking-tight leading-none text-white">Agricore</h1>
              <span className="text-agri-100 font-semibold text-[9px] uppercase tracking-[0.2em] hidden sm:block mt-1 opacity-80">Sistema Integral de Gestión Agrícola</span>
            </div>
          </div>
        </div>
        <NetworkStatus />
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Desktop & Mobile */}
        <nav className={`
          ${menuOpen ? 'translate-x-0' : '-translate-x-full'} 
          fixed lg:static z-50 w-64 h-[calc(100vh-72px)] bg-white shadow-xl transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:w-48 xl:w-64 lg:border-r lg:border-gray-200
        `}>
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-agri-50 text-agri-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium text-sm lg:text-xs xl:text-sm">{item.label}</span>
              </NavLink>
            ))}
          </div>
          
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50/50 pb-24 lg:pb-4">
            <div className="mb-4 px-2">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Usuario</p>
                <span className="text-[8px] font-bold text-agri-400 bg-agri-100 px-1.5 py-0.5 rounded uppercase font-display">v1.2.1</span>
              </div>
              <p className="text-[10px] font-bold text-agri-600 truncate mb-0.5">{currentUser?.email}</p>
            </div>

            {showInstallBtn && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl bg-agri-600 text-white shadow-lg shadow-agri-600/20 hover:bg-agri-700 transition-all font-bold text-[10px] uppercase tracking-widest mb-3 group"
              >
                <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Instalar App</span>
              </button>
            )}


            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors font-black text-[10px] uppercase tracking-widest"
            >
              <LogOut className="w-5 h-5" />
              <span>Salir</span>
            </button>
          </div>
        </nav>

        {/* Overlay para cerrar menu en movil */}
        {menuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
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

      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default MainLayout;
