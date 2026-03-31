import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Smartphone, Globe, ShieldCheck, 
  Loader2, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../store/useStore';

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

const Configuracion = () => {
  const { userMetadata, currentUser } = useAuth();
  const addToast = useStore(state => state.addToast);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'form'>('dashboard');

  // Form states
  const [formData, setFormData] = useState({
    empresa: '',
    telefono: '',
    ubicacion: 'México',
    prefijo: '+52'
  });

  // Sync form with userMetadata when component mounts or userMetadata changes
  useEffect(() => {
    if (userMetadata) {
      // Parse phone if possible
      let phoneNum = userMetadata.telefono || '';
      let activePrefix = '+52';
      
      for (const c of countriesInfo) {
        if (phoneNum.startsWith(c.code)) {
          activePrefix = c.code;
          phoneNum = phoneNum.replace(c.code, '').trim();
          break;
        }
      }

      setFormData({
        empresa: userMetadata.empresa || '',
        telefono: phoneNum,
        ubicacion: userMetadata.ubicacion || 'México',
        prefijo: activePrefix
      });
      setIsInitializing(false);
    }
  }, [userMetadata]);

  const handleCountryChange = (countryName: string) => {
    const country = countriesInfo.find(c => c.name === countryName);
    if (country) {
      setFormData(prev => ({
        ...prev, 
        ubicacion: countryName,
        prefijo: country.code
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.empresa.trim()) {
      addToast("El nombre de la empresa es obligatorio", "error");
      return;
    }

    setLoading(true);
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db: firestoreDb } = await import('../lib/firebase');
      
      const userRef = doc(firestoreDb, 'users', currentUser!.uid);
      const updateData = {
        empresa: formData.empresa,
        telefono: `${formData.prefijo}${formData.telefono}`,
        ubicacion: formData.ubicacion,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(userRef, updateData);

      // Update local metadata manually
      if (userMetadata) {
        Object.assign(userMetadata, updateData);
      }

      setIsSuccess(true);
      addToast("Configuración guardada correctamente", "success");
      
      setTimeout(() => {
        setIsSuccess(false);
        setCurrentView('dashboard');
      }, 2000);
    } catch (error) {
      console.error("Error updating business settings:", error);
      addToast("Error al guardar los cambios", "error");
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-slate-50/30 dark:bg-slate-950/30 animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Cargando Configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20 px-4 md:px-8">
      
      {/* Header Dinámico */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          {currentView !== 'dashboard' && (
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 group/back"
            >
              <ArrowLeft className="w-5 h-5 group-hover/back:-translate-x-1 transition-transform" />
            </button>
          )}
          <div className="space-y-1">
            <h1 className="title-primary text-5xl md:text-6xl leading-none">
              Configuración
            </h1>
            <p className="subtitle-secondary !text-[10px] md:!text-xs !dark:text-white">
              {currentView === 'dashboard' ? 'Gestión de identidad y datos del negocio' : 'Actualiza la información oficial de tu empresa'}
            </p>
          </div>
        </div>
      </div>

      {/* DASHBOARD VIEW */}
      {currentView === 'dashboard' && (
        <div className="max-w-xl mx-auto">
           <button 
             onClick={() => setCurrentView('form')}
             className="w-full group bg-emerald-600 p-12 rounded-[4rem] text-white text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-600/30 flex flex-col justify-between h-80 relative overflow-hidden active:scale-95"
           >
              <div className="absolute right-[-20%] top-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform shadow-xl">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="text-4xl font-display leading-tight mb-3">Datos de la<br/><span className="italic">Empresa</span></h3>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Nombre, país y contacto
                </p>
              </div>
           </button>
        </div>
      )}

      {/* FORM VIEW */}
      {currentView === 'form' && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-500">
               <div className="bg-emerald-600 px-10 py-6 text-white relative">
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-2xl blur-xl" />
                  <h2 className="text-2xl font-display italic leading-none">Editar Perfil</h2>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.25em] mt-2">Identidad Corporativa</p>
               </div>

               <form onSubmit={handleSave} className="p-8 space-y-6">
                 <div className="space-y-1.5">
                   <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Nombre de la Empresa</label>
                   <div className="relative group">
                     <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 group-focus-within:text-emerald-600" />
                     <input 
                       disabled={loading}
                       type="text" 
                       value={formData.empresa}
                       onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                       className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                       placeholder="Nombre oficial..."
                     />
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">País de Operación</label>
                      <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                        <select 
                          disabled={loading}
                          value={formData.ubicacion}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none appearance-none cursor-pointer"
                        >
                          {countriesInfo.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Teléfono</label>
                      <div className="flex gap-3">
                        <div className="shrink-0 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-[10px] text-emerald-600">
                          {formData.prefijo}
                        </div>
                        <div className="relative group flex-1">
                          <input 
                            disabled={loading}
                            type="tel" 
                            value={formData.telefono}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').substring(0, 10);
                              setFormData({...formData, telefono: val});
                            }}
                            className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 dark:text-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                            placeholder="10 dígitos"
                          />
                        </div>
                      </div>
                    </div>
                 </div>

                 <div className="flex gap-3 pt-6 border-t border-slate-50 dark:border-slate-800">
                   <button 
                     type="button" 
                     onClick={() => setCurrentView('dashboard')}
                     className="flex-1 px-6 py-4 border border-slate-100 dark:border-slate-800 text-slate-400 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                   >
                     Cancelar
                   </button>
                   <button 
                     disabled={loading || isSuccess}
                     type="submit" 
                     className={`flex-[2] text-white rounded-2xl py-4 font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                       isSuccess ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700'
                     }`}
                   >
                     {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isSuccess ? '¡Guardado!' : 'Guardar Cambios'}
                   </button>
                 </div>
               </form>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6 animate-in slide-in-from-right-6 duration-500">
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
               <div className="space-y-6">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <ShieldCheck className="w-6 h-6 text-emerald-400" />
                 </div>
                 <div>
                   <h3 className="text-xl font-display italic mb-2 tracking-tight">Seguridad</h3>
                   <p className="text-white/40 text-[10px] font-bold leading-relaxed">
                     Toda la información se cifra y utiliza solo para personalizar tus documentos oficiales en Agricore.
                   </p>
                 </div>
               </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[3rem] border border-amber-100 dark:border-amber-900/50 space-y-3">
               <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Información Crítica</span>
               </div>
               <p className="text-[10px] text-amber-800 dark:text-amber-300 font-bold leading-relaxed italic">
                  "Los datos del negocio aparecerán en recibos de nómina y folios de venta oficiales."
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
