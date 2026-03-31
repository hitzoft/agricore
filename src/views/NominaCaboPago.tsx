import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { 
  ChevronLeft, CircleDollarSign, Banknote, 
  CreditCard, Users, Calendar, ArrowLeft,
  MapPin, Hash, TrendingUp, Save, Lock, CheckCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { PagoSelector } from '../components/PagoSelector';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return new Intl.DateTimeFormat('es-MX', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  }).format(date);
};

const NominaCaboPago = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as any)?.from || '/dashboard/nomina';

  const {
    cuadrillas,
    huertas,
    cabos,
    actualizarCuadrilla,
    confirmarPagoCuadrilla,
    addToast
  } = useStore(useShallow(state => ({
    cuadrillas: state.cuadrillas,
    huertas: state.huertas,
    cabos: state.cabos,
    actualizarCuadrilla: state.actualizarCuadrilla,
    confirmarPagoCuadrilla: state.confirmarPagoCuadrilla,
    addToast: state.addToast
  })));

  const cuadrilla = useMemo(() => 
    cuadrillas.find(c => c.id === id), 
    [cuadrillas, id]
  );

  const displayNames = useMemo(() => {
    if (!cuadrilla) return { cabo: 'Cargando...', huerta: 'Cargando...' };

    const cabo = cabos.find(c => c.id === cuadrilla.caboId);
    const huerta = huertas.find(h => h.id === cuadrilla.huertaId);
    
    // Si el ID guardado es en realidad el nombre (error que acabamos de corregir), lo usamos como respaldo
    const fallbackCabo = (cuadrilla.caboId && (cuadrilla.caboId.length ?? 0) < 30) ? cuadrilla.caboId : 'No asignado';
    const fallbackHuerta = (cuadrilla.huertaId && (cuadrilla.huertaId.length ?? 0) < 30) ? cuadrilla.huertaId : 'No especificada';

    return {
      cabo: cabo?.nombre || (cuadrilla.caboNombre !== 'Desconocido' ? cuadrilla.caboNombre : fallbackCabo),
      huerta: huerta?.nombre || (cuadrilla.huerta !== 'Desconocida' ? cuadrilla.huerta : fallbackHuerta)
    };
  }, [cabos, huertas, cuadrilla]);

  const [editForm, setEditForm] = useState({
    personas: '',
    tarifa: '',
    flete: '',
    comida: '',
    otrosGastos: '',
    otrosGastosDesc: ''
  });

  useEffect(() => {
    if (cuadrilla) {
      setEditForm({
        personas: cuadrilla.personas.toString(),
        tarifa: cuadrilla.tarifa.toString(),
        flete: cuadrilla.flete.toString(),
        comida: cuadrilla.comida.toString(),
        otrosGastos: cuadrilla.otrosGastos.toString(),
        otrosGastosDesc: cuadrilla.otrosGastosDesc || ''
      });
    }
  }, [cuadrilla]);

  const totalCalculado = useMemo(() => {
    const p = Number(editForm.personas) || 0;
    const t = Number(editForm.tarifa) || 0;
    const f = Number(editForm.flete) || 0;
    const c = Number(editForm.comida) || 0;
    const o = Number(editForm.otrosGastos) || 0;
    return (p * t) + f + c + o;
  }, [editForm]);

  const totalPagado = useMemo(() => 
    cuadrilla?.pagos?.reduce((s, p) => s + p.monto, 0) || 0,
    [cuadrilla]
  );

  const isLiquidado = totalPagado >= totalCalculado && totalCalculado > 0;
  const isPagadaFinal = cuadrilla?.status === 'Pagada';
  const porc = totalCalculado > 0 ? (totalPagado / totalCalculado) * 100 : 0;

  const efec = cuadrilla?.pagos.filter(p => p.metodo === 'Efectivo').reduce((s, p) => s + p.monto, 0) || 0;
  const banc = cuadrilla?.pagos.filter(p => p.metodo === 'Cuenta').reduce((s, p) => s + p.monto, 0) || 0;

  const handleSave = () => {
    if (!cuadrilla) return;
    
    actualizarCuadrilla(cuadrilla.id, {
      personas: Number(editForm.personas),
      tarifa: Number(editForm.tarifa),
      flete: Number(editForm.flete),
      comida: Number(editForm.comida),
      otrosGastos: Number(editForm.otrosGastos),
      otrosGastosDesc: editForm.otrosGastosDesc
    });

    if (isLiquidado) {
      confirmarPagoCuadrilla(cuadrilla.id);
      addToast('Pago registrado y asistencia liquidada.', 'success');
      navigate(fromPath);
    } else {
      addToast('Cambios guardados localmente.', 'success');
    }
  };

  if (!cuadrilla) {
    return (
      <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl max-w-md mx-auto mt-20 transition-colors">
        <h2 className="text-xl font-bold text-gray-800 dark:text-agri-50 mb-4 tracking-tight">No se encontró el registro de asistencia</h2>
        <button 
          onClick={() => navigate(fromPath)}
          className="text-agri-600 dark:text-agri-400 font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-2 justify-center w-full"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Nómina
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(fromPath)}
          className="flex items-center gap-3 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 group-hover:border-agri-200 dark:group-hover:border-slate-700 shadow-sm transition-all">
            <ChevronLeft className="w-5 h-5 text-agri-600" />
          </div>
          <span>Volver</span>
        </button>
        <div className="text-right">
          <p className="text-sm font-display text-agri-400 italic">Pago de Asistencia</p>
          <h1 className="text-5xl md:text-6xl font-display text-gray-900 dark:text-agri-50 tracking-tight">{displayNames.cabo}</h1>
          <p className="text-lg text-agri-600 dark:text-agri-400 font-bold mt-2 flex items-center justify-end gap-2">
            <MapPin className="w-5 h-5 text-agri-500" />
            {displayNames.huerta}
          </p>
        </div>
      </div>

      {/* Locked Banner */}
      {isPagadaFinal && (
        <div className="mb-6 flex items-center gap-4 p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl">
          <div className="p-3 bg-green-100 dark:bg-green-500 text-green-600 dark:text-white rounded-xl"><Lock className="w-6 h-6" /></div>
          <div>
            <p className="font-black text-green-800 dark:text-green-300 text-sm uppercase tracking-widest">Cuadrilla Liquidada — Solo Lectura</p>
            <p className="text-green-600 dark:text-green-500 text-xs font-medium mt-0.5">Esta asistencia fue marcada como pagada y no puede ser modificada.</p>
          </div>
          <CheckCircle className="w-6 h-6 text-green-500 ml-auto shrink-0" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Summary & Edit */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Summary Card */}
          <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-8 border border-gray-100 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">Estado de Pago</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-gray-900 dark:text-agri-50">${totalPagado.toLocaleString()}</span>
                    <span className="text-xl font-bold text-gray-400 dark:text-slate-500">/ ${totalCalculado.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg ${isPagadaFinal ? 'bg-emerald-500 text-white shadow-emerald-500/20' : isLiquidado ? 'bg-blue-500 text-white shadow-blue-500/20' : 'bg-orange-500 text-white shadow-orange-500/20'}`}>
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    {isPagadaFinal ? 'Cuadrilla Pagada' : isLiquidado ? 'Pendiente de Confirmar' : 'Pago Parcial'}
                  </span>
                  <p className="text-4xl font-black text-gray-900 dark:text-white mt-4 tracking-tighter leading-none">{Math.round(porc)}%</p>
                </div>
              </div>

              <div className="w-full h-4 bg-gray-100 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner mb-8">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${isLiquidado ? 'bg-green-500' : 'bg-agri-500'}`}
                  style={{ width: `${Math.min(100, porc)}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="bg-green-50/50 dark:bg-green-400/5 border border-green-100 dark:border-green-400/10 p-5 rounded-2xl flex items-center gap-4 transition-colors">
                  <div className="p-3 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl"><Banknote className="w-6 h-6" /></div>
                  <div>
                    <p className="text-[10px] text-green-600 dark:text-emerald-500 font-black uppercase tracking-widest leading-none mb-1.5">Efectivo Pagado</p>
                    <p className="text-3xl font-display text-green-700 dark:text-emerald-400 leading-none tracking-tight">${efec.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-400/5 border border-blue-100 dark:border-blue-400/10 p-5 rounded-2xl flex items-center gap-4 transition-colors">
                  <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl"><CreditCard className="w-6 h-6" /></div>
                  <div>
                    <p className="text-[10px] text-blue-600 dark:text-blue-500 font-black uppercase tracking-widest leading-none mb-1.5">Bancario Pagado</p>
                    <p className="text-3xl font-display text-blue-700 dark:text-blue-400 leading-none tracking-tight">${banc.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gray-50 rounded-full blur-3xl opacity-50 z-0" />
          </div>

          {/* Details & Edit Form */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="p-7 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between bg-gray-50/30 dark:bg-slate-800/20">
              <h4 className="text-lg font-display text-gray-900 dark:text-agri-50 flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                Desglose de la Cuadrilla
              </h4>
              <span className="text-[10px] font-black text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-4 py-1.5 rounded-xl border border-gray-100 dark:border-slate-700 uppercase tracking-widest shadow-sm">{formatDate(cuadrilla.fecha)}</span>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Detalle de la Cuadrilla</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-gray-700 dark:text-agri-100 font-bold group">
                      <div className="p-2.5 bg-agri-50 dark:bg-agri-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                        <MapPin className="w-5 h-5 text-agri-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] leading-none mb-1">Huerta</span>
                        <span>{displayNames.huerta}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700 dark:text-agri-100 font-bold">
                      <div className="p-1.5 bg-agri-50 dark:bg-agri-500/10 rounded-lg">
                        <Users className="w-4 h-4 text-agri-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] leading-none mb-1">Cabo</span>
                        <span>{displayNames.cabo}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 dark:border-slate-700/50">
                  <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4">Resumen de Costos</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-slate-400">Pago Personal ({editForm.personas} x ${editForm.tarifa})</span>
                      <span className="font-bold text-gray-900 dark:text-agri-50">${(Number(editForm.personas) * Number(editForm.tarifa)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-slate-400">Apoyo Flete</span>
                      <span className="font-bold text-gray-900 dark:text-agri-50">${Number(editForm.flete).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-slate-400">Apoyo Comida</span>
                      <span className="font-bold text-gray-900 dark:text-agri-50">${Number(editForm.comida).toLocaleString()}</span>
                    </div>
                    {Number(editForm.otrosGastos) > 0 && (
                      <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                        <span>{editForm.otrosGastosDesc || 'Otros Gastos'}</span>
                        <span className="font-bold">${Number(editForm.otrosGastos).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-slate-700/50 mt-4">
                      <span className="text-lg font-black text-gray-900 dark:text-agri-50 uppercase tracking-tight">Total Bruto</span>
                      <span className="text-2xl font-black text-gray-900 dark:text-agri-50">${totalCalculado.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Inputs */}
              <div className={`space-y-4 p-6 rounded-2xl border ${isPagadaFinal ? 'bg-gray-50 dark:bg-slate-900/50 border-gray-100 dark:border-slate-800 opacity-60 pointer-events-none select-none' : 'bg-gray-50/50 dark:bg-slate-900/30 border-gray-100 dark:border-slate-700/50'}`}>
                <h4 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  {isPagadaFinal && <Lock className="w-3 h-3" />}
                  {isPagadaFinal ? 'Valores Bloqueados' : 'Ajustar Valores'}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Personas</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input disabled={isPagadaFinal} type="number" value={editForm.personas} onChange={e => setEditForm({...editForm, personas: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm font-bold focus:border-agri-500 dark:text-agri-50 outline-none disabled:bg-gray-50 dark:disabled:bg-slate-950 disabled:cursor-not-allowed transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Tarifa</label>
                    <div className="relative">
                      <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input disabled={isPagadaFinal} type="number" value={editForm.tarifa} onChange={e => setEditForm({...editForm, tarifa: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm font-bold focus:border-agri-500 dark:text-agri-50 outline-none disabled:bg-gray-50 dark:disabled:bg-slate-950 disabled:cursor-not-allowed transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Flete</label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input disabled={isPagadaFinal} type="number" value={editForm.flete} onChange={e => setEditForm({...editForm, flete: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm font-bold focus:border-agri-500 dark:text-agri-50 outline-none disabled:bg-gray-50 dark:disabled:bg-slate-950 disabled:cursor-not-allowed transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Comida</label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input disabled={isPagadaFinal} type="number" value={editForm.comida} onChange={e => setEditForm({...editForm, comida: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm font-bold focus:border-agri-500 dark:text-agri-50 outline-none disabled:bg-gray-50 dark:disabled:bg-slate-950 disabled:cursor-not-allowed transition-colors" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Otros Gastos</label>
                  <input disabled={isPagadaFinal} type="number" value={editForm.otrosGastos} onChange={e => setEditForm({...editForm, otrosGastos: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold focus:border-agri-500 dark:text-agri-50 outline-none disabled:bg-gray-50 dark:disabled:bg-slate-950 disabled:cursor-not-allowed transition-colors" />
                  {Number(editForm.otrosGastos) > 0 && <input disabled={isPagadaFinal} type="text" placeholder="¿En qué se gastó?" value={editForm.otrosGastosDesc} onChange={e => setEditForm({...editForm, otrosGastosDesc: e.target.value})} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm mt-1 focus:border-agri-500 dark:text-agri-50 outline-none disabled:bg-gray-50 dark:disabled:bg-slate-950 disabled:cursor-not-allowed transition-colors" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Registration */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-gray-100 dark:border-slate-700/50 shadow-sm sticky top-6 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-agri-100 dark:bg-agri-500/20 text-agri-600 dark:text-agri-400 rounded-xl">
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-black text-gray-900 dark:text-agri-50">Registro de Abonos</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Captura los pagos realizados</p>
              </div>
            </div>

            <PagoSelector 
              pagos={cuadrilla.pagos || []} 
              maxMonto={totalCalculado} 
              onChange={(nuevosPagos) => !isPagadaFinal && actualizarCuadrilla(cuadrilla.id, { pagos: nuevosPagos })} 
            />

            {!isPagadaFinal && (
              <button
                onClick={handleSave}
                disabled={totalCalculado === 0}
                className={`w-full mt-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                  isLiquidado
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200' 
                    : 'bg-agri-600 text-white hover:bg-agri-700 shadow-agri-100'
                }`}
              >
                <Save className="w-4 h-4" />
                {isLiquidado ? 'Guardar y Marcar como Pagada' : 'Guardar Cambios'}
              </button>
            )}

            {isPagadaFinal && (
              <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/50 rounded-2xl flex flex-col items-center text-center animate-in zoom-in duration-300">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mb-3 shadow-lg shadow-green-200 dark:shadow-none">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-green-800 dark:text-green-300">Cabo Liquidado</h4>
                <p className="text-xs text-green-600 dark:text-green-500 font-medium mt-1">Se ha cubierto el pago de esta asistencia.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominaCaboPago;
