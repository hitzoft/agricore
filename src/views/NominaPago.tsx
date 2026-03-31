import { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { 
  ChevronLeft, CircleDollarSign, Banknote, 
  CreditCard, Users, Calendar, ArrowLeft 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { PagoSelector } from '../components/PagoSelector';
import { getDatesFromWeek } from '../utils/dateUtils';

const NominaPago = () => {
  const { semana } = useParams<{ semana: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as any)?.from || '/dashboard/nomina';

  const {
    rayasSemanales,
    pagosNominaSemanal,
    actualizarPagosNominaSemanal,
    confirmarPagoNomina,
    addToast
  } = useStore(useShallow(state => ({
    rayasSemanales: state.rayasSemanales,
    pagosNominaSemanal: state.pagosNominaSemanal,
    actualizarPagosNominaSemanal: state.actualizarPagosNominaSemanal,
    confirmarPagoNomina: state.confirmarPagoNomina,
    addToast: state.addToast
  })));

  const rayasSem = useMemo(() => 
    rayasSemanales.filter(r => r.semana === semana), 
    [rayasSemanales, semana]
  );

  const calcularTotalRaya = (raya: any) => {
    let total = 0;
    Object.values(raya.asistencia).forEach((d: any) => {
      if (d.asistio) total += raya.sueldoDiario;
      if (d.horasExtra > 0) total += (raya.sueldoDiario / 8) * d.horasExtra;
      if (d.bonoExtra > 0) total += d.bonoExtra;
    });
    return total;
  };

  const totalNomina = useMemo(() => 
    rayasSem.reduce((s, r) => s + calcularTotalRaya(r), 0),
    [rayasSem]
  );

  const data = useMemo(() => 
    pagosNominaSemanal.find(p => p.semana === semana),
    [pagosNominaSemanal, semana]
  );

  const totalPagado = data?.totalPagado || 0;
  const porc = totalNomina > 0 ? (totalPagado / totalNomina) * 100 : 0;
  const efec = data?.pagos.filter(p => p.metodo === 'Efectivo').reduce((s, p) => s + p.monto, 0) || 0;
  const banc = data?.pagos.filter(p => p.metodo === 'Cuenta').reduce((s, p) => s + p.monto, 0) || 0;
  const pendiente = Math.max(0, totalNomina - totalPagado);

  const isPagada = data?.status === 'Pagada';

  if (!semana || rayasSem.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl max-w-md mx-auto mt-20 transition-colors">
        <h2 className="text-xl font-bold text-gray-800 dark:text-agri-50">No se encontró información para la semana {semana}</h2>
        <button 
          onClick={() => navigate(fromPath)}
          className="mt-4 text-agri-600 font-medium hover:underline flex items-center gap-2 justify-center w-full"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header / Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(fromPath)}
          className="flex items-center gap-3 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 group-hover:border-agri-200 dark:group-hover:border-slate-700 shadow-sm transition-all">
            <ChevronLeft className="w-5 h-5 text-agri-600" />
          </div>
          <span>Volver a Nómina</span>
        </button>
        <div className="text-right">
          <p className="text-[10px] font-black text-agri-400 dark:text-agri-500 uppercase tracking-widest mb-1 leading-none mr-1">Resumen de Liquidación</p>
          <h1 className="text-5xl md:text-6xl font-display text-agri-900 dark:text-agri-50 tracking-tight">{getDatesFromWeek(semana)}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Workers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                <div>
                  <p className="text-[10px] font-bold text-agri-400 uppercase tracking-widest mb-1.5 leading-none">Total Liquidado</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-display text-agri-900 dark:text-agri-50 leading-none tracking-tight">${totalPagado.toLocaleString()}</span>
                    <span className="text-xl font-bold text-agri-400/60 dark:text-slate-600">/ ${totalNomina.toLocaleString()}</span>
                  </div>
                  <p className="mt-4 text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-xl inline-flex items-center gap-2 border border-orange-100/50 dark:border-orange-500/20">
                    <Banknote className="w-4 h-4" /> 
                    Pendiente por pagar: ${pendiente.toLocaleString()}
                  </p>
                </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-lg ${isPagada ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-orange-500 text-white shadow-orange-500/20'}`}>
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    {isPagada ? 'Nómina Pagada' : 'En Liquidación'}
                  </div>
                  <p className="text-5xl font-black text-gray-900 dark:text-white mt-8 tracking-tighter leading-none">{Math.round(porc)}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner mb-10 transition-colors">
                <div 
                  className={`h-full transition-all duration-1000 ease-out shadow-lg ${totalPagado >= totalNomina ? 'bg-emerald-400' : 'bg-agri-500'}`}
                  style={{ width: `${Math.min(100, porc)}%` }}
                />
              </div>

              {/* Funding Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/20 p-6 rounded-[2rem] flex items-center gap-5 hover:shadow-xl transition-all group">
                  <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Banknote className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] text-emerald-600/60 dark:text-emerald-500/60 font-black uppercase tracking-widest mb-1.5 leading-none">Efectivo Acumulado</p>
                    <p className="text-3xl font-display text-emerald-600 dark:text-emerald-400 leading-none">${efec.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-gray-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/20 p-6 rounded-[2rem] flex items-center gap-5 hover:shadow-xl transition-all group">
                  <div className="p-4 bg-blue-500 text-white rounded-2xl shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-600/60 dark:text-blue-500/60 font-black uppercase tracking-widest mb-1.5 leading-none">Transferencias</p>
                    <p className="text-3xl font-display text-blue-600 dark:text-blue-400 leading-none">${banc.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-agri-50 dark:bg-slate-800 rounded-full blur-3xl opacity-50 z-0 transition-colors" />
          </div>

          {/* Worker Breakdown List */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-7 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between bg-gray-50/30 dark:bg-slate-800/20">
              <h3 className="text-lg font-display text-gray-900 dark:text-agri-50 flex items-center gap-3">
                <Users className="w-6 h-6 text-agri-500 dark:text-agri-400" />
                Desglose por Trabajador
              </h3>
              <span className="text-[10px] font-black text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-xl border border-gray-100 dark:border-slate-700 uppercase tracking-widest shadow-sm transition-all">{rayasSem.length} Personas</span>
            </div>
            <div className="divide-y divide-gray-50/50 dark:divide-slate-800/50 max-h-[600px] overflow-y-auto custom-scrollbar">
              {rayasSem.map(r => {
                const tot = calcularTotalRaya(r);
                const dias = Object.values(r.asistencia).filter((d: any) => d.asistio).length;
                const base = dias * r.sueldoDiario;
                const extras = tot - base;
                
                return (
                  <div key={r.id} className="group p-6 hover:bg-agri-50/30 dark:hover:bg-slate-800/40 transition-all border-l-4 border-transparent hover:border-agri-500">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center font-black text-agri-600 dark:text-agri-400 text-xl border border-gray-100 dark:border-slate-700 group-hover:bg-white dark:group-hover:bg-slate-900 group-hover:scale-110 transition-all shadow-inner">
                          {r.empleadoNombre.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xl font-bold text-agri-900 dark:text-agri-50 leading-tight group-hover:text-agri-600 dark:group-hover:text-agri-400 transition-colors tracking-tight">{r.empleadoNombre}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mt-1.5 opacity-80">{r.puesto} • {dias} JORNALES</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-display text-gray-900 dark:text-white tracking-tight leading-none">${tot.toLocaleString()}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest mt-2 px-2 py-0.5 rounded-lg border inline-block ${extras > 0 ? 'text-orange-500 border-orange-100 dark:border-orange-950/30 bg-orange-50 dark:bg-orange-950/20' : 'text-agri-300 border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/10'}`}>
                          {extras > 0 ? `+ $${extras.toLocaleString()} Extras` : 'Sin Extras'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Detail pills */}
                    <div className="flex flex-wrap gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-[10px] font-black text-gray-400 dark:text-slate-500 shadow-sm flex items-center gap-2 transition-all">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Base: ${base.toLocaleString()}
                      </div>
                      {extras > 0 && (
                        <div className="px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[10px] font-bold text-orange-600 shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                          Extras: ${extras.toLocaleString()}
                        </div>
                      )}
                      <div className="px-3 py-1 rounded-full bg-green-50 border border-green-100 text-[10px] font-bold text-green-600 shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Promedio: ${Math.round(tot / (dias || 1)).toLocaleString()}/día
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-sm">
              <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Total Nómina Bruta</span>
              <span className="text-xl font-black text-gray-900">${totalNomina.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Registration */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-agri-100 text-agri-600 rounded-xl">
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-gray-900">Registro de Abonos</h3>
                <p className="text-xs text-gray-500 font-medium">Captura los pagos realizados</p>
              </div>
            </div>

            <PagoSelector 
              pagos={data?.pagos || []} 
              maxMonto={totalNomina} 
              onChange={(nuevosPagos) => !isPagada && actualizarPagosNominaSemanal(semana, nuevosPagos)} 
            />

            {!isPagada && (
              <button
                onClick={() => {
                  if (totalPagado >= totalNomina) {
                    confirmarPagoNomina(semana);
                    addToast('Nómina marcada como pagada.', 'success');
                    navigate(fromPath);
                  } else {
                    addToast('Cambios guardados localmente.', 'success');
                  }
                }}
                disabled={totalNomina === 0 || (data?.pagos.length === 0)}
                className={`w-full mt-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                  (data?.pagos.length || 0) > 0
                    ? 'bg-agri-600 text-white hover:bg-agri-700 shadow-agri-200' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {totalPagado >= totalNomina ? 'Guardar y Marcar como Pagada' : 'Guardar'}
              </button>
            )}

            {totalPagado >= totalNomina && totalNomina > 0 && (
              <div className="mt-8 p-4 bg-green-50 border border-green-100 rounded-2xl flex flex-col items-center text-center animate-in zoom-in duration-300">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mb-3 shadow-lg shadow-green-200">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-green-800">Nómina Liquidada</h4>
                <p className="text-xs text-green-600 font-medium mt-1">Se han cubierto todos los pagos para esta semana.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominaPago;
