import React, { useState, useEffect } from 'react';
import { 
  Building2, Phone, MapPin, Calendar, ArrowRight, ArrowLeft, 
  CheckCircle2, Rocket, Stars, Sparkles, Shield, 
  Users, Zap, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const countriesInfo = [
  { name: 'México', code: '+52' },
  { name: 'Estados Unidos', code: '+1' },
  { name: 'Canadá', code: '+1' },
  { name: 'Guatemala', code: '+502' },
  { name: 'Honduras', code: '+504' },
  { name: 'El Salvador', code: '+503' },
  { name: 'Costa Rica', code: '+506' },
  { name: 'Panamá', code: '+507' },
  { name: 'Colombia', code: '+57' },
  { name: 'Perú', code: '+51' },
  { name: 'Chile', code: '+56' },
  { name: 'Argentina', code: '+54' },
  { name: 'España', code: '+34' }
];

const InitialSetup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userMetadata, currentUser } = useAuth();
  const [step, setStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const addToast = useStore(state => state.addToast);
  const addTemporada = useStore(state => state.addTemporada);
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    empresa: '',
    telefono: '',
    ubicacion: 'México',
    prefijo: '+52',
    temporada: `Temporada ${new Date().getFullYear()}`
  });

  // Update prefix when country changes
  const handleCountryChange = (countryName: string) => {
    const country = countriesInfo.find(c => c.name === countryName);
    if (country) {
      setFormData({
        ...formData, 
        ubicacion: countryName,
        prefijo: country.code
      });
    }
  };

  // Tour states
  const [tourStep, setTourStep] = useState<number | null>(null);

  // Check if setup is needed
  const needsSetup = userMetadata && !userMetadata.setupCompleted && !isCompleted;

  const handleFinishSetup = async () => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db: firestoreDb } = await import('../lib/firebase');
      
      const userRef = doc(firestoreDb, 'users', currentUser!.uid);
      await updateDoc(userRef, {
        empresa: formData.empresa,
        telefono: `${formData.prefijo}${formData.telefono}`,
        ubicacion: formData.ubicacion,
        setupCompleted: true,
        updatedAt: new Date().toISOString()
      });

      // Update local metadata to prevent re-triggering setup screen
      if (userMetadata) {
        userMetadata.setupCompleted = true;
      }

      // Create initial season
      addTemporada({
        nombre: formData.temporada,
        activa: true
      });

      setIsCompleted(true);
      setTourStep(0); // Start tour after setup
      addToast("¡Configuración completada!", "success");
    } catch (error) {
      console.error("Error saving setup:", error);
      addToast("Error al guardar la configuración", "error");
    }
  };

  // Mini Tour Component
  const TourOverlay = () => {
    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
    
    useEffect(() => {
      if (tourStep !== null) {
        const tourData = [
          { id: 'tour-admin' },
          { id: 'tour-sync' },
          { id: 'tour-user' },
          { id: null }
        ];
        
        const targetId = tourData[tourStep].id;
        if (targetId) {
          const el = document.getElementById(targetId);
          if (el) {
            const rect = el.getBoundingClientRect();
            setSpotlightStyle({
              position: 'fixed',
              left: `${rect.left - 8}px`,
              top: `${rect.top - 8}px`,
              width: `${rect.width + 16}px`,
              height: `${rect.height + 16}px`,
              borderRadius: '1rem',
              boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45), 0 0 30px rgba(16, 185, 129, 0.5)',
              border: '4px solid #10b981',
              zIndex: 245,
              pointerEvents: 'none',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            });
            return;
          }
        }
        setSpotlightStyle({});
      }
    }, [tourStep]);

    if (tourStep === null) return null;

    const tourContents = [
      {
        title: "Administración",
        icon: <Users className="w-6 h-6 text-white" />,
        text: "Aquí encontrarás los Catálogos. Debes ingresar empleados, huertas y productos antes de empezar a registrar ventas o nóminas.",
        pos: "bottom-1/4 left-1/2 -translate-x-1/2"
      },
      {
        title: "Sincronización",
        icon: <Zap className="w-6 h-6 text-white" />,
        text: "Este indicador te muestra si tus datos están en la nube o si hay cambios pendientes por subir. ¡Agricore nunca se detiene!",
        pos: "top-24 right-24"
      },
      {
        title: "Tu Suscripción",
        icon: <Shield className="w-6 h-6 text-white" />,
        text: "Gestiona tu plan y acceso aquí. Tu seguridad y disponibilidad son nuestra prioridad.",
        pos: "top-24 right-12"
      },
      {
        title: "¡Todo Listo!",
        icon: <CheckCircle2 className="w-6 h-6 text-white" />,
        text: "Gracias por confiar en Agricore. Ya puedes comenzar a operar tu negocio agrícola.",
        pos: "center"
      }
    ];

    const currentTour = tourContents[tourStep];
    const isLast = tourStep === tourContents.length - 1;

    return (
      <div className="fixed inset-0 z-[250] flex items-center justify-center overflow-hidden">
         {/* Dynamic Spotlight */}
         {spotlightStyle.left && <div style={spotlightStyle} />}
         
         {/* Minimal Backdrop (The shadow from spotlight handles most of it) */}
         <div className="absolute inset-0 backdrop-blur-[1px] pointer-events-none" />

         <div className={`absolute ${currentTour.pos === 'center' ? '' : currentTour.pos} bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 w-full max-w-sm m-6 animate-in zoom-in-95 duration-300 z-[260]`}>
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
               {currentTour.icon}
            </div>
            <h4 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-2">{currentTour.title}</h4>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
              {currentTour.text}
            </p>
            <button 
              onClick={() => {
                if (isLast) {
                  setTourStep(null);
                  setTimeout(() => {
                    // Only navigate if we are during the initial setup flow
                    if (isCompleted) {
                      navigate('/dashboard/catalogos');
                    }
                  }, 100);
                } else {
                  setTourStep(tourStep + 1);
                }
              }}
              className="w-full py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isLast ? 'Ir a Catálogos' : 'Siguiente'} <ArrowRight className="w-5 h-5" />
            </button>
         </div>
      </div>
    );
  };

  // If tour is active, we MUST show the tour, regardless of userMetadata
  if (tourStep !== null) {
    return (
      <>
        <TourOverlay />
        {children}
      </>
    );
  }

  if (needsSetup) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-900 flex items-center justify-center p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-agri-500 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden flex flex-col md:min-h-[500px]">
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 flex gap-1 p-1">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-700'}`} 
              />
            ))}
          </div>

          <div className="flex-1 flex flex-col p-8 md:p-12">
            
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 relative">
                  <Stars className="w-10 h-10 animate-pulse" />
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-display font-black text-slate-900 dark:text-white leading-tight">
                    ¡Bienvenido a <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-agri-500">Agricore Cloud</span>!
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg max-w-sm mx-auto">
                    Estamos emocionados de ayudarte a digitalizar y potenciar tu campo. Vamos a configurar lo básico.
                  </p>
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className="w-full max-w-xs py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Comenzar Configuración <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 1: Company Info */}
            {step === 1 && (
              <div className="flex-1 flex flex-col space-y-7 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white">Sobre tu Empresa</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Estos datos se usarán para tus reportes e identificación.</p>
                </div>

                <div className="space-y-5">
                  {/* Row 1: Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Empresa</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" 
                        value={formData.empresa}
                        onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                        placeholder="Ej. Ranchos Unidos"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white focus:border-emerald-500 focus:ring-0 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Row 2: Country/Location */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">País del Agro-Negocio</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <select 
                        value={formData.ubicacion}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white focus:border-emerald-500 focus:ring-0 transition-all outline-none appearance-none cursor-pointer"
                      >
                        {countriesInfo.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                         <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Phone Contact */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono de Contacto</label>
                    <div className="flex gap-3">
                      {/* Read-only Prefix based on country selection */}
                      <div className="relative shrink-0 min-w-[80px]">
                        <div className="h-full px-4 flex items-center justify-center bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {formData.prefijo}
                        </div>
                      </div>

                      <div className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                          <Phone className="w-5 h-5" />
                        </div>
                        <input 
                          type="tel" 
                          value={formData.telefono}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                            setFormData({...formData, telefono: val});
                          }}
                          placeholder="Número a 10 dígitos"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white focus:border-emerald-500 focus:ring-0 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => setStep(0)}
                    className="px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!formData.empresa || !formData.telefono}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    Siguiente <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Season Info */}
            {step === 2 && (
              <div className="flex-1 flex flex-col space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white">Tu Primer Ciclo</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Organizamos todo por temporadas o ciclos agrícolas.</p>
                </div>

                <div className="p-8 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-3xl border-2 border-emerald-100 dark:border-emerald-500/20 space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <Calendar className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">Nombre Sugerido</p>
                        <h4 className="text-xl font-black text-emerald-900 dark:text-emerald-50">Temporada {new Date().getFullYear()}</h4>
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personalizar Nombre</label>
                      <input 
                        type="text" 
                        value={formData.temporada}
                        onChange={(e) => setFormData({...formData, temporada: e.target.value})}
                        className="w-full px-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white focus:border-emerald-500 focus:ring-0 transition-all outline-none"
                      />
                   </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleFinishSetup}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Finalizar Registro <Rocket className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TourOverlay />
      {children}
    </>
  );
};

export default InitialSetup;
