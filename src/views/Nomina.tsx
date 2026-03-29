import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import {
  Users, MapPin, Calendar, Plus,
  ChevronRight, ChevronLeft, Download,
  TrendingUp, CircleDollarSign, Banknote,
  Hash, RefreshCw, CheckCircle2,
  Lock, Edit3, X, User, HelpCircle, HardHat,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { DiaSemana } from '../store/useStore';
import { generatePayrollPDF } from '../utils/reportGenerator';
import ConfirmModal from '../components/ConfirmModal';
import { getWeekFromDate, getCurrentWeek, getDatesFromWeek } from '../utils/dateUtils';

const Nomina = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Cuadrillas' | 'Rayas' | 'Historial'>('Rayas');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<string>(getCurrentWeek());
  
  // Reset page on week change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [semanaSeleccionada]);
  const [showModalCuadrilla, setShowModalCuadrilla] = useState(false);
  const [showModalExtras, setShowModalExtras] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [selectedRayaId, setSelectedRayaId] = useState<string | null>(null);
  const [selectedDia, setSelectedDia] = useState<DiaSemana | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  const {
    cuadrillas, rayasSemanales, huertasRaw, cabosRaw,
    addCuadrilla, generarNominaActiva, toggleAsistencia, setExtras,
    cerrarNomina, addToast, setAsistenciaMasiva,
    pagosNominaSemanal
  } = useStore(useShallow(state => ({
    cuadrillas: state.cuadrillas,
    rayasSemanales: state.rayasSemanales,
    huertasRaw: state.huertas,
    cabosRaw: state.cabos,
    addCuadrilla: state.addCuadrilla,
    generarNominaActiva: state.generarNominaActiva,
    toggleAsistencia: state.toggleAsistencia,
    setExtras: state.setExtras,
    cerrarNomina: state.cerrarNomina,
    addToast: state.addToast,
    setAsistenciaMasiva: state.setAsistenciaMasiva,
    pagosNominaSemanal: state.pagosNominaSemanal
  })));

  const huertas = useMemo(() => huertasRaw.filter(h => h.activo !== false), [huertasRaw]);
  const cabos = useMemo(() => cabosRaw.filter(c => c.activo !== false), [cabosRaw]);
  const rayasActuales = useMemo(() => rayasSemanales.filter(r => r.semana === semanaSeleccionada), [rayasSemanales, semanaSeleccionada]);
  const isCerrada = rayasActuales.length > 0 && rayasActuales[0].cerrada;
  const cuadrillasActuales = useMemo(() => 
    cuadrillas
      .filter(c => c.semana === semanaSeleccionada)
      .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [cuadrillas, semanaSeleccionada]
  );

  const paginatedRayas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return rayasActuales.slice(start, start + ITEMS_PER_PAGE);
  }, [rayasActuales, currentPage]);

  const totalPages = Math.ceil(rayasActuales.length / ITEMS_PER_PAGE);

  const calcularTotalRaya = (raya: any) => {
    let total = 0;
    Object.values(raya.asistencia).forEach((d: any) => {
      if (d.asistio) total += raya.sueldoDiario;
      if (d.horasExtra > 0) total += (raya.sueldoDiario / 8) * d.horasExtra;
      if (d.bonoExtra > 0) total += d.bonoExtra;
    });
    return total;
  };

  const calcularGlobalAcumulado = () => rayasActuales.reduce((s, r) => s + calcularTotalRaya(r), 0);

  const pagoSemanalData = useMemo(() => pagosNominaSemanal.find(p => p.semana === semanaSeleccionada), [pagosNominaSemanal, semanaSeleccionada]);
  const pagoSemanalTotal = pagoSemanalData?.totalPagado || 0;

  const calcularTotalCuadrillas = () => {
    let global = 0; let pagado = 0;
    cuadrillasActuales.forEach(c => {
      const total = (c.personas * c.tarifa) + c.flete + c.comida + c.otrosGastos;
      global += total;
      pagado += c.pagos?.reduce((s, p) => s + p.monto, 0) || 0;
    });
    return { global, pagado, pendiente: global - pagado };
  };

  const historialSemanas = useMemo(() => {
    // Gather all unique weeks from closed rayas OR any cuadrilla
    const semanasSet = new Set<string>();
    rayasSemanales.filter(r => r.cerrada).forEach(r => semanasSet.add(r.semana));
    cuadrillas.forEach(c => { if (c.semana) semanasSet.add(c.semana); });

    return Array.from(semanasSet).sort().reverse().map(sem => {
      // Nómina semanal
      const rayasSem = rayasSemanales.filter(r => r.semana === sem && r.cerrada);
      const totalNomina = rayasSem.reduce((s, r) => s + calcularTotalRaya(r), 0);
      const pagoData = pagosNominaSemanal.find(p => p.semana === sem);
      const nominaPagado = pagoData?.totalPagado || 0;
      const nominaEfectivo = pagoData?.pagos.filter(p => p.metodo === 'Efectivo').reduce((s, p) => s + p.monto, 0) || 0;
      const nominaBanco = pagoData?.pagos.filter(p => p.metodo === 'Cuenta').reduce((s, p) => s + p.monto, 0) || 0;

      // Cuadrillas
      const cuadrillasSem = cuadrillas.filter(c => c.semana === sem);
      const totalCuadrillas = cuadrillasSem.reduce((s, c) => s + (c.personas * c.tarifa) + c.flete + c.comida + c.otrosGastos, 0);
      const cuadrillasPagado = cuadrillasSem.reduce((s, c) => s + (c.pagos?.reduce((ps, p) => ps + p.monto, 0) || 0), 0);
      const cuadrillasEfectivo = cuadrillasSem.reduce((s, c) => s + (c.pagos?.filter(p => p.metodo === 'Efectivo').reduce((ps, p) => ps + p.monto, 0) || 0), 0);
      const cuadrillasBanco = cuadrillasSem.reduce((s, c) => s + (c.pagos?.filter(p => p.metodo === 'Cuenta').reduce((ps, p) => ps + p.monto, 0) || 0), 0);

      const total = totalNomina + totalCuadrillas;
      const pagado = nominaPagado + cuadrillasPagado;
      const efectivo = nominaEfectivo + cuadrillasEfectivo;
      const banco = nominaBanco + cuadrillasBanco;
      const isPagada = (pagoData?.status === 'Pagada' || rayasSem.length === 0) &&
        cuadrillasSem.every(c => c.status === 'Pagada') &&
        total > 0 && pagado >= total;

      return {
        semana: sem,
        total,
        pagado,
        pendiente: total - pagado,
        efectivo,
        banco,
        isPagada,
        numCuadrillas: cuadrillasSem.length,
        hasNomina: rayasSem.length > 0,
      };
    });
  }, [rayasSemanales, cuadrillas, pagosNominaSemanal]);

  const [formCuadrilla, setFormCuadrilla] = useState({ caboId: '', huertaId: '', personas: '', tarifa: '', flete: '', comida: '', otrosGastos: '', otrosGastosDesc: '', fecha: new Date().toISOString().split('T')[0] });
  const [formExtras, setFormExtras] = useState({ horasExtra: '', bonoExtra: '' });

  const handleDownloadReport = async () => {
    if (rayasActuales.length === 0) return addToast('No hay datos para generar el reporte de esta semana.', 'warning');
    try {
      addToast(`Generando ${isCerrada ? 'Reporte' : 'Pre-nómina'}...`, 'info');
      await generatePayrollPDF(semanaSeleccionada, rayasActuales);
      addToast('Reporte generado exitosamente.', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      addToast('Error al generar el PDF.', 'error');
    }
  };

  const handleCuadrillaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCuadrilla.caboId || !formCuadrilla.huertaId) return addToast('Debe seleccionar Cabo y Huerta', 'error');
    const semanaCalc = getWeekFromDate(formCuadrilla.fecha);
    addCuadrilla({ cabo: formCuadrilla.caboId, huerta: formCuadrilla.huertaId, personas: Number(formCuadrilla.personas), tarifa: Number(formCuadrilla.tarifa), flete: Number(formCuadrilla.flete), comida: Number(formCuadrilla.comida), otrosGastos: Number(formCuadrilla.otrosGastos || 0), otrosGastosDesc: formCuadrilla.otrosGastosDesc || '', fecha: formCuadrilla.fecha, semana: semanaCalc });
    setShowModalCuadrilla(false);
    setFormCuadrilla({ caboId: '', huertaId: '', personas: '', tarifa: '', flete: '', comida: '', otrosGastos: '', otrosGastosDesc: '', fecha: new Date().toISOString().split('T')[0] });
    addToast('Asistencia de cabo registrada correctamente.', 'success');
    if (semanaCalc !== semanaSeleccionada) setSemanaSeleccionada(semanaCalc);
  };

  const handleOpenExtras = (rayaId: string, dia: DiaSemana, currentHoras: number, currentBono: number) => {
    if (isCerrada) return;
    setSelectedRayaId(rayaId); setSelectedDia(dia);
    setFormExtras({ horasExtra: currentHoras.toString(), bonoExtra: currentBono.toString() });
    setShowModalExtras(true);
  };

  const handleExtrasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRayaId && selectedDia) setExtras(selectedRayaId, selectedDia, Number(formExtras.horasExtra || 0), Number(formExtras.bonoExtra || 0));
    setShowModalExtras(false);
  };

  const nominaConfig = {
    'Rayas': { label: 'Nómina Semanal', icon: Users, color: 'bg-agri-600', desc: 'Asistencias y pre-nómina de fijos' },
    'Cuadrillas': { label: 'Cuadrillas', icon: HardHat, color: 'bg-orange-500', desc: 'Control de personal externo' },
    'Historial': { label: 'Historial', icon: Calendar, color: 'bg-slate-600', desc: 'Semanas completadas y reportes' }
  };

  const selectSection = (tab: 'Cuadrillas' | 'Rayas' | 'Historial') => {
    setActiveTab(tab);
    setView('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const diasHeader: DiaSemana[] = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          {view === 'list' && (
            <button 
              onClick={() => setView('grid')}
              className="p-2.5 bg-white rounded-2xl shadow-sm border border-agri-100 text-agri-600 hover:bg-agri-50 transition-all active:scale-90"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="space-y-1">
            <h1 className="text-5xl md:text-6xl font-display text-agri-900 tracking-tight">
              {view === 'grid' ? 'Nómina' : nominaConfig[activeTab].label}
            </h1>
            <p className="text-agri-400 text-sm font-medium leading-relaxed italic">
              {view === 'grid' 
                ? 'Gestión de cuadrillas y nómina semanal de trabajadores de campo.' 
                : nominaConfig[activeTab].desc}
            </p>
          </div>
        </div>

        {view === 'list' && (
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'Cuadrillas' && (
              <button 
                onClick={() => setShowModalCuadrilla(true)} 
                className="bg-agri-600 hover:bg-agri-700 text-white px-6 py-3 rounded-2xl shadow-lg shadow-agri-600/20 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Registrar Cuadrilla
              </button>
            )}

            {activeTab === 'Rayas' && rayasActuales.length > 0 && (
              <>
                <button 
                  onClick={handleDownloadReport} 
                  className="bg-white border-2 border-agri-100 text-agri-700 hover:bg-agri-50 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{isCerrada ? 'Reporte' : 'Pre-nómina'}</span>
                </button>

                {!isCerrada && (
                  <button 
                    onClick={() => setShowConfirmClose(true)} 
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl shadow-lg shadow-red-600/20 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Lock className="w-4 h-4" /> Cerrar Nómina
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        onConfirm={() => { cerrarNomina(semanaSeleccionada); addToast(`Nómina ${semanaSeleccionada} cerrada correctamente.`, 'success'); }}
        title="Cerrar Nómina Semanal"
        message={`¿Estás seguro de que deseas cerrar la nómina para la semana ${semanaSeleccionada}? Una vez cerrada, no podrás modificar las asistencias ni los extras.`}
        confirmText="Sí, Cerrar Nómina"
        type="danger"
      />

      {view === 'grid' ? (
        /* GRID VIEW: Dashboard Style */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {(Object.keys(nominaConfig) as ('Cuadrillas' | 'Rayas' | 'Historial')[]).map((tab) => {
            const config = nominaConfig[tab];
            const Icon = config.icon;
            return (
              <button
                key={tab}
                onClick={() => selectSection(tab)}
                className="group relative bg-white p-8 rounded-[2.5rem] border border-agri-100 shadow-sm hover:shadow-xl hover:shadow-agri-600/5 hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden active:scale-[0.98]"
              >
                <div className={`w-14 h-14 ${config.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-inner`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-display text-agri-900 mb-1 group-hover:text-agri-600 transition-colors">{config.label}</h3>
                  <p className="text-agri-400 text-sm leading-snug">{config.desc}</p>
                </div>
                <div className="absolute top-8 right-8 p-2 rounded-xl bg-agri-50 text-agri-400 group-hover:bg-agri-600 group-hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW CONTENT */
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-agri-100/50 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Controls bar */}
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
            <div className="flex items-center gap-3">
               <div className={`p-2 rounded-xl ${nominaConfig[activeTab].color} text-white`}>
                 {React.createElement(nominaConfig[activeTab].icon, { className: 'w-4 h-4' })}
               </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-agri-900 uppercase tracking-[0.1em]">{activeTab === 'Rayas' ? 'Control de Asistencia' : activeTab}</span>
                  {activeTab === 'Rayas' && (
                    <p className="text-[9px] font-bold text-agri-600/60 uppercase tracking-widest leading-none mt-1 italic hidden sm:block">
                      Días trabajados, horas extra y bonos
                    </p>
                  )}
                </div>
                {activeTab === 'Rayas' && !isCerrada && (
                  <div className="ml-4 flex items-center gap-2 text-[10px] font-black text-white bg-agri-600 px-4 py-1.5 rounded-xl shadow-lg shadow-agri-100 animate-pulse tracking-[0.1em] border border-white/20">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">EDICIÓN ACTIVA</span>
                  </div>
                )}
             </div>

          {activeTab !== 'Historial' && (
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-agri-500/5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <label 
                  onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input && 'showPicker' in input) {
                      (input as any).showPicker();
                    }
                  }}
                  className="relative flex items-center gap-3 px-4 py-2 rounded-2xl border-2 border-transparent bg-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] hover:shadow-lg hover:border-agri-100 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="p-1.5 bg-agri-50 rounded-lg text-agri-600 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-[170px]">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Semana</span>
                    <input 
                      type="week" 
                      value={semanaSeleccionada} 
                      onChange={e => setSemanaSeleccionada(e.target.value)}
                      className="text-sm border-none outline-none bg-transparent font-black text-gray-900 focus:ring-0 cursor-pointer p-0 h-5 w-full pr-2" 
                    />
                  </div>
                </label>
              </div>

              {activeTab === 'Rayas' && rayasActuales.length > 0 && !isCerrada && (
                <div className="relative group/refresh flex items-center gap-2">
                  <button onClick={() => generarNominaActiva(semanaSeleccionada)}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-agri-100 bg-white text-agri-700 hover:bg-agri-50 hover:border-agri-200 shadow-sm text-xs font-black uppercase tracking-wider transition-all active:scale-95">
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Actualizar Personal</span>
                  </button>
                  
                  <div className="p-1.5 bg-gray-100/50 text-gray-400 rounded-lg hover:bg-agri-50 hover:text-agri-600 transition-colors cursor-help group/help">
                    <HelpCircle className="w-4 h-4" />
                    
                    {/* Tooltip para el botón de ayuda (?) */}
                    <div className="absolute right-0 top-12 w-64 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 z-50 opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all duration-300 translate-y-2 group-hover/help:translate-y-0 text-left pointer-events-none">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50">
                        <div className="p-1.5 bg-agri-50 rounded-lg text-agri-600">
                          <RefreshCw className="w-3 h-3" />
                        </div>
                        <p className="text-[10px] font-black text-agri-600 uppercase tracking-widest">Sincronizar Plantilla</p>
                      </div>
                      <p className="text-[10px] font-bold text-gray-900 leading-tight">
                        Este botón importa a todos los empleados marcados como <span className="text-agri-600">"Activos"</span> en el catálogo para esta semana.
                      </p>
                      <p className="text-[9px] text-gray-400 font-medium leading-tight mt-2">
                        Úsalo si agregaste empleados nuevos o si la lista está vacía. No borrará las asistencias ya marcadas.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'Rayas' && isCerrada && (
                <button onClick={() => navigate(`/nomina/pago/${semanaSeleccionada}`, { state: { from: window.location.pathname } })}
                  className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-100 text-xs font-black uppercase tracking-wider transition-all active:scale-95">
                  <CircleDollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">Pagar Nómina</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div>
          {/* === CUADRILLAS TAB === */}
          {activeTab === 'Cuadrillas' && (
            <div className="p-6">
              {cuadrillasActuales.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Actividad de Semana</p>
                      <h2 className="text-xl font-black text-gray-900">{getDatesFromWeek(semanaSeleccionada)}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jornadas</p>
                      <p className="text-lg font-black text-gray-900">{cuadrillasActuales.length}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Estimado</p>
                      <p className="text-lg font-black text-agri-600">${calcularTotalCuadrillas().global.toLocaleString()}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pagado</p>
                      <p className="text-lg font-black text-green-600">${calcularTotalCuadrillas().pagado.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {cuadrillasActuales.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <Users className="w-16 h-16 text-gray-300 mb-4" />
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Sin Cuadrillas</h2>
                  <p className="text-gray-500 max-w-sm mb-6">Registra la asistencia de una cuadrilla para la semana <strong>{semanaSeleccionada}</strong> para comenzar.</p>
                  <button onClick={() => setShowModalCuadrilla(true)}
                    className="bg-agri-600 text-white font-medium px-6 py-3 rounded-xl shadow-md hover:bg-agri-700 active:scale-95 transition-all flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Registrar Cuadrilla
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cuadrillasActuales.map(c => {
                    const totalDiario = (c.personas * c.tarifa) + c.flete + c.comida + c.otrosGastos;
                    const pagado = c.pagos?.reduce((s, pg) => s + pg.monto, 0) || 0;
                    const porc = totalDiario > 0 ? Math.min(100, Math.round((pagado / totalDiario) * 100)) : 0;
                    
                    const statusColor = c.status === 'Pagada'
                      ? { bar: 'bg-green-500', badge: 'bg-green-100 text-green-700', icon: 'bg-green-50 text-green-600' }
                      : pagado > 0
                        ? { bar: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', icon: 'bg-blue-50 text-blue-600' }
                        : { bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700', icon: 'bg-orange-50 text-orange-600' };

                    return (
                      <div
                        key={c.id}
                        onClick={() => navigate(`/nomina/cabo-pago/${c.id}`, { state: { from: window.location.pathname } })}
                        className="group bg-white border border-gray-100 rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                      >
                        <div className={`h-1.5 w-full ${statusColor.bar}`} />
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 group-hover:text-agri-600 transition-colors">{c.cabo}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.fecha}</p>
                            </div>
                            <div className="flex items-center gap-1.5 group/status relative">
                              <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest ${statusColor.badge}`}>
                                  {c.status === 'Pagada' ? 'Liquidada ✓' : pagado > 0 ? 'Parcial' : 'Pendiente'}
                              </span>
                              <div className="text-gray-400 hover:text-agri-600 transition-colors cursor-help">
                                <HelpCircle className="w-3.5 h-3.5" />
                              </div>
                              
                              {/* Tooltip Content */}
                              <div className="absolute right-0 top-8 w-48 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 z-50 opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all duration-300 translate-y-2 group-hover/status:translate-y-0">
                                <p className="text-[10px] font-black text-agri-600 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">Estados de Pago</p>
                                <div className="space-y-3">
                                  <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-900 leading-none">Pendiente</p>
                                      <p className="text-[9px] text-gray-400 font-medium leading-tight mt-1">Sin abonos registrados aún.</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-900 leading-none">Parcial</p>
                                      <p className="text-[9px] text-gray-400 font-medium leading-tight mt-1">Con abonos, pero saldo pendiente.</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1 shrink-0" />
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-900 leading-none">Liquidada</p>
                                      <p className="text-[9px] text-gray-400 font-medium leading-tight mt-1">Total cubierto en su totalidad.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="flex items-center gap-1.5 text-[10px] font-black bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-100 uppercase tracking-wide">
                                <MapPin className="w-3 h-3" /> {c.huerta}
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-black bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-wide">
                                <Users className="w-3 h-3" /> {c.personas} Personas
                            </span>
                          </div>

                          <div className="mb-4 mt-auto">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Costo Diario</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black text-gray-900">${totalDiario.toLocaleString()}</span>
                                <span className="text-xs font-bold text-gray-400">total</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-700 ${statusColor.bar}`}
                                        style={{ width: `${porc}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-gray-500">{porc}%</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Desglose</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <CircleDollarSign className="w-3 h-3 text-gray-400" />
                                      <span>Fija: ${c.personas * c.tarifa}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <CircleDollarSign className="w-3 h-3 text-gray-400" />
                                      <span>Ayudas: ${c.flete + c.comida}</span>
                                    </div>
                                    {c.otrosGastos > 0 && (
                                      <div className="flex items-center gap-1">
                                        <CircleDollarSign className="w-3 h-3 text-gray-400" />
                                        <span>Otros: ${c.otrosGastos}</span>
                                      </div>
                                    )}
                                </div>
                            </div>
                            <div className={`p-2 rounded-xl ${statusColor.icon} group-hover:scale-110 transition-transform`}>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}


          {/* === RAYAS TAB === */}
          {activeTab === 'Rayas' && (
            <div>
              {rayasActuales.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-agri-50 text-agri-600">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Actividad de Semana</p>
                      <h2 className="text-xl font-black text-gray-900">{getDatesFromWeek(semanaSeleccionada)}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jornales</p>
                      <p className="text-lg font-black text-gray-900">{rayasActuales.length}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Nómina</p>
                      <p className="text-lg font-black text-agri-600">${calcularGlobalAcumulado().toLocaleString()}</p>
                    </div>
                    <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                    <div className="text-right group/status relative">
                      <div className="flex items-center gap-1 justify-end">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pagado</p>
                        <HelpCircle className="w-3 h-3 text-gray-400 mb-1 cursor-help" />
                      </div>
                      <p className="text-lg font-black text-green-600">${pagoSemanalTotal.toLocaleString()}</p>
                      
                      {/* Tooltip Content */}
                      <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 z-50 opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all duration-300 translate-y-2 group-hover/status:translate-y-0 text-left">
                        <p className="text-[10px] font-black text-agri-600 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">Estados de Nómina</p>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                            <div>
                              <p className="text-[10px] font-bold text-gray-900 leading-none">Pendiente</p>
                              <p className="text-[9px] text-gray-400 font-medium leading-tight mt-1">Sin pagos registrados.</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                            <div>
                              <p className="text-[10px] font-bold text-gray-900 leading-none">Parcial</p>
                              <p className="text-[9px] text-gray-400 font-medium leading-tight mt-1">Pagos incompletos.</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1 shrink-0" />
                            <div>
                              <p className="text-[10px] font-bold text-gray-900 leading-none">Pagada</p>
                              <p className="text-[9px] text-gray-400 font-medium leading-tight mt-1">Monto total liquidado.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-px h-10 bg-gray-100 hidden sm:block" />
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estado</p>
                      <p className={`text-sm font-black uppercase tracking-widest ${isCerrada ? 'text-green-600' : 'text-orange-500'}`}>
                        {isCerrada ? 'Cerrada' : 'EN CURSO'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
                <div className="overflow-x-auto">
                {rayasActuales.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <Users className="w-16 h-16 text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Nómina No Inicializada</h2>
                    <p className="text-gray-500 max-w-sm mb-6">Genera la nómina para traer a todos los empleados activos para la semana <strong>{semanaSeleccionada}</strong>.</p>
                    <button onClick={() => generarNominaActiva(semanaSeleccionada)}
                      className="bg-agri-600 text-white font-medium px-6 py-3 rounded-xl shadow-md hover:bg-agri-700 active:scale-95 transition-all flex items-center gap-2">
                      <Plus className="w-5 h-5" /> Crear Nómina para esta Semana
                    </button>
                  </div>
                ) : (
                  <>
                    <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-gray-500 font-black border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] relative z-20">
                      <tr className="bg-white/80 backdrop-blur-md sticky top-0">
                        <th className="px-6 py-5 sticky left-0 bg-white/95 backdrop-blur-md z-30 border-r border-gray-100 w-72 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                          Nombre
                        </th>
                        {diasHeader.map(d => (
                          <th key={d} className="px-2 py-5 text-center min-w-[80px] border-r border-gray-100">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="text-gray-400">{d}</span>
                              {!isCerrada && (
                                <button 
                                  onClick={() => { setAsistenciaMasiva(semanaSeleccionada, d, true); addToast(`Asistencia marcada para todos`, 'success'); }}
                                  className="p-1 hover:bg-agri-50 rounded-lg text-agri-500 transition-all hover:scale-110 active:scale-95 bg-white border border-gray-100 shadow-sm"
                                  title="Marcar todos"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                        <th className="px-8 py-5 text-right font-black text-agri-600 bg-white/80 backdrop-blur-md">
                          TOTAL SEMANA
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {paginatedRayas.map(r => (
                         <tr key={r.id} 
                           className={`group transition-all ${isCerrada ? 'hover:bg-agri-50/50 cursor-pointer' : 'hover:bg-gray-50/30'}`}
                           onClick={() => isCerrada && navigate(`/nomina/pago/${semanaSeleccionada}`, { state: { from: window.location.pathname } })}
                         >
                          <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-inherit z-10 border-r border-gray-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] transition-colors">
                            <div className="flex flex-col">
                              <p className="font-black text-gray-900 leading-tight mb-1">{r.empleadoNombre}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">{r.puesto}</span>
                                <span className="text-xs font-black text-agri-600">${r.sueldoDiario}</span>
                              </div>
                            </div>
                          </td>
                          {diasHeader.map(d => {
                            const diaData = r.asistencia[d];
                            const hasExtra = diaData.horasExtra > 0 || diaData.bonoExtra > 0;
                            return (
                              <td key={d} className="px-2 py-4 text-center border-r border-gray-50 align-top">
                                <div className="flex flex-col items-center gap-2">
                                  <button 
                                    disabled={isCerrada} 
                                    onClick={(e) => { e.stopPropagation(); if (!isCerrada) toggleAsistencia(r.id, d); }}
                                    className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 shadow-sm border ${
                                      diaData.asistio 
                                        ? 'bg-agri-500 text-white border-agri-600 scale-105 shadow-agri-100' 
                                        : 'bg-white text-gray-300 border-gray-100 hover:border-gray-300'
                                    } ${isCerrada ? 'cursor-not-allowed grayscale-[0.5]' : 'hover:scale-110 active:scale-90 hover:shadow-md'}`}
                                  >
                                    {diaData.asistio ? '✓' : '-'}
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleOpenExtras(r.id, d, diaData.horasExtra, diaData.bonoExtra); }}
                                    className={`text-[9px] w-full py-1 rounded-xl font-black uppercase tracking-tighter border-2 transition-all ${
                                      hasExtra 
                                        ? 'bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-200' 
                                        : 'bg-gray-50/50 text-gray-400 border-transparent hover:bg-gray-100 shadow-inner'
                                    } ${isCerrada && !hasExtra ? 'opacity-40 grayscale animate-none pointer-events-none' : 'hover:scale-105 active:scale-95'}`}>
                                    {hasExtra 
                                      ? `${diaData.horasExtra > 0 ? `+${diaData.horasExtra}H` : ''}${diaData.bonoExtra > 0 ? ` +$${diaData.bonoExtra}` : ''}` 
                                      : (!isCerrada && 'EXTRAS')}
                                  </button>
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-8 py-4 text-right">
                            <p className="text-2xl font-black text-gray-900 group-hover:text-agri-600 transition-colors">${calcularTotalRaya(r).toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Bruto Acumulado</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-500">
                          Mostrando <span className="font-black text-gray-900">{paginatedRayas.length}</span> de <span className="font-black text-gray-900">{rayasActuales.length}</span> empleados
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-9 h-9 rounded-xl text-xs font-black transition-all active:scale-90 ${
                              currentPage === page
                                ? 'bg-agri-600 text-white shadow-lg shadow-agri-100'
                                : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            </div>
          )}

          {activeTab === 'Historial' && (
            <div className="p-6">
              {historialSemanas.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mb-4" />
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Sin Historial</h2>
                  <p className="text-gray-500 max-w-sm">Cierra una nómina semanal o registra una cuadrilla para ver el historial.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {historialSemanas.map(item => {
                    const porc = item.total > 0 ? Math.min(100, Math.round((item.pagado / item.total) * 100)) : 0;
                    const statusColor = item.isPagada
                      ? { bar: 'bg-green-500', badge: 'bg-green-100 text-green-700', icon: 'bg-green-50 text-green-600', border: 'border-green-400' }
                      : item.pagado > 0
                        ? { bar: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', icon: 'bg-blue-50 text-blue-600', border: 'border-blue-400' }
                        : { bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700', icon: 'bg-orange-50 text-orange-600', border: 'border-orange-400' };
                    return (
                      <div
                        key={item.semana}
                        onClick={() => navigate(`/nomina/historial/${item.semana}`)}
                        className={`group relative bg-white border border-gray-100 rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}
                      >
                        {/* Accent top bar */}
                        <div className={`h-1.5 w-full ${statusColor.bar}`} />

                        <div className="p-6">
                          {/* Header row */}
                          <div className="flex items-start justify-between mb-5">
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                                {item.semana.replace('W', 'Semana ').replace('-', ' — ')}
                              </p>
                              <p className="text-[11px] font-bold text-agri-600 mb-2">
                                {getDatesFromWeek(item.semana)}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {item.hasNomina && (
                                  <span className="text-[10px] bg-agri-50 text-agri-600 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-agri-100">
                                    Nómina
                                  </span>
                                )}
                                {item.numCuadrillas > 0 && (
                                  <span className="text-[10px] bg-purple-50 text-purple-600 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-purple-100">
                                    {item.numCuadrillas} Cuadrilla{item.numCuadrillas > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 group/status relative">
                              <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${statusColor.badge}`}>
                                {item.isPagada ? '✓ Liquidada' : item.pagado > 0 ? 'Parcial' : 'Pendiente'}
                              </span>
                              <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                              
                              {/* Tooltip Content */}
                              <div className="absolute right-0 top-8 w-48 bg-white border border-gray-100 shadow-2xl rounded-2xl p-4 z-50 opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all duration-300 translate-y-2 group-hover/status:translate-y-0 text-left normal-case tracking-normal">
                                <p className="text-[10px] font-black text-agri-600 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">Estados de la Semana</p>
                                <div className="space-y-3">
                                  <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0" />
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-900 leading-none">Pendiente</p>
                                      <p className="text-[9px] text-gray-400 font-medium leading-tight mt-1">Sin pagos registrados en esta semana.</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-900 leading-none">Parcial</p>
                                      <p className="text-[9px] text-gray-400 font-medium leading-tight mt-1">Actividad pagada parcialmente.</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1 shrink-0" />
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-900 leading-none">Liquidada</p>
                                      <p className="text-[9px] text-gray-400 font-medium leading-tight mt-1">Semana completada satisfactoriamente.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Big amount */}
                          <div className="mb-4">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-3xl font-black text-gray-900">${item.pagado.toLocaleString()}</span>
                              <span className="text-base font-bold text-gray-400">/ ${item.total.toLocaleString()}</span>
                            </div>
                            {item.pendiente > 0 && (
                              <p className="text-xs text-orange-500 font-bold mt-0.5">
                                Pendiente: ${item.pendiente.toLocaleString()}
                              </p>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${statusColor.bar}`}
                              style={{ width: `${porc}%` }}
                            />
                          </div>

                          {/* Financial breakdown footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Efectivo</p>
                                <p className="text-sm font-black text-gray-700">${item.efectivo.toLocaleString()}</p>
                              </div>
                              <div className="w-px h-8 bg-gray-100" />
                              <div>
                                <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Bancario</p>
                                <p className="text-sm font-black text-gray-700">${item.banco.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-gray-400">{porc}%</span>
                              <div className={`p-2 rounded-xl ${statusColor.icon} group-hover:scale-110 transition-transform`}>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )}

      {/* Cabo payment modal removed - moved to NominaCaboPago.tsx */}

      {/* === CUADRILLA FORM MODAL === */}
      {showModalCuadrilla && (
         <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
             {/* Modal Header */}
             <div className="bg-agri-600 px-8 py-4 text-white relative shrink-0">
               <div className="absolute top-4 right-8 p-2 bg-white/20 rounded-xl backdrop-blur-xl">
                 <Users className="w-5 h-5 text-white" />
               </div>
               <h2 className="text-xl font-display text-white italic tracking-tighter uppercase mb-0.5">Registro de Cuadrilla</h2>
               <p className="text-white/60 text-[8px] font-bold uppercase tracking-[0.2em]">Actividad y costos del equipo externo</p>
             </div>
 
             <form onSubmit={handleCuadrillaSubmit} className="p-8 space-y-6">
               {/* Primary Info Set */}
               <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5 text-left">
                      <label className="font-display text-sm text-agri-900 ml-1 opacity-80">Seleccionar Cabo</label>
                     <div className="relative group">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-agri-500 transition-colors" />
                       <select 
                         required 
                         value={formCuadrilla.caboId} 
                         onChange={e => setFormCuadrilla({ ...formCuadrilla, caboId: e.target.value })} 
                          className="w-full bg-agri-50/20 border border-agri-100/30 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-agri-500/10 focus:border-agri-500 transition-all appearance-none cursor-pointer"
                       >
                         <option value="" disabled>Nombre del Cabo...</option>
                         {cabos.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                       </select>
                     </div>
                   </div>
                   <div className="space-y-1.5 text-left">
                     <label className="font-display text-sm text-agri-900 ml-1 opacity-80">Huerta / Sector</label>
                     <div className="relative group">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-agri-500 transition-colors" />
                       <select 
                         required 
                         value={formCuadrilla.huertaId} 
                         onChange={e => setFormCuadrilla({ ...formCuadrilla, huertaId: e.target.value })} 
                          className="w-full bg-agri-50/20 border border-agri-100/30 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-agri-500/10 focus:border-agri-500 transition-all appearance-none cursor-pointer"
                       >
                         <option value="" disabled>Lugar de Trabajo...</option>
                         {huertas.map(h => <option key={h.id} value={h.nombre}>{h.nombre}</option>)}
                       </select>
                     </div>
                   </div>
                 </div>
 
                 <div className="space-y-1.5 text-left">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Fecha de Registro</label>
                   <div className="relative group">
                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-agri-500 transition-colors" />
                     <input 
                       type="date" 
                       required 
                       value={formCuadrilla.fecha} 
                       onChange={e => setFormCuadrilla({ ...formCuadrilla, fecha: e.target.value })} 
                        className="w-full bg-agri-50/20 border border-agri-100/30 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-agri-500/10 focus:border-agri-500 transition-all cursor-pointer" 
                     />
                   </div>
                 </div>
               </div>
 
               {/* Metrics/Costs Partition */}
               <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                 <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Personal</label>
                     <div className="relative">
                       <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input 
                         type="number" 
                         placeholder="Ej: 15" 
                         required 
                         value={formCuadrilla.personas} 
                         onChange={e => setFormCuadrilla({ ...formCuadrilla, personas: e.target.value })} 
                         className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold focus:border-agri-500 outline-none" 
                       />
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tarifa Fija</label>
                     <div className="relative">
                       <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input 
                         type="number" 
                         placeholder="Sueldo base" 
                         required 
                         value={formCuadrilla.tarifa} 
                         onChange={e => setFormCuadrilla({ ...formCuadrilla, tarifa: e.target.value })} 
                         className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold focus:border-agri-500 outline-none" 
                       />
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Flete</label>
                     <div className="relative">
                       <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input 
                         type="number" 
                         placeholder="Transporte" 
                         required 
                         value={formCuadrilla.flete} 
                         onChange={e => setFormCuadrilla({ ...formCuadrilla, flete: e.target.value })} 
                         className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold focus:border-agri-500 outline-none" 
                       />
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Comida</label>
                     <div className="relative">
                       <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input 
                         type="number" 
                         placeholder="Viáticos" 
                         required 
                         value={formCuadrilla.comida} 
                         onChange={e => setFormCuadrilla({ ...formCuadrilla, comida: e.target.value })} 
                         className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold focus:border-agri-500 outline-none" 
                       />
                     </div>
                   </div>
                 </div>
               </div>
 
               {/* Footer Actions */}
               <div className="flex gap-4 pt-2">
                 <button 
                   type="button" 
                   onClick={() => setShowModalCuadrilla(false)} 
                   className="flex-1 px-6 py-4 border border-gray-200 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                 >
                   Cancelar
                 </button>
                 <button 
                   type="submit" 
                   className="flex-1 bg-agri-600 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest hover:bg-agri-700 shadow-xl shadow-agri-100 transition-all active:scale-95"
                 >
                   Guardar Registro
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

      {/* === EXTRAS MODAL === */}
      {showModalExtras && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Edit3 className="w-5 h-5 text-gray-400" /> Extras (Día {selectedDia})</h2>
              <button onClick={() => setShowModalExtras(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleExtrasSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Horas Extras</label>
                <input type="number" min="0" value={formExtras.horasExtra} onChange={e => setFormExtras({ ...formExtras, horasExtra: e.target.value })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" placeholder="Ej: 2" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Extra Económico ($)</label>
                <input type="number" min="0" value={formExtras.bonoExtra} onChange={e => setFormExtras({ ...formExtras, bonoExtra: e.target.value })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm" placeholder="Ej: 500" />
              </div>
              <div className="pt-4 flex gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setShowModalExtras(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-agri-600 text-white rounded-xl font-medium hover:bg-agri-700 shadow-sm">Aplicar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nomina;
