import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import {
  ChevronLeft, Calendar, Users, CircleDollarSign,
  Banknote, CreditCard, ChevronRight, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getDatesFromWeek } from '../utils/dateUtils';

const NominaHistorialDetalle = () => {
  const { semana } = useParams<{ semana: string }>();
  const navigate = useNavigate();

  const { rayasSemanales, cuadrillas, pagosNominaSemanal } = useStore(
    useShallow(state => ({
      rayasSemanales: state.rayasSemanales,
      cuadrillas: state.cuadrillas,
      pagosNominaSemanal: state.pagosNominaSemanal,
    }))
  );

  // --- Nómina Semanal ---
  const rayasSemana = useMemo(
    () => rayasSemanales.filter(r => r.semana === semana && r.cerrada),
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

  const totalNominaSemanal = useMemo(
    () => rayasSemana.reduce((s, r) => s + calcularTotalRaya(r), 0),
    [rayasSemana]
  );

  const pagoData = useMemo(
    () => pagosNominaSemanal.find(p => p.semana === semana),
    [pagosNominaSemanal, semana]
  );

  const nominaPagado = pagoData?.totalPagado || 0;
  const nominaEfectivo = pagoData?.pagos.filter(p => p.metodo === 'Efectivo').reduce((s, p) => s + p.monto, 0) || 0;
  const nominaBanco = pagoData?.pagos.filter(p => p.metodo === 'Cuenta').reduce((s, p) => s + p.monto, 0) || 0;
  const nominaStatus = pagoData?.status || 'Pendiente';

  // --- Cuadrillas ---
  const cuadrillaSemana = useMemo(
    () => cuadrillas
      .filter(c => c.semana === semana)
      .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [cuadrillas, semana]
  );

  const cuadrillaStats = useMemo(() => {
    let total = 0; let pagado = 0; let efectivo = 0; let banco = 0;
    cuadrillaSemana.forEach(c => {
      const t = (c.personas * c.tarifa) + c.flete + c.comida + c.otrosGastos;
      total += t;
      const p = c.pagos?.reduce((s, p) => s + p.monto, 0) || 0;
      pagado += p;
      efectivo += c.pagos?.filter(p => p.metodo === 'Efectivo').reduce((s, p) => s + p.monto, 0) || 0;
      banco += c.pagos?.filter(p => p.metodo === 'Cuenta').reduce((s, p) => s + p.monto, 0) || 0;
    });
    return { total, pagado, pendiente: total - pagado, efectivo, banco };
  }, [cuadrillaSemana]);

  // --- Grand Totals ---
  const grandTotal = totalNominaSemanal + cuadrillaStats.total;
  const grandPagado = nominaPagado + cuadrillaStats.pagado;
  const grandPendiente = grandTotal - grandPagado;
  const grandEfectivo = nominaEfectivo + cuadrillaStats.efectivo;
  const grandBanco = nominaBanco + cuadrillaStats.banco;
  const grandPorc = grandTotal > 0 ? Math.round((grandPagado / grandTotal) * 100) : 0;
  const isFullyPaid = grandPendiente <= 0 && grandTotal > 0;

  const getStatusBadge = (status: string, pagado: number, total: number) => {
    if (status === 'Pagada' || (pagado >= total && total > 0)) return { label: 'Pagada', cls: 'bg-green-100 text-green-700' };
    if (pagado > 0) return { label: 'Parcial', cls: 'bg-blue-100 text-blue-700' };
    return { label: 'Pendiente', cls: 'bg-orange-100 text-orange-700' };
  };

  const getCuadrillaStatus = (c: any) => {
    const total = (c.personas * c.tarifa) + c.flete + c.comida + c.otrosGastos;
    const pagado = c.pagos?.reduce((s: number, p: any) => s + p.monto, 0) || 0;
    return getStatusBadge(c.status, pagado, total);
  };

  if (rayasSemana.length === 0 && cuadrillaSemana.length === 0) {
    return (
      <div className="p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Sin registros para esta semana</h2>
        <button onClick={() => navigate('/nomina')} className="mt-4 text-agri-600 font-medium hover:underline flex items-center gap-2 justify-center w-full">
          <ChevronLeft className="w-4 h-4" /> Volver a Nómina
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/nomina')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors group"
        >
          <div className="p-2 rounded-lg bg-white border border-gray-200 group-hover:border-gray-300 shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Historial de Nóminas
        </button>
        <div className="text-right">
          <p className="text-sm font-display text-agri-400 italic leading-tight mb-1">
            Semana {semana?.split('-W')[1]} — {semana?.split('-W')[0]}
          </p>
          <h1 className="text-5xl md:text-6xl font-display text-agri-900 tracking-tight">
            {getDatesFromWeek(semana || '')}
          </h1>
        </div>
      </div>

      {/* Grand Summary Card */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <p className="text-[10px] font-bold text-agri-400 uppercase tracking-widest mb-1.5 leading-none">Total de la Semana</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display text-agri-900 leading-none">${grandPagado.toLocaleString()}</span>
                <span className="text-xl font-bold text-gray-400">/ ${grandTotal.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Pendiente: <strong className="text-orange-600">${grandPendiente.toLocaleString()}</strong></p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tight ${isFullyPaid ? 'bg-green-100 text-green-700' : grandPagado > 0 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {isFullyPaid ? '✓ Semana Liquidada' : grandPagado > 0 ? 'Pago Parcial' : 'Pendiente'}
              </span>
              <p className="text-3xl font-black text-gray-900">{grandPorc}%</p>
            </div>
          </div>

          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner mb-6">
            <div
              className={`h-full transition-all duration-1000 ease-out ${isFullyPaid ? 'bg-green-500' : 'bg-agri-500'}`}
              style={{ width: `${Math.min(100, grandPorc)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-agri-50 border border-agri-100 p-4 rounded-2xl">
              <p className="text-[10px] text-agri-600 font-black uppercase tracking-widest">Nómina Semanal</p>
              <p className="text-xl font-black text-agri-700">${totalNominaSemanal.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl">
              <p className="text-[10px] text-purple-600 font-black uppercase tracking-widest">Cuadrillas</p>
              <p className="text-xl font-black text-purple-700">${cuadrillaStats.total.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
              <p className="text-[10px] text-green-600 font-black uppercase tracking-widest flex items-center gap-1"><Banknote className="w-3 h-3" /> Efectivo</p>
              <p className="text-xl font-black text-green-700">${grandEfectivo.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-1"><CreditCard className="w-3 h-3" /> Bancario</p>
              <p className="text-xl font-black text-blue-700">${grandBanco.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gray-50 rounded-full blur-3xl opacity-50 z-0" />
      </div>

      {/* Nómina Semanal Record */}
      {rayasSemana.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4" /> Nómina Semanal
          </h2>
          <div
            onClick={() => navigate(`/nomina/pago/${semana}`, { state: { from: window.location.pathname } })}
            className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-agri-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${nominaStatus === 'Pagada' ? 'bg-green-50 text-green-600' : nominaPagado > 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-base font-bold text-gray-900">Nómina de Empleados</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${getStatusBadge(nominaStatus, nominaPagado, totalNominaSemanal).cls}`}>
                    {getStatusBadge(nominaStatus, nominaPagado, totalNominaSemanal).label}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {rayasSemana.length} empleados •{' '}
                  Total: <strong className="text-gray-700">${totalNominaSemanal.toLocaleString()}</strong>{' '}
                  • Pagado: <strong className="text-green-600">${nominaPagado.toLocaleString()}</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex gap-4 text-xs">
                <div className="flex flex-col items-end">
                  <span className="text-gray-400 uppercase text-[9px]">Efectivo</span>
                  <span className="font-bold text-gray-700">${nominaEfectivo.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-end border-l border-gray-100 pl-4">
                  <span className="text-gray-400 uppercase text-[9px]">Bancario</span>
                  <span className="font-bold text-gray-700">${nominaBanco.toLocaleString()}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-agri-500 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      )}

      {/* Cuadrillas Records */}
      {cuadrillaSemana.length > 0 && (
        <div>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Cuadrillas ({cuadrillaSemana.length})
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {cuadrillaSemana.map(c => {
              const total = (c.personas * c.tarifa) + c.flete + c.comida + c.otrosGastos;
              const pagado = c.pagos?.reduce((s: number, p: any) => s + p.monto, 0) || 0;
              const efec = c.pagos?.filter((p: any) => p.metodo === 'Efectivo').reduce((s: number, p: any) => s + p.monto, 0) || 0;
              const banc = c.pagos?.filter((p: any) => p.metodo === 'Cuenta').reduce((s: number, p: any) => s + p.monto, 0) || 0;
              const status = getCuadrillaStatus(c);
              const StatusIcon = c.status === 'Pagada' ? CheckCircle : pagado > 0 ? Clock : AlertCircle;

              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/nomina/cabo-pago/${c.id}`, { state: { from: window.location.pathname } })}
                  className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${c.status === 'Pagada' ? 'bg-green-50 text-green-600' : pagado > 0 ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-base font-bold text-gray-900">{c.cabo}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${status.cls}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {c.huerta} • {c.personas} personas •{' '}
                        Total: <strong className="text-gray-700">${total.toLocaleString()}</strong>{' '}
                        • Pagado: <strong className="text-green-600">${pagado.toLocaleString()}</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex gap-4 text-xs">
                      <div className="flex flex-col items-end">
                        <span className="text-gray-400 uppercase text-[9px]">Efectivo</span>
                        <span className="font-bold text-gray-700">${efec.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-end border-l border-gray-100 pl-4">
                        <span className="text-gray-400 uppercase text-[9px]">Bancario</span>
                        <span className="font-bold text-gray-700">${banc.toLocaleString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NominaHistorialDetalle;
