import React, { useState, useMemo } from 'react';
import { 
  X, Banknote, CreditCard, Calendar, 
  DollarSign,
  Wallet, TrendingUp, History,
  Receipt, Search
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';

const Cobranza = () => {
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [modalType, setModalType] = useState<'liquidar' | 'abono' | null>(null);
  const [selectedVentaId, setSelectedVentaId] = useState<string | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const [formValues, setFormValues] = useState({ 
    montoTotal: '', 
    montoAbono: '', 
    metodoPago: 'Cuenta' as 'Efectivo' | 'Cuenta', 
    cuentaId: '', 
    fechaAbono: today, 
    nota: '' 
  });
  
  // Filtering states (matching Gastos implementation)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'period' | 'month' | 'range'>('period');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'thisMonth' | 'lastMonth'>('30d');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Consolidated Store access
  const { 
    folios, 
    setVentaMontoTotal, 
    addAbonoVenta,
    cuentasRaw,
    addToast,
    temporadas,
    activeSeasonId
  } = useStore(useShallow(state => ({
    folios: state.folios,
    setVentaMontoTotal: state.setVentaMontoTotal,
    addAbonoVenta: state.addAbonoVenta,
    cuentasRaw: state.cuentasBancarias,
    addToast: state.addToast,
    temporadas: state.temporadas,
    activeSeasonId: state.activeSeasonId
  })));

  const cuentas = useMemo(() => cuentasRaw.filter(c => c.activo !== false), [cuentasRaw]);

  // Combined Filtering Logic
  const filteredFolios = useMemo(() => {
    return folios.filter(f => {
      // Season filter
      if (activeSeasonId && f.seasonId !== activeSeasonId) return false;

      // search filter (folio, destination)
      const matchesSearch = f.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.destino.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // Date filter (based on sale date - f.fecha)
      const fDate = f.fecha; 
      if (!fDate) return true;

      if (filterType === 'period') {
        const now = new Date();
        if (selectedPeriod === '7d') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return fDate >= sevenDaysAgo.toISOString().substring(0, 10);
        } else if (selectedPeriod === '30d') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return fDate >= thirtyDaysAgo.toISOString().substring(0, 10);
        } else if (selectedPeriod === 'thisMonth') {
          return fDate.substring(0, 7) === now.toISOString().substring(0, 7);
        } else if (selectedPeriod === 'lastMonth') {
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          return fDate.substring(0, 7) === lastMonth.toISOString().substring(0, 7);
        }
      } else if (filterType === 'month') {
        return fDate.substring(0, 7) === selectedMonth;
      } else if (filterType === 'range') {
        if (!dateStart || !dateEnd) return true;
        return fDate >= dateStart && fDate <= dateEnd;
      }
      return true;
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [folios, searchTerm, filterType, selectedPeriod, selectedMonth, dateStart, dateEnd, activeSeasonId]);

  // Robust calculation
  const calcularPagado = (abonos?: any[]) => (abonos || []).reduce((acc, curr) => acc + curr.monto, 0);
  
  const saldoGlobal = filteredFolios.reduce((acc, f) => {
    if (f.montoTotal > 0) return acc + (f.montoTotal - calcularPagado(f.abonos));
    return acc;
  }, 0);

  const abonosGlobales = filteredFolios.reduce((acc, f) => acc + calcularPagado(f.abonos), 0);

  const getStatusInfo = (montoTotal: number, cobrado: number) => {
    const saldo = montoTotal > 0 ? montoTotal - cobrado : 0;
    if (montoTotal === 0) return { label: 'Pte. Precio', color: 'bg-amber-50 text-amber-700 border-amber-100' };
    if (saldo === 0) return { label: 'Liquidado', color: 'bg-green-50 text-green-700 border-green-200' };
    if (cobrado > 0) return { label: 'Abonado', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    return { label: 'Pendiente', color: 'bg-orange-50 text-orange-700 border-orange-200' };
  };

  const handleOpenModal = (type: 'liquidar' | 'abono', id?: string) => {
    if (id) setSelectedVentaId(id);
    setFormValues({ 
      montoTotal: '', 
      montoAbono: '', 
      metodoPago: 'Cuenta', 
      cuentaId: '', 
      fechaAbono: new Date().toISOString().split('T')[0], 
      nota: '' 
    });
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  const handleSelectVenta = (id: string) => {
    setSelectedVentaId(id);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedVentaId(null);
  };

  const selectedVenta = folios.find(f => f.id === selectedVentaId);

  const handleSubmitLiquidar = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVentaId && formValues.montoTotal) {
      setVentaMontoTotal(selectedVentaId, Number(formValues.montoTotal));
      handleCloseModal();
      addToast(`Se ha definido el precio total de la venta ${selectedVenta?.folio} en $${Number(formValues.montoTotal).toLocaleString()}`, 'success');
    }
  };

  const handleSubmitAbono = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVentaId && formValues.montoAbono) {
      if (formValues.metodoPago === 'Cuenta' && !formValues.cuentaId) {
        addToast('Seleccione una cuenta bancaria para el abono.', 'error');
        return;
      }
      addAbonoVenta(selectedVentaId, {
        monto: Number(formValues.montoAbono),
        metodo: formValues.metodoPago,
        ...(formValues.metodoPago === 'Cuenta' && { cuentaId: formValues.cuentaId }),
        fecha: formValues.fechaAbono,
        nota: formValues.nota || undefined
      });
      handleCloseModal();
      addToast(`Abono de $${Number(formValues.montoAbono).toLocaleString()} registrado exitosamente.`, 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="title-primary text-5xl md:text-6xl">Cobranza</h1>
          <p className="subtitle-secondary !text-sm max-w-md">Gestión financiera y seguimiento de ventas y abonos del ciclo actual.</p>
        </div>
      </div>
      
      {viewMode === 'list' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-orange-100 dark:border-orange-500/10 flex items-center justify-between group hover:border-orange-200 dark:hover:border-orange-500/30 transition-all">
              <div className="flex items-center gap-5">
                <div className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 p-5 rounded-3xl group-hover:scale-110 transition-transform shadow-sm"><Wallet className="w-8 h-8" /></div>
                <div>
                  <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Saldo Pendiente (Filtro)</p>
                  <h3 className="text-3xl font-display text-gray-800 dark:text-orange-50 tracking-tight">${saldoGlobal.toLocaleString()}</h3>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-agri-100 dark:border-agri-500/10 flex items-center justify-between group hover:border-agri-200 dark:hover:border-agri-500/30 transition-all">
              <div className="flex items-center gap-5">
                <div className="bg-agri-50 dark:bg-agri-500/10 text-agri-600 dark:text-agri-400 p-5 rounded-3xl group-hover:scale-110 transition-transform shadow-sm"><TrendingUp className="w-8 h-8" /></div>
                <div>
                  <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Histórico Cobrado (Filtro)</p>
                  <h3 className="text-3xl font-display text-gray-900 dark:text-agri-50 tracking-tight">${abonosGlobales.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* FILTERS & SEARCH (Matching Gastos style) */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center gap-4 mb-8">
             <div className="flex bg-gray-50 dark:bg-slate-950 rounded-2xl p-1 shrink-0 border border-transparent dark:border-slate-800">
               {[
                 { id: 'period', label: 'Periodo' },
                 { id: 'month', label: 'Mes' },
                 { id: 'range', label: 'Rango' }
               ].map(t => (
                 <button 
                   key={t.id}
                   onClick={() => setFilterType(t.id as any)}
                   className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filterType === t.id ? 'bg-white dark:bg-slate-800 text-agri-600 dark:text-agri-400 shadow-sm' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                 >
                   {t.label}
                 </button>
               ))}
             </div>
             <div className="h-8 w-px bg-gray-100 dark:bg-slate-800 hidden xl:block" />
             <div className="flex-1 min-w-0">
               {filterType === 'period' && (
                 <div className="flex gap-1 overflow-x-auto no-scrollbar">
                   {[
                     { id: '7d', label: '7 Días' },
                     { id: '30d', label: '30 Días' },
                     { id: 'thisMonth', label: 'Este Mes' },
                     { id: 'lastMonth', label: 'Mes Pasado' }
                   ].map(p => (
                     <button
                       key={p.id}
                       onClick={() => setSelectedPeriod(p.id as any)}
                       className={`px-6 py-2.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${selectedPeriod === p.id ? 'bg-agri-50 dark:bg-agri-950/40 text-agri-700 dark:text-agri-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600'}`}
                     >
                       {p.label}
                     </button>
                   ))}
                 </div>
               )}
               {filterType === 'month' && (
                 <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-6 py-2.5 bg-gray-50 dark:bg-slate-950 rounded-xl text-xs font-black text-gray-700 dark:text-slate-300 outline-none w-full xl:w-48 dark:border dark:border-slate-800" />
               )}
               {filterType === 'range' && (
                 <div className="flex items-center gap-3">
                   <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="px-4 py-2 bg-gray-50 dark:bg-slate-950 rounded-xl text-xs font-black text-gray-700 dark:text-slate-300 dark:border dark:border-slate-800" />
                   <span className="text-gray-300 dark:text-slate-700">—</span>
                   <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="px-4 py-2 bg-gray-50 dark:bg-slate-950 rounded-xl text-xs font-black text-gray-700 dark:text-slate-300 dark:border dark:border-slate-800" />
                 </div>
               )}
             </div>
             <div className="h-8 w-px bg-gray-100 dark:bg-slate-800 hidden xl:block" />
             <div className="relative group xl:w-80">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-slate-600 group-focus-within:text-agri-600" />
                <input placeholder="Buscar por folio o destino..." className="pl-12 pr-6 py-3.5 bg-gray-50 dark:bg-slate-950 rounded-2xl text-sm font-bold text-gray-700 dark:text-slate-300 outline-none w-full dark:border dark:border-slate-800" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
          </div>

          {/* MOBILE CARDS (Hidden on MD+) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredFolios.map(folio => {
                const cobrado = calcularPagado(folio.abonos);
                const saldo = folio.montoTotal > 0 ? folio.montoTotal - cobrado : 0;
                const estaLiquidado = folio.montoTotal > 0 && saldo === 0;
                const info = getStatusInfo(folio.montoTotal, cobrado);

                return (
                  <div 
                    key={folio.id}
                    onClick={() => handleSelectVenta(folio.id)}
                    className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-gray-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all overflow-hidden relative"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl border transition-colors ${estaLiquidado ? 'bg-green-50 dark:bg-agri-500/10 text-green-600 dark:text-agri-400 border-green-100 dark:border-agri-500/20' : 'bg-gray-50 dark:bg-slate-950 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-800'}`}>
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-agri-50 uppercase tracking-tight leading-none mb-1 text-sm">Folio {folio.folio}</p>
                          <div className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg inline-block">
                             <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">
                                {temporadas.find(t => t.id === folio.seasonId)?.nombre || 'Ciclo Indefinido'}
                             </span>
                          </div>
                        </div>
                      </div>
                      <span className={`${info.color} font-black px-2.5 py-1.5 rounded-xl text-[8px] uppercase tracking-widest border shadow-sm`}>
                        {info.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-gray-50/50 dark:border-slate-800/50">
                      <div>
                        <p className="text-gray-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-widest mb-1">Destino</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{folio.destino}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-widest mb-1">Monto Total</p>
                        <p className="text-sm font-black text-slate-900 dark:text-agri-100 italic">
                          {folio.montoTotal === 0 ? 'A DEFINIR' : `$${folio.montoTotal.toLocaleString()}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 dark:text-slate-500 text-[8px] font-black uppercase tracking-widest mb-1 font-sans">Saldo Pendiente</p>
                        <p className={`text-2xl font-black italic tracking-tighter ${estaLiquidado ? 'text-green-600 dark:text-agri-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          ${saldo.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-agri-50 dark:bg-agri-500/10 text-agri-600 dark:text-agri-400 p-3 rounded-2xl">
                        <History className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                );
              })}
           </div>

          {/* DESKTOP TABLE (Hidden on Mobile) */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/50 dark:bg-slate-950/50 text-gray-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                  <tr>
                    <th className="px-8 py-5">Información de Venta</th>
                    <th className="px-8 py-5">Estatus Financiero</th>
                    <th className="px-8 py-5 text-right">Monto Total</th>
                    <th className="px-8 py-5 text-right">Pagado</th>
                    <th className="px-8 py-5 text-right text-orange-600 dark:text-orange-400">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                  {filteredFolios.map(folio => {
                    const cobrado = calcularPagado(folio.abonos);
                    const saldo = folio.montoTotal > 0 ? folio.montoTotal - cobrado : 0;
                    const estaLiquidado = folio.montoTotal > 0 && saldo === 0;

                    return (
                      <tr 
                        key={folio.id} 
                        onClick={() => handleSelectVenta(folio.id)}
                        className="transition-all cursor-pointer hover:bg-agri-50/20 dark:hover:bg-slate-800/40 active:scale-[0.99]"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl border transition-colors ${estaLiquidado ? 'bg-green-50 dark:bg-agri-500/10 text-green-600 dark:text-agri-400 border-green-200 dark:border-agri-500/20' : 'bg-gray-50 dark:bg-slate-950 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-800'}`}>
                              <Receipt className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="font-bold text-slate-900 dark:text-agri-50 uppercase tracking-tight">Folio {folio.folio}</p>
                               <p className="text-agri-400 dark:text-agri-500 text-[10px] font-bold uppercase tracking-widest">{folio.destino} • {folio.peso}</p>
                               <div className="mt-1 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg inline-block">
                                   <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">
                                      {temporadas.find(t => t.id === folio.seasonId)?.nombre || 'Ciclo Indefinido'}
                                   </span>
                                </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          {(() => {
                            const info = getStatusInfo(folio.montoTotal, cobrado);
                            return (
                              <span className={`${info.color} font-black px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-widest border shadow-sm`}>
                                {info.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-8 py-5 text-right font-black text-gray-900 dark:text-slate-100 italic">
                          {folio.montoTotal === 0 ? (
                            <span className="text-gray-300 dark:text-slate-700">A DEFINIR</span>
                          ) : `$${folio.montoTotal.toLocaleString()}`}
                        </td>
                        <td className="px-8 py-5 text-right text-gray-400 dark:text-slate-500 font-bold">
                          {folio.montoTotal === 0 ? '-' : `$${cobrado.toLocaleString()}`}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className={`font-black px-3 py-1.5 rounded-xl text-[11px] uppercase tracking-widest ${estaLiquidado ? 'text-green-600 bg-green-50 dark:bg-agri-500/10 border border-green-100 dark:border-agri-500/20' : 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20'}`}>
                            ${saldo.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : selectedVenta && (
        <div className="animate-in slide-in-from-right duration-500">
           {/* Vista Detalle (Premium Card Style) */}
           <div className="flex items-center justify-between mb-8">
              <button 
                onClick={handleBackToList}
                className="group flex items-center gap-3 text-gray-400 hover:text-gray-900 font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 group-hover:bg-gray-50 dark:group-hover:bg-slate-700 transition-colors">
                  <X className="w-4 h-4 rotate-90" />
                </div>
                Regresar
              </button>
               <div className="flex items-center gap-3">
                   {selectedVenta.montoTotal === 0 ? (
                     <button 
                       onClick={() => handleOpenModal('liquidar')}
                       className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                     >
                       <Receipt className="w-4 h-4" /> Definir Precio
                     </button>
                   ) : (
                     <button 
                       onClick={() => handleOpenModal('abono')}
                       disabled={(selectedVenta.montoTotal - calcularPagado(selectedVenta.abonos)) <= 0}
                       className="flex items-center gap-3 bg-agri-600 hover:bg-agri-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-agri-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <Banknote className="w-4 h-4" /> Registrar Pago
                     </button>
                   )}
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 p-8 flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
                      <div className="flex items-center gap-6">
                          <div className="bg-agri-600 text-white p-5 rounded-[24px] shadow-lg shadow-agri-600/20">
                              <Receipt className="w-8 h-8" />
                          </div>
                          <div>
                              <h2 className="text-3xl font-display text-slate-800 dark:text-agri-50 mb-1 leading-none">Folio {selectedVenta.folio}</h2>
                              <p className="text-agri-400 dark:text-agri-500 font-bold text-xs uppercase tracking-[0.2em] mb-2">{selectedVenta.destino} • {selectedVenta.peso}</p>
                              <div className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl inline-block">
                                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">
                                     {temporadas.find(t => t.id === selectedVenta.seasonId)?.nombre || 'Ciclo Indefinido'}
                                  </span>
                               </div>
                          </div>
                      </div>
                      <div className="flex">
                        {(() => {
                          const info = getStatusInfo(selectedVenta.montoTotal, calcularPagado(selectedVenta.abonos));
                          return (
                            <span className={`${info.color} px-5 py-2 rounded-2xl text-[10px] font-black border uppercase tracking-[0.15em] shadow-sm`}>
                              {info.label}
                            </span>
                          );
                        })()}
                      </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                      <div>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-2">Monto Total</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-slate-50 italic tracking-tighter leading-none">
                             {selectedVenta.montoTotal > 0 ? `$${selectedVenta.montoTotal.toLocaleString()}` : 'PENDIENTE'}
                          </p>
                      </div>
                      <div>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-2">Cobrado</p>
                          <p className="text-2xl font-black text-agri-600 dark:text-agri-400 italic tracking-tighter leading-none">${calcularPagado(selectedVenta.abonos).toLocaleString()}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-2">Saldo</p>
                          <p className="text-2xl font-black text-orange-600 dark:text-orange-400 italic tracking-tighter leading-none">
                             {selectedVenta.montoTotal > 0 ? `$${(selectedVenta.montoTotal - calcularPagado(selectedVenta.abonos)).toLocaleString()}` : '---'}
                          </p>
                      </div>
                  </div>
              </div>

              <div className={`${selectedVenta.montoTotal > 0 ? 'bg-slate-900 shadow-slate-900/20' : 'bg-blue-900 shadow-blue-900/20'} rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-between overflow-hidden relative group transition-all duration-500`}>
                  <div className="relative z-10">
                      <div className="flex mb-4">
                        <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all ${getStatusInfo(selectedVenta.montoTotal, calcularPagado(selectedVenta.abonos)).color}`}>
                          {getStatusInfo(selectedVenta.montoTotal, calcularPagado(selectedVenta.abonos)).label}
                        </span>
                      </div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 mt-4 font-sans">Estado de Cuenta</p>
                      {selectedVenta.montoTotal > 0 ? (
                        <>
                          <div className="flex items-baseline gap-2 mb-2">
                            <h3 className="text-5xl font-display tracking-tight leading-none">
                               {selectedVenta.montoTotal > 0 
                                 ? Math.round((calcularPagado(selectedVenta.abonos) / selectedVenta.montoTotal) * 100) 
                                 : 0}
                             </h3>
                            <span className="text-2xl font-bold text-white/50">%</span>
                          </div>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Progreso de Pago</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-2xl font-black italic tracking-tighter mb-2 uppercase">Por Definir</h3>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-widest leading-relaxed">Requiere asignación de precio final</p>
                        </>
                      )}
                  </div>
                  
                  {selectedVenta.montoTotal > 0 && (
                    <div className="w-full bg-slate-100 h-4 rounded-full mt-6 overflow-hidden relative z-10 p-1 border border-gray-200/50">
                      <div 
                        className="bg-agri-500 h-full rounded-full transition-all duration-[1500ms] ease-out shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                        style={{ width: `${selectedVenta.montoTotal > 0 ? Math.min((calcularPagado(selectedVenta.abonos) / selectedVenta.montoTotal) * 100, 100) : 0}%` }}
                      />
                    </div>
                  )}

                  <div className="absolute -right-8 -bottom-8 text-white/5 transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                      <TrendingUp className="w-48 h-48" />
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mb-8">
              <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                    <h3 className="font-black text-slate-900 dark:text-agri-50 italic uppercase tracking-tight">Historial de Pagos</h3>
                  </div>
                  <span className="bg-gray-50 dark:bg-slate-950 text-gray-400 dark:text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-100 dark:border-slate-800">
                    {selectedVenta.abonos?.length || 0} Registros
                  </span>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-gray-50/50 dark:bg-slate-950/50 text-gray-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.15em]">
                          <tr>
                              <th className="px-8 py-4">Fecha</th>
                              <th className="px-8 py-4">Concepto / Referencia</th>
                              <th className="px-8 py-4">Cuenta Destino</th>
                              <th className="px-8 py-4 text-right">Monto</th>
                              <th className="px-8 py-4 text-center">Estatus</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                          {selectedVenta.abonos?.slice().sort((a, b) => b.fecha.localeCompare(a.fecha)).map(abono => (
                              <tr key={abono.id} className="border-b border-gray-50/50 dark:border-slate-800/30 hover:bg-gray-50/30 dark:hover:bg-slate-800/40 transition-colors">
                                  <td className="px-8 py-5">
                                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{abono.fecha}</p>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 italic uppercase tracking-tighter">Ref: {abono.id.slice(0, 8)}</p>
                                  </td>
                                    <td className="px-8 py-5">
                                      <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-xl ${abono.metodo === 'Efectivo' ? 'bg-green-50 dark:bg-agri-500/10 text-green-600 dark:text-agri-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                            {abono.metodo === 'Efectivo' ? <Banknote className="w-4 h-4"/> : <CreditCard className="w-4 h-4"/>}
                                          </div>
                                          <div>
                                            <p className="font-bold text-slate-900 dark:text-agri-100 text-xs uppercase tracking-tight">{abono.nota || 'Pago a Venta'}</p>
                                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium uppercase tracking-widest">{abono.metodo}</p>
                                          </div>
                                      </div>
                                    </td>
                                  <td className="px-8 py-5 text-gray-500 dark:text-slate-400 font-medium">
                                      {abono.cuentaId ? (cuentas.find(c => c.id === abono.cuentaId)?.nombre || 'BANCO') : 'CAJA EFECTIVO'}
                                  </td>
                                  <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-agri-50 italic">
                                      ${abono.monto.toLocaleString()}
                                  </td>
                                  <td className="px-8 py-5 text-center">
                                      <span className="bg-green-50 dark:bg-agri-500/10 text-green-600 dark:text-agri-400 border border-green-100 dark:border-agri-500/20 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest">Aplicado</span>
                                  </td>
                              </tr>
                          ))}
                          {(!selectedVenta.abonos || selectedVenta.abonos.length === 0) && (
                              <tr>
                                  <td colSpan={5} className="py-20 text-center text-gray-300 dark:text-slate-700 font-bold uppercase tracking-widest italic">No hay pagos registrados</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
           </div>
        </div>
      )}

      {/* MODAL: DEFINIR PRECIO (Standardized) */}
      {modalType === 'liquidar' && selectedVenta && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="bg-agri-600 px-8 py-4 text-white relative shrink-0">
              <div className="absolute top-4 right-8 p-2 bg-white/20 rounded-xl backdrop-blur-xl">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-display text-white italic tracking-tighter uppercase mb-0.5">Definir Precio</h2>
              <p className="text-white/60 text-[8px] font-bold uppercase tracking-[0.2em]">Cerrar liquidación de venta</p>
            </div>
            
            <form onSubmit={handleSubmitLiquidar} className="p-8 space-y-6">
              <div className="bg-agri-50/50 border border-agri-100/50 p-4 rounded-3xl flex justify-between items-center mb-2">
                <span className="text-[10px] text-agri-400 font-black uppercase tracking-widest">Referencia Folio</span>
                <span className="font-black text-sm text-agri-600 uppercase italic tracking-tighter">{selectedVenta.folio}</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-display text-sm text-agri-900 ml-1 opacity-80">Monto Total de Venta ($)</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agri-600 transition-colors">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <input 
                    required 
                    type="number" 
                    min="1" 
                    autoFocus
                    value={formValues.montoTotal} 
                    onChange={e => setFormValues({...formValues, montoTotal: e.target.value})} 
                    className="w-full bg-agri-50/20 border border-agri-100/30 rounded-[24px] pl-16 pr-6 py-4 text-2xl font-black text-slate-900 focus:ring-4 focus:ring-agri-500/10 transition-all outline-none placeholder:text-gray-200 italic" 
                    placeholder="0.00" 
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-agri-600 text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-agri-600/30 hover:bg-agri-700"
                >
                  Cerrar Venta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR ABONO (Standardized) */}
      {modalType === 'abono' && selectedVenta && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-blue-600 px-8 py-4 text-white relative shrink-0">
              <div className="absolute top-4 right-8 p-2 bg-white/20 rounded-xl backdrop-blur-xl">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-display text-white italic tracking-tighter uppercase mb-0.5">Registrar Abono</h2>
              <p className="text-white/60 text-[8px] font-bold uppercase tracking-[0.2em]">Captura de pago recibido</p>
            </div>
            
            <form onSubmit={handleSubmitAbono} className="p-10 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="bg-orange-50/50 p-5 rounded-[24px] flex justify-between items-center border border-orange-100/50 mb-4">
                 <div className="flex flex-col">
                   <span className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-1">Pendiente por Cobrar</span>
                   <span className="text-[10px] text-orange-300 font-bold uppercase tracking-widest italic">{selectedVenta.folio}</span>
                 </div>
                 <span className="font-black text-3xl text-orange-600 italic tracking-tighter">${(selectedVenta.montoTotal - calcularPagado(selectedVenta.abonos)).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="font-display text-sm text-agri-900 ml-1 opacity-80">Monto ($)</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agri-600 transition-colors">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input 
                      required 
                      type="number" 
                      min="1" 
                      max={selectedVenta.montoTotal - calcularPagado(selectedVenta.abonos)} 
                      value={formValues.montoAbono} 
                      onChange={e => setFormValues({...formValues, montoAbono: e.target.value})} 
                      className="w-full bg-agri-50/20 border border-agri-100/30 rounded-[20px] pl-12 pr-6 py-3.5 text-xl font-black text-slate-900 focus:ring-4 focus:ring-agri-500/10 transition-all outline-none italic" 
                      placeholder="0.00" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-display text-sm text-agri-900 ml-1 opacity-80">Fecha</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-agri-600 transition-colors">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      required
                      type="date"
                      value={formValues.fechaAbono}
                      onChange={e => setFormValues({...formValues, fechaAbono: e.target.value})}
                      className="w-full bg-agri-50/20 border border-agri-100/30 rounded-[20px] pl-12 pr-6 py-3.5 text-sm font-black text-slate-900 focus:ring-4 focus:ring-agri-500/10 outline-none transition-all uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 bg-gray-50/50 rounded-[24px] border border-gray-100">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 block">Método de Cobro</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button" 
                    onClick={() => setFormValues({...formValues, metodoPago: 'Efectivo'})} 
                    className={`py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formValues.metodoPago === 'Efectivo' ? 'bg-white text-agri-600 border-agri-500 shadow-xl shadow-agri-500/10 scale-105' : 'bg-transparent text-gray-300 border-gray-100 opacity-60'}`}
                  >
                    <Banknote className="w-5 h-5"/> Efectivo
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormValues({...formValues, metodoPago: 'Cuenta'})} 
                    className={`py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formValues.metodoPago === 'Cuenta' ? 'bg-white text-blue-600 border-blue-500 shadow-xl shadow-blue-500/10 scale-105' : 'bg-transparent text-gray-300 border-gray-100 opacity-60'}`}
                  >
                    <CreditCard className="w-5 h-5"/> Banco
                  </button>
                </div>

                {formValues.metodoPago === 'Cuenta' && (
                  <div className="animate-in slide-in-from-top-4 duration-500 px-1 pt-2">
                    <select
                      required
                      value={formValues.cuentaId}
                      onChange={(e) => setFormValues({...formValues, cuentaId: e.target.value})}
                      className="w-full p-4 bg-white border-2 border-blue-50 rounded-2xl text-[10px] font-black text-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none uppercase tracking-widest"
                    >
                      <option value="" disabled>Seleccionar Cuenta Bancaria</option>
                      {cuentas.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre} {c.banco ? `(${c.banco})` : ''}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Descripción (Opcional)</label>
                <textarea
                  value={formValues.nota}
                  onChange={e => setFormValues({...formValues, nota: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-[24px] px-6 py-4 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-agri-500/10 outline-none h-24 resize-none transition-all placeholder:text-gray-300"
                  placeholder="Ej. Pago con transferencia de Soriana..."
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-50">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 hover:border-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-agri-600 text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-agri-600/30 hover:bg-agri-700"
                >
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cobranza;
