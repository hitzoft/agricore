import { useEffect } from 'react';
import { 
  BarChart3, 
  Wallet, 
  HardHat, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Smartphone 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] selection:bg-agri-100 selection:text-agri-900">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-0.5 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden">
              <img src="/favicon.png" alt="Agricore Logo" className="w-10 h-10 md:w-11 md:h-11 object-cover" />
            </div>
            <span className="text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white">
              Agri<span className="text-agri-600">core</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-6 py-2.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-agri-600 dark:hover:text-agri-400 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <a 
              href="#pricing" 
              className="bg-agri-600 hover:bg-agri-700 text-white px-6 py-2.5 rounded-2xl shadow-xl shadow-agri-600/20 font-bold text-sm transition-all active:scale-95"
            >
              Ver Planes
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-agri-50 dark:bg-agri-900/30 rounded-full border border-agri-100 dark:border-agri-800 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-4 h-4 text-agri-600" />
            <span className="text-xs font-black uppercase tracking-widest text-agri-700 dark:text-agri-400">Versión 2.0 ya disponible</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-black tracking-tight text-slate-900 dark:text-white mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            El control total de tu <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-agri-600 to-emerald-500">operación agrícola.</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            Gestiona nóminas, ventas, cobranza y reportes financieros desde una sola plataforma premium. Diseñada para productores que buscan eficiencia real.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
            <a 
              href="#pricing" 
              className="w-full sm:w-auto bg-agri-600 hover:bg-agri-700 text-white px-10 py-5 rounded-[2rem] shadow-2xl shadow-agri-600/30 font-black text-lg flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95"
            >
              Ver Planes de Gestión <ArrowRight className="w-5 h-5" />
            </a>
            <a 
               href="#features"
               className="w-full sm:w-auto px-10 py-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-lg hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              Ver características
            </a>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof (Simplified) */}
      <section className="py-20 bg-white dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
               { label: 'Productores', val: '100+' },
               { label: 'Hectáreas', val: '5k+' },
               { label: 'Nóminas pagadas', val: '10k+' },
               { label: 'Disponibilidad', val: '99.9%' }
            ].map(s => (
               <div key={s.label}>
                  <p className="text-4xl font-display font-black text-agri-600 mb-1">{s.val}</p>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">{s.label}</p>
               </div>
            ))}
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-4">Todo lo que necesitas para crecer</h2>
            <p className="text-slate-500 dark:text-slate-400">Un ecosistema completo diseñado para la realidad del campo.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Nóminas Inteligentes', 
                desc: 'Cálculo automático de rayas semanales, pagos a cabos y control de asistencia por cuadrilla.',
                icon: HardHat,
                color: 'bg-orange-500'
              },
              { 
                title: 'Control de Ventas', 
                desc: 'Seguimiento de folios, destinos y precios pactados con facturación y cobranza integrada.',
                icon: BarChart3,
                color: 'bg-agri-600'
              },
              { 
                title: 'Gestión de Cobranza', 
                desc: 'Monitorea saldos pendientes y abonos históricos para mantener tu flujo de caja saludable.',
                icon: Wallet,
                color: 'bg-blue-500'
              },
              { 
                title: 'Análisis de Gastos', 
                desc: 'Clasifica tus egresos por huerta y tipo de insumo para entender tu rentabilidad real.',
                icon: Zap,
                color: 'bg-emerald-500'
              },
              { 
                title: 'Modo Offline', 
                desc: 'Sigue trabajando aunque no tengas internet en el campo. Los datos se sincronizan al conectar.',
                icon: Smartphone,
                color: 'bg-indigo-500'
              },
              { 
                title: 'Seguridad Total', 
                desc: 'Tus datos están protegidos y respaldados en la nube con tecnología de grado bancario.',
                icon: ShieldCheck,
                color: 'bg-slate-700'
              }
            ].map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 hover:border-agri-200 dark:hover:border-agri-500/50 transition-all group">
                <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-4">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-slate-100 dark:bg-slate-900/30">
         <div className="max-w-5xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-display font-black text-slate-900 dark:text-white mb-4">Planes diseñados para tu escala</h2>
            <p className="text-slate-500 font-medium">Todos los planes incluyen un periodo de prueba de <span className="text-agri-600 font-black">15 días gratis</span>, sin compromiso.</p>
         </div>

         <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Monthly */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 relative z-10 transition-all hover:scale-[1.02]">
               <div className="mb-8">
                  <p className="text-xs font-black uppercase tracking-widest text-agri-600 mb-2">Mensual</p>
                  <div className="flex items-baseline gap-1">
                     <span className="text-5xl font-display font-black text-slate-900 dark:text-white">$0</span>
                     <span className="text-slate-400 text-sm">MXN/mes</span>
                  </div>
               </div>
               <ul className="space-y-4 mb-10">
                  {['Todos los módulos incluidos', 'Soporte vía WhatsApp', 'Actualizaciones gratis', 'Hasta 2 huertas'].map(li => (
                     <li key={li} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-agri-600" /> {li}
                     </li>
                  ))}
               </ul>
               <Link 
                  to="/login"
                  className="block w-full text-center py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
               >
                  Probar 15 días gratis
               </Link>
            </div>

            {/* Annual */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-2 border-agri-600 relative overflow-hidden transition-all hover:scale-[1.02]">
               <div className="absolute top-4 right-4 bg-agri-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Ahorra 20%</div>
               <div className="mb-8">
                  <p className="text-xs font-black uppercase tracking-widest text-agri-600 mb-2">Anual</p>
                  <div className="flex items-baseline gap-1">
                     <span className="text-5xl font-display font-black text-slate-900 dark:text-white">$1</span>
                     <span className="text-slate-400 text-sm">MXN/año</span>
                  </div>
               </div>
               <ul className="space-y-4 mb-10">
                  {['Todo lo del plan mensual', 'Soporte prioritario 24/7', 'Huertas ilimitadas', 'Exportación masiva de datos'].map(li => (
                     <li key={li} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-agri-600" /> {li}
                     </li>
                  ))}
               </ul>
               <Link 
                  to="/login"
                  className="block w-full text-center py-4 bg-agri-600 text-white rounded-2xl font-bold shadow-xl shadow-agri-600/30 hover:bg-agri-700 transition-all"
               >
                  Inicia con Plan Anual
               </Link>
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-agri-600">
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-8">¿Listo para llevar tu campo al siguiente nivel?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <button className="text-white font-bold text-lg flex items-center gap-2 hover:opacity-80 transition-opacity">
                  Hablar con un experto <ArrowRight className="w-5 h-5" />
               </button>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
               <div className="bg-white p-0.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <img src="/favicon.png" alt="Agricore Logo" className="w-8 h-8 object-cover" />
               </div>
               <span className="text-xl font-display font-black tracking-tight text-slate-900 dark:text-white">
                  Agri<span className="text-agri-600">core</span>
               </span>
            </div>
            <p className="text-slate-400 text-xs font-medium">© 2026 Agricore Systems. Todos los derechos reservados. Desarrollado para la industria agrícola mexicana.</p>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
