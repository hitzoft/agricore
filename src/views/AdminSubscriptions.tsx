import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Package
} from 'lucide-react';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';

const AdminSubscriptions = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeActions, setActiveActions] = useState<any | null>(null);
  const [blockingUser, setBlockingUser] = useState<any | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'trial' | 'active' | 'expired'>('all');
  const addToast = useStore(state => state.addToast);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // Use a simple query to avoid index requirements
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const allUsers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      // Filter out admins client-side
      setCustomers(allUsers.filter(u => u.role !== 'admin'));
    } catch (error) {
      console.error("Error fetching customers:", error);
      addToast("Error al cargar clientes", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleUpdateSubscription = async (userId: string, newStatus: string, resetTrial: boolean = false, plan: 'monthly' | 'annual' = 'monthly') => {
    setCustomers(prev => prev.map(c => c.id === userId ? { ...c, isUpdating: true } : c));
    setActiveActions(null); 
    try {
      const user = customers.find(c => c.id === userId);
      const userRef = doc(db, 'users', userId);
      const now = new Date();
      let nextBilling = new Date();
      
      if (resetTrial) {
        // Reset trial starts from today
        nextBilling.setDate(now.getDate() + 15);
      } else if (newStatus === 'expired') {
        // When blocking, we keep current date or set to past to ensure blockage
        nextBilling = user?.nextBillingDate ? new Date(user.nextBillingDate) : now;
        if (nextBilling > now) {
          nextBilling = now; // Force expire now
        }
      } else {
        // If they have a valid future expiration, add to that date. 
        // Otherwise, start from today.
        const currentExp = user?.nextBillingDate ? new Date(user.nextBillingDate) : null;
        const baseDate = (currentExp && currentExp > now) ? currentExp : now;
        
        nextBilling = new Date(baseDate);
        nextBilling.setDate(baseDate.getDate() + (plan === 'monthly' ? 30 : 365));
      }

      const updates: any = { 
        subscriptionStatus: newStatus,
        planType: plan,
        nextBillingDate: nextBilling.toISOString(),
        updatedAt: now.toISOString()
      };
      
      if (resetTrial) {
        updates.trialStartDate = now.toISOString();
      }

      await updateDoc(userRef, updates);
      addToast("Suscripción actualizada correctamente", "success");
      fetchCustomers(); // Refresh list
    } catch (error) {
      console.error("Error updating subscription:", error);
      addToast("Error al actualizar la suscripción", "error");
      setCustomers(prev => prev.map(c => c.id === userId ? { ...c, isUpdating: false } : c));
    }
  };

  const calculateTrialStatus = (startDate: string) => {
    if (!startDate) return { daysUsed: 0, daysLeft: 15, isExpired: false };
    const start = new Date(startDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const left = Math.max(0, 15 - days);
    return { daysUsed: days, daysLeft: left, isExpired: days >= 15 };
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'trial') return matchesSearch && (c.subscriptionStatus === 'trial' || !c.subscriptionStatus);
    if (statusFilter === 'active') return matchesSearch && c.subscriptionStatus === 'active';
    if (statusFilter === 'expired') {
      const status = calculateTrialStatus(c.trialStartDate);
      return matchesSearch && status.isExpired && c.subscriptionStatus !== 'active';
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-agri-600 dark:text-agri-400 mb-2">
             <ShieldCheck className="w-5 h-5" />
             <span className="label-tiny">Panel de Dueño</span>
             <div className="h-4 w-px bg-agri-200 dark:bg-slate-700 mx-1" />
             <span className="label-tiny !text-agri-400 dark:!text-slate-500">
               Control de Suscripciones
             </span>
          </div>
          <h1 className="title-primary text-5xl md:text-6xl">Clientes</h1>
          <p className="subtitle-secondary !text-sm max-w-lg">Monitoreo de usuarios registrados, estados de prueba y suscripciones activas.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-agri-100 dark:border-slate-800 flex items-center gap-3">
            <Users className="w-5 h-5 text-agri-600" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Clientes</p>
              <p className="text-xl font-display font-black text-slate-900 dark:text-white leading-none">{customers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'En Prueba', val: customers.filter(c => c.subscriptionStatus === 'trial' || !c.subscriptionStatus).length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
          { label: 'Suscriptores', val: customers.filter(c => c.subscriptionStatus === 'active').length, icon: CheckCircle2, color: 'text-agri-600', bg: 'bg-agri-50 dark:bg-agri-950/20' },
          { label: 'Expirados', val: customers.filter(c => {
               const status = calculateTrialStatus(c.trialStartDate);
               return status.isExpired && c.subscriptionStatus !== 'active';
             }).length, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' }
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
            <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}>
              <s.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-4xl font-display font-black text-slate-900 dark:text-white leading-none">{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-agri-600" />
            <input 
              placeholder="Buscar por nombre o correo..." 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 outline-none border border-transparent focus:border-agri-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className={`p-4 rounded-2xl transition-all ${statusFilter !== 'all' ? 'bg-agri-600 text-white' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-agri-600'}`}>
                <Filter className="w-5 h-5" />
              </button>
              {filterMenuOpen && (
                <div className="absolute right-0 top-full mt-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl z-50 min-w-[160px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'trial', label: 'En Prueba' },
                    { id: 'active', label: 'Suscritos' },
                    { id: 'expired', label: 'Expirados' },
                  ].map(f => (
                    <button 
                      key={f.id}
                      onClick={() => {
                        setStatusFilter(f.id as any);
                        setFilterMenuOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${statusFilter === f.id ? 'text-agri-600' : 'text-slate-500'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                fetchCustomers();
                addToast("Base de datos sincronizada", "success");
              }}
              disabled={isLoading}
              className="bg-agri-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-agri-600/20 active:scale-95 transition-transform disabled:opacity-50">
              {isLoading ? 'Sincronizando...' : 'Sync Firestore'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-b-[3rem]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Actual</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Próximo Cobro</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registro</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 font-bold italic">Cargando base de datos de clientes...</td>
                </tr>
              ) : filteredCustomers.map(c => {
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-agri-100 to-agri-50 dark:from-slate-800 dark:to-slate-900 border border-agri-100 dark:border-slate-700 flex items-center justify-center font-display font-black text-agri-600">
                          {c.displayName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{c.displayName || 'Sin nombre'}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-agri-50 dark:bg-agri-950/30 text-agri-700 dark:text-agri-400 border border-agri-100 dark:border-agri-900">
                        <Package className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {c.subscriptionStatus === 'active' 
                            ? (c.planType === 'annual' ? 'Plan Anual' : 'Plan Mensual') 
                            : 'Prueba Gratis'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <Clock className={`w-3 h-3 ${new Date(c.nextBillingDate) < new Date() ? 'text-red-500' : 'text-agri-600'}`} />
                           <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                             {c.nextBillingDate ? new Date(c.nextBillingDate).toLocaleDateString() : 'Pendiente'}
                           </span>
                        </div>
                        {c.nextBillingDate && (
                           <p className="text-[9px] font-bold text-slate-400">
                             En {Math.ceil((new Date(c.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días
                           </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-bold">{new Date(c.createdAt || c.trialStartDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {c.isUpdating ? (
                        <div className="w-5 h-5 border-2 border-agri-500 border-t-transparent rounded-full animate-spin ml-auto" />
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setActiveActions(c)}
                            className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 bg-agri-600 text-white rounded-xl hover:bg-agri-700 transition-all shadow-sm flex items-center gap-1"
                            title="Activar Suscripción"
                          >
                            Activar
                          </button>
                          <button 
                            onClick={() => handleUpdateSubscription(c.id, 'trial', true)}
                            className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                            title="Reiniciar 15 días"
                          >
                            Reiniciar
                          </button>
                          <button 
                            onClick={() => setBlockingUser(c)}
                            className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-100 dark:border-red-900"
                            title="Forzar Expiración"
                          >
                            Bloquear
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Activation Modal */}
      {activeActions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10 space-y-8">
              <div className="space-y-3 text-center">
                <div className="w-20 h-20 bg-agri-50 dark:bg-agri-950/30 text-agri-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-display font-black text-slate-900 dark:text-white leading-tight">Activar Suscripción</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Estás a punto de activar la cuenta de <span className="font-bold text-agri-600">{activeActions.displayName || 'este usuario'}</span>. Selecciona el plan correspondiente:
                </p>
              </div>

              <div className="grid gap-4">
                <button 
                  onClick={() => handleUpdateSubscription(activeActions.id, 'active', false, 'monthly')}
                  className="group relative flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 hover:bg-agri-50 dark:hover:bg-agri-950/20 border border-slate-100 dark:border-slate-800 rounded-3xl transition-all"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-agri-600 transition-colors">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-agri-500">Recurrente</p>
                      <h4 className="text-lg font-black text-slate-800 dark:text-slate-200">Plan Mensual</h4>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-agri-500 group-hover:bg-agri-500 flex items-center justify-center transition-all">
                    <CheckCircle2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </button>

                <button 
                  onClick={() => handleUpdateSubscription(activeActions.id, 'active', false, 'annual')}
                  className="group relative flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 hover:bg-agri-50 dark:hover:bg-agri-950/20 border border-slate-100 dark:border-slate-800 rounded-3xl transition-all"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm text-slate-400 group-hover:text-agri-600 transition-colors">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-agri-500">Preferente</p>
                        <span className="px-2 py-0.5 bg-agri-500 text-white text-[8px] font-black rounded-md uppercase">Ahorro</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-800 dark:text-slate-200">Plan Anual</h4>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-agri-500 group-hover:bg-agri-500 flex items-center justify-center transition-all">
                    <CheckCircle2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </button>
              </div>

              <button 
                onClick={() => setActiveActions(null)}
                className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
              >
                Cancelar y volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Blocking Confirmation Modal */}
      {blockingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-10 space-y-8 text-center">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-display font-black text-slate-900 dark:text-white leading-tight">¿Bloquear Acceso?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  El cliente <span className="font-bold text-red-500">{blockingUser.displayName}</span> no podrá utilizar la aplicación hasta que sea reactivado.
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    handleUpdateSubscription(blockingUser.id, 'expired');
                    setBlockingUser(null);
                  }}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95"
                >
                  Confirmar Bloqueo
                </button>
                <button 
                  onClick={() => setBlockingUser(null)}
                  className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
