import { useAuth } from '../context/AuthContext';
import { 
  Zap, ArrowRight, Leaf, CheckCircle2, Clock, 
  University, Check, Copy, X, Smartphone, ArrowLeft, Loader2, ShieldCheck, Stars
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isSubscribed, isBlocked, isExpired, isAdmin, loading, signOut, isBillingNear, daysUntilBilling } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const addToast = useStore(state => state.addToast);
  const [selectedPlan, setSelectedPlan] = useState<'mensual' | 'anual'>('mensual');
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    const handleOpenPayment = (e: any) => {
      if (e.detail?.plan) {
        setSelectedPlan(e.detail.plan);
      }
      setShowPaymentModal(true);
    };
    window.addEventListener('open-payment-modal', handleOpenPayment);
    return () => window.removeEventListener('open-payment-modal', handleOpenPayment);
  }, []);

  const copyClabe = () => {
    navigator.clipboard.writeText("0123 4567 8901 2345 67");
    setCopied(true);
    addToast("CLABE copiada", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !currentUser) return null;

  // Admins always have access
  if (isAdmin) return <>{children}</>;

  const PaymentInfoModal = () => (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
          <div className="p-6 bg-gradient-to-br from-agri-600 to-agri-700 text-white relative shrink-0">
             <button 
               onClick={() => setShowPaymentModal(false)}
               className="absolute top-4 right-4 p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
             >
                <X className="w-5 h-5" />
             </button>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                   <University className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-2xl font-display font-black leading-none">Datos de Pago</h3>
                   <p className="text-agri-100 text-xs font-bold mt-1 opacity-80 uppercase tracking-widest">
                     Plan {selectedPlan === 'mensual' ? 'Mensual' : 'Anual'} — {selectedPlan === 'mensual' ? '$0' : '$1'} MXN
                   </p>
                </div>
             </div>
          </div>

          <div className="p-8 space-y-6 overflow-y-auto">
             {/* Steps */}
             <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pasos para activar</p>
                <div className="grid grid-cols-1 gap-2">
                   <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="w-6 h-6 rounded-full bg-agri-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">1</div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Realiza la transferencia o depósito.</p>
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="w-6 h-6 rounded-full bg-agri-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">2</div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Toma una captura o foto del comprobante.</p>
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="w-6 h-6 rounded-full bg-agri-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">3</div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Envía el comprobante por WhatsApp.</p>
                   </div>
                </div>
             </div>

             {/* Bank Info */}
             <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Información Bancaria</p>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Banco</p>
                   <p className="font-bold text-slate-800 dark:text-white">BBVA México</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CLABE Interbancaria</p>
                      <p className="font-mono font-bold text-slate-800 dark:text-white tracking-wider">0123 4567 8901 2345 67</p>
                   </div>
                   <button 
                     onClick={copyClabe}
                     className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-agri-600 hover:scale-110 active:scale-95 transition-all border border-slate-100 dark:border-slate-700"
                   >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   </button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Beneficiario</p>
                   <p className="font-bold text-slate-800 dark:text-white">Agricore Solutions S.A.</p>
                </div>
             </div>

             <div className="pt-4 space-y-3 shrink-0">
                <a 
                  href="https://wa.me/521234567890?text=Hola,%20adjunto%20mi%20comprobante%20de%20pago%20de%20Agricore" 
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                   <Smartphone className="w-5 h-5" /> Enviar Comprobante por WhatsApp
                </a>
                
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                   <ArrowLeft className="w-4 h-4" /> Regresar y cambiar plan
                </button>

                <p className="text-[10px] text-center text-slate-400 font-medium px-4 leading-relaxed">
                   La activación manual puede tardar de 1 a 12 horas. Una vez validado, tu cuenta se habilitará automáticamente.
                </p>

                {/* ADMIN ACTIVATION BUTTON */}
                {isAdmin && (
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] space-y-4 border-2 border-dashed border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Panel de Control Admin</span>
                    </div>
                    <button 
                      disabled={activating}
                      onClick={async () => {
                        setActivating(true);
                        try {
                          const { doc, updateDoc } = await import('firebase/firestore');
                          const { db } = await import('../lib/firebase');
                          if (!currentUser) return;
                          const userRef = doc(db, 'users', currentUser.uid);
                          
                          const nextDate = new Date();
                          if (selectedPlan === 'mensual') {
                            nextDate.setDate(nextDate.getDate() + 30);
                          } else {
                            nextDate.setDate(nextDate.getDate() + 365);
                          }

                          await updateDoc(userRef, {
                            subscriptionStatus: 'active',
                            planType: selectedPlan,
                            nextBillingDate: nextDate.toISOString(),
                            onboardingCompleted: true,
                            setupCompleted: true,
                            updatedAt: new Date().toISOString()
                          });

                          addToast(`Suscripción ${selectedPlan} activada`, "success");
                          setShowPaymentModal(false);
                          setTimeout(() => window.location.reload(), 1500);
                        } catch (err) {
                          console.error(err);
                          addToast("Error al activar", "error");
                        } finally {
                          setActivating(false);
                        }
                      }}
                      className="w-full py-4 bg-slate-900 dark:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
                    >
                      {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stars className="w-4 h-4" />}
                      Activar Forzosamente ({selectedPlan})
                    </button>
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );

  if (isBlocked && !isSubscribed) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center py-12">
          {/* Info Side */}
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-agri-500/10 border border-agri-500/20 rounded-full text-agri-500 text-xs font-bold uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-current" />
              {isExpired ? 'Cuenta Bloqueada' : 'Prueba Finalizada'}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-display font-black text-white leading-tight">
                Lleva tu campo al <span className="text-agri-500">siguiente nivel.</span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl font-medium max-w-md leading-relaxed">
                Tu periodo de prueba ha terminado. Elige un plan para continuar digitalizando tu operación agrícola.
              </p>
            </div>

            <div className="space-y-4">
               <button 
                 onClick={signOut}
                 className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold text-sm"
               >
                 <ArrowLeft className="w-4 h-4" /> Cerrar Sesión
               </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-6 animate-in slide-in-from-right duration-700">
            {/* Monthly */}
            <div className="p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-white/10">
               <div className="relative z-10">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Plan Básico</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black dark:text-white">$0</span>
                    <span className="text-slate-500 font-bold">/mes</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Leaf className="w-4 h-4 text-agri-500" /> Renovación manual mensual
                    </li>
                  </ul>
                  <button 
                    onClick={() => {
                      setSelectedPlan('mensual');
                      setShowPaymentModal(true);
                    }}
                    className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                  >
                    Renovar Mensual
                  </button>
               </div>
            </div>

            {/* Annual */}
            <div className="p-8 bg-gradient-to-br from-agri-600 to-agri-700 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6">
                  <Zap className="w-8 h-8 text-white/20" />
               </div>
               <div className="relative z-10 text-white">
                  <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4 text-white">
                    Promocional
                  </div>
                  <p className="text-xs font-black text-agri-100 uppercase tracking-widest mb-4">Plan Profesional</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-white">$1</span>
                    <span className="text-agri-200 font-bold">/año</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-sm text-agri-100">
                      <CheckCircle2 className="w-4 h-4" /> Acceso total por 12 meses
                    </li>
                    <li className="flex items-center gap-2 text-sm text-agri-100">
                      <CheckCircle2 className="w-4 h-4" /> Soporte prioritario
                    </li>
                  </ul>
                  <button 
                    onClick={() => {
                      setSelectedPlan('anual');
                      setShowPaymentModal(true);
                    }}
                    className="w-full py-4 bg-white text-agri-600 rounded-2xl font-bold shadow-lg shadow-black/10 hover:bg-agri-50 transition-all"
                  >
                    Renovar Plan Anual
                  </button>
               </div>
            </div>
          </div>
        </div>
        {showPaymentModal && <PaymentInfoModal />}
      </div>
    );
  }

  return (
    <>
      {/* Billing Warning Banner */}
      {isBillingNear && isSubscribed && (
        <div className="sticky top-0 z-[90] bg-gradient-to-r from-orange-500 to-amber-500 p-1 shadow-lg animate-in slide-in-from-top duration-500">
           <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                 <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                    <Clock className="w-4 h-4" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest leading-none">Recordatorio de Pago</span>
                    <span className="text-[10px] font-bold opacity-90">Tu suscripción vence en {daysUntilBilling} {daysUntilBilling === 1 ? 'día' : 'días'}</span>
                 </div>
              </div>
              <button 
                onClick={() => {
                   window.dispatchEvent(new CustomEvent('open-subscription-modal'));
                }}
                className="px-6 py-2.5 bg-white text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 transition-colors shadow-sm"
              >
                 Ver Suscripción
              </button>
           </div>
        </div>
      )}
      {showPaymentModal && <PaymentInfoModal />}
      {children}
    </>
  );
};

export default SubscriptionGuard;
