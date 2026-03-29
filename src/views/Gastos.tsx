import React, { useState, useMemo } from 'react';
import { 
  Receipt, X, CreditCard, Banknote, 
  ChevronRight, Calendar, DollarSign, FileText, 
  Coins, Plus, Search, ArrowLeft,
  Leaf, Tractor, Wrench, Building2, Wallet, CheckCircle2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { GastoCategoria } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';

const Gastos = () => {
  // Navigation State
  const [activeCategory, setActiveCategory] = useState<GastoCategoria | null>(null);

  // Modals state
  const [showModalGasto, setShowModalGasto] = useState(false);
  const [showModalNuevoProveedor, setShowModalNuevoProveedor] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date Filtering states
  const [filterType, setFilterType] = useState<'period' | 'month' | 'range'>('period');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'thisMonth' | 'lastMonth'>('30d');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Consolidated Store access
  const {
    gastos, 
    proveedoresRaw, 
    addGasto, 
    addAbonoGasto,
    cuentasRaw,
    addProveedor,
    activeSeasonId,
    temporadas
  } = useStore(useShallow(state => ({
    gastos: state.gastos,
    proveedoresRaw: state.proveedores,
    addGasto: state.addGasto,
    addAbonoGasto: state.addAbonoGasto,
    cuentasRaw: state.cuentasBancarias,
    addProveedor: state.addProveedor,
    activeSeasonId: state.activeSeasonId,
    temporadas: state.temporadas
  })));

  const proveedores = useMemo(() => proveedoresRaw.filter(p => p.activo !== false), [proveedoresRaw]);
  const cuentas = useMemo(() => cuentasRaw.filter(c => c.activo !== false), [cuentasRaw]);

  const gastosConfig: Record<GastoCategoria, { label: string, icon: any, color: string, desc: string }> = {
    'Insumos': { label: 'Insumos', icon: Leaf, color: 'bg-emerald-500', desc: 'Fertilizantes, Semillas, Agroquímicos' },
    'Operativo': { label: 'Operativo', icon: Tractor, color: 'bg-orange-500', desc: 'Combustible, Fletes, Campo' },
    'Mantenimiento': { label: 'Mantenimiento', icon: Wrench, color: 'bg-blue-500', desc: 'Reparaciones, Refacciones, Servicios' },
    'Fijo': { label: 'Gastos Fijos', icon: Building2, color: 'bg-slate-500', desc: 'Rentas, Luz, Agua, Predial' },
    'Caja Chica': { label: 'Caja Chica', icon: Wallet, color: 'bg-rose-500', desc: 'Gastos menores de oficina' },
    'Administrativo': { label: 'Administrativo', icon: FileText, color: 'bg-indigo-500', desc: 'Papelería, Contabilidad, Gestión' }
  };

  const filteredGastos = useMemo(() => {
    return gastos.filter(g => {
      // Season filter
      if (activeSeasonId && g.seasonId !== activeSeasonId) return false;

      // Category filter
      if (activeCategory && g.categoria !== activeCategory) return false;

      // Name/Concept filter
      const matchesSearch = g.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            g.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (g.folio && g.folio.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (!matchesSearch) return false;

      // Date filter
      const gDate = g.fullDate?.substring(0, 10);
      if (!gDate) return true;

      if (filterType === 'period') {
        const now = new Date();
        if (selectedPeriod === '7d') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return gDate >= sevenDaysAgo.toISOString().substring(0, 10);
        } else if (selectedPeriod === '30d') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return gDate >= thirtyDaysAgo.toISOString().substring(0, 10);
        } else if (selectedPeriod === 'thisMonth') {
          return g.fullDate?.substring(0, 7) === now.toISOString().substring(0, 7);
        } else if (selectedPeriod === 'lastMonth') {
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          return g.fullDate?.substring(0, 7) === lastMonth.toISOString().substring(0, 7);
        }
      } else if (filterType === 'month') {
        return g.fullDate?.substring(0, 7) === selectedMonth;
      } else if (filterType === 'range') {
        if (!dateStart || !dateEnd) return true;
        return gDate >= dateStart && gDate <= dateEnd;
      }
    }).sort((a, b) => {
      if (!a.fullDate) return 1;
      if (!b.fullDate) return -1;
      return b.fullDate.localeCompare(a.fullDate);
    });
  }, [gastos, searchTerm, filterType, selectedMonth, dateStart, dateEnd, activeCategory, activeSeasonId]);

  const [formGasto, setFormGasto] = useState({ 
    proveedorId: '', 
    concepto: '', 
    monto: '', 
    folio: '', 
    fecha: new Date().toISOString().substring(0, 10),
    tieneComprobante: false, 
    metodo: 'Efectivo' as 'Efectivo' | 'Cuenta' | 'Crédito', 
    cuentaId: '',
    categoria: 'Operativo' as GastoCategoria,
    seasonId: activeSeasonId || ''
  });

  const [showAbonoModal, setShowAbonoModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedGastoId, setSelectedGastoId] = useState<string | null>(null);
  const [formAbono, setFormAbono] = useState({ 
    monto: '', 
    nota: '', 
    metodo: 'Efectivo' as 'Efectivo' | 'Cuenta', 
    cuentaId: '',
    fecha: new Date().toISOString().substring(0, 10)
  });
  const [abonoError, setAbonoError] = useState<string | null>(null);

  const [newProveedorForm, setNewProveedorForm] = useState({ nombre: '', rfc: '', telefono: '' });

  const handleQuickProveedorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProveedorForm.nombre) return;
    
    // addProveedor now returns the full record
    const nuevo = addProveedor({
      nombre: newProveedorForm.nombre,
      rfc: newProveedorForm.rfc,
      telefono: newProveedorForm.telefono
    });
    
    // Auto-select the NEW supplier ID in the source form
    if (nuevo && nuevo.id) {
      setFormGasto(prev => ({ ...prev, proveedorId: nuevo.id }));
    }
    
    setShowModalNuevoProveedor(false);
    setNewProveedorForm({ nombre: '', rfc: '', telefono: '' });
  };

  const handleGastoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if category requires a registered supplier
    const needsRegisteredSupplier = ['Insumos', 'Fijo', 'Operativo'].includes(formGasto.categoria);
    
    if (needsRegisteredSupplier && !formGasto.proveedorId) {
      return alert('Seleccione un proveedor obligatorio para esta categoría');
    }

    // Determine the name to store. If it's a select, get the name. If text, use the text.
    let proveedorName = formGasto.proveedorId;
    if (needsRegisteredSupplier) {
      const p = proveedores.find(prov => prov.id === formGasto.proveedorId);
      if (p) proveedorName = p.nombre;
    }

    addGasto({
      proveedor: proveedorName || 'Gasto General', 
      concepto: formGasto.concepto, 
      monto: Number(formGasto.monto), 
      folio: formGasto.folio, 
      fullDate: formGasto.fecha,
      tieneComprobante: formGasto.tieneComprobante,
      metodo: formGasto.metodo,
      ...(formGasto.metodo === 'Cuenta' && { cuentaId: formGasto.cuentaId }),
      categoria: formGasto.categoria,
      seasonId: formGasto.seasonId
    });
    setShowModalGasto(false);
    setFormGasto({ 
      proveedorId: '', 
      concepto: '', 
      monto: '', 
      folio: '', 
      fecha: new Date().toISOString().substring(0, 10),
      tieneComprobante: false, 
      metodo: 'Efectivo', 
      cuentaId: '',
      categoria: activeCategory || 'Operativo',
      seasonId: activeSeasonId || ''
    });
  };

  const handleAbonoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGastoId) return;
    
    const gasto = gastos.find(g => g.id === selectedGastoId);
    if (gasto) {
      const totalAbonado = gasto.abonos?.reduce((acc, a) => acc + a.monto, 0) || 0;
      const saldoPendiente = gasto.monto - totalAbonado;
      const montoAbono = Number(formAbono.monto);
      
      if (montoAbono <= 0) {
        setAbonoError('El monto debe ser mayor a 0');
        return;
      }
      if (montoAbono > saldoPendiente) {
        setAbonoError(`El monto ($${montoAbono.toLocaleString()}) supera el saldo pendiente ($${saldoPendiente.toLocaleString()})`);
        return;
      }
    }

    if (formAbono.metodo === 'Cuenta' && !formAbono.cuentaId) {
      setAbonoError('Seleccione una cuenta bancaria');
      return;
    }

    setAbonoError(null);
    addAbonoGasto(selectedGastoId, {
      monto: Number(formAbono.monto),
      fecha: formAbono.fecha,
      metodo: formAbono.metodo,
      ...(formAbono.metodo === 'Cuenta' && { cuentaId: formAbono.cuentaId }),
      nota: formAbono.nota
    });
    setShowAbonoModal(false);
    setFormAbono({ 
      monto: '', 
      nota: '', 
      metodo: 'Efectivo', 
      cuentaId: '', 
      fecha: new Date().toISOString().substring(0, 10) 
    });
  };

  const stats = useMemo(() => {
    const total = filteredGastos.reduce((s, g) => s + (g.monto || 0), 0);
    const pendiente = filteredGastos.reduce((s, g) => {
      if (g.metodo !== 'Crédito') return s;
      const pagado = g.abonos?.reduce((acc: number, a: any) => acc + (a.monto || 0), 0) || 0;
      return s + ((g.monto || 0) - pagado);
    }, 0);
    return { total, pendiente };
  }, [filteredGastos]);

  const selectCategory = (cat: GastoCategoria) => {
    setActiveCategory(cat);
    setFormGasto(prev => ({ ...prev, categoria: cat }));
    window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            {activeCategory && (
              <button 
                onClick={() => setActiveCategory(null)}
                className="p-3 bg-white border border-agri-100 rounded-2xl text-agri-600 hover:bg-agri-50 transition-all active:scale-95 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-5xl md:text-6xl font-display text-agri-900 tracking-tight">
              {activeCategory ? activeCategory : 'Gastos'}
            </h1>
          </div>
          <p className="text-agri-400 text-sm font-medium max-w-md leading-relaxed italic">
            {activeCategory ? gastosConfig[activeCategory].desc : 'Centro de control financiero de salidas y compras.'}
          </p>
        </div>

        {activeCategory && (
          <button 
            onClick={() => setShowModalGasto(true)}
            className="bg-agri-600 hover:bg-agri-700 text-white px-8 py-4 rounded-3xl shadow-xl shadow-agri-600/20 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Registrar Gasto
          </button>
        )}
      </div>

      {/* DASHBOARD GRID */}
      {!activeCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Object.entries(gastosConfig) as [GastoCategoria, any][]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => selectCategory(key)}
              className="group relative bg-white rounded-[2.5rem] p-8 border border-agri-100/50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-left overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${config.color} opacity-[0.03] rounded-bl-[5rem] transition-all group-hover:scale-110`} />
              
              <div className="flex flex-col h-full relative z-10">
                <div className={`w-16 h-16 ${config.color} rounded-3xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <config.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-display text-agri-900 mb-2">{config.label}</h3>
                <p className="text-agri-400 text-sm font-medium leading-relaxed mb-6">{config.desc}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-agri-600 bg-agri-50 px-4 py-2 rounded-xl border border-agri-100 group-hover:bg-agri-600 group-hover:text-white transition-colors duration-300">Entrar</span>
                  <ChevronRight className="w-5 h-5 text-agri-200 group-hover:text-agri-600 transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
               <div className={`p-5 ${gastosConfig[activeCategory].color} text-white rounded-3xl shadow-lg`}>
                  <DollarSign className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Seleccionado</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tighter">${stats.total.toLocaleString()}</p>
               </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
               <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl border border-blue-100 shadow-inner">
                  <FileText className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Transacciones</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tighter">{filteredGastos.length} <span className="text-xs font-bold text-gray-400">registros</span></p>
               </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
               <div className="p-5 bg-red-50 text-red-600 rounded-3xl border border-red-100 shadow-inner">
                  <Coins className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Saldo Pendiente</p>
                  <p className="text-3xl font-black text-red-600 tracking-tighter">${stats.pendiente.toLocaleString()}</p>
               </div>
            </div>
          </div>

          {/* FILTERS & SEARCH */}
          <div className="bg-white p-3 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center gap-4">
             <div className="flex bg-gray-50 rounded-2xl p-1 shrink-0">
               {[
                 { id: 'period', label: 'Periodo' },
                 { id: 'month', label: 'Mes' },
                 { id: 'range', label: 'Rango' }
               ].map(t => (
                 <button 
                   key={t.id}
                   onClick={() => setFilterType(t.id as any)}
                   className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filterType === t.id ? 'bg-white text-agri-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   {t.label}
                 </button>
               ))}
             </div>
             <div className="h-8 w-px bg-gray-100 hidden xl:block" />
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
                       className={`px-6 py-2.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${selectedPeriod === p.id ? 'bg-agri-50 text-agri-700' : 'text-gray-400 hover:text-gray-600'}`}
                     >
                       {p.label}
                     </button>
                   ))}
                 </div>
               )}
               {filterType === 'month' && (
                 <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-6 py-2.5 bg-gray-50 rounded-xl text-xs font-black text-gray-700 outline-none w-full xl:w-48" />
               )}
               {filterType === 'range' && (
                 <div className="flex items-center gap-3">
                   <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-black text-gray-700" />
                   <span className="text-gray-300">—</span>
                   <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="px-4 py-2 bg-gray-50 rounded-xl text-xs font-black text-gray-700" />
                 </div>
               )}
             </div>
             <div className="h-8 w-px bg-gray-100 hidden xl:block" />
             <div className="relative group xl:w-80">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-agri-600" />
                <input placeholder="Buscar por proveedor o concepto..." className="pl-12 pr-6 py-3.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 outline-none w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
             </div>
          </div>

          {/* LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGastos.map((gasto) => {
              const totalAbonado = gasto.abonos?.reduce((acc, a) => acc + a.monto, 0) || 0;
              const saldoPendiente = gasto.monto - totalAbonado;
              const config = activeCategory ? gastosConfig[activeCategory] : null;

              return (
                <div 
                  key={gasto.id} 
                  onClick={() => {
                    setSelectedGastoId(gasto.id);
                    setShowDetailModal(true);
                  }}
                  className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 cursor-pointer relative"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-3xl ${config ? config.color : 'bg-agri-600'} text-white shadow-lg shadow-agri-900/10`}>
                        <Receipt className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-display text-agri-900 truncate max-w-[150px] italic">{gasto.proveedor}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-300" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{gasto.fecha}</p>
                        </div>
                        <div className="mt-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-lg inline-block">
                           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                              {temporadas.find(t => t.id === gasto.seasonId)?.nombre || 'Ciclo Indefinido'}
                           </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100/50 mb-6">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 leading-none">Concepto</p>
                    <p className="text-sm font-bold text-gray-700 leading-relaxed italic truncate">"{gasto.concepto}"</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[9px] font-black text-agri-500 bg-white px-3 py-1.5 rounded-xl border border-agri-100 shadow-sm">F: {gasto.folio || 'N/A'}</span>
                      {gasto.metodo === 'Crédito' && (
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase border shadow-sm ${
                          gasto.status === 'Pagado' ? 'bg-green-50 text-green-600 border-green-100' : 
                          gasto.status === 'Parcial' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {gasto.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Total Pagado</p>
                      <p className="text-3xl font-black text-agri-900 tracking-tighter">${gasto.monto.toLocaleString()}</p>
                    </div>
                    {gasto.metodo === 'Crédito' && saldoPendiente > 0 && (
                      <div className="text-right">
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1 leading-none">Saldo</p>
                        <p className="text-xl font-black text-red-600 tracking-tighter">${saldoPendiente.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {gasto.syncStatus === 'pending' && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MODAL GASTO */}
      {showModalGasto && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
            <div className={`px-8 py-5 text-white relative shrink-0 ${activeCategory ? gastosConfig[activeCategory].color : 'bg-agri-600'}`}>
              <div className="flex flex-col">
                <h2 className="text-xl font-display leading-none">Registrar Gasto</h2>
                <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em] mt-1">{activeCategory || 'Operativo'}</p>
              </div>
              <button 
                onClick={() => setShowModalGasto(false)}
                className="absolute top-1/2 -translate-y-1/2 right-8 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleGastoSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black text-agri-900/40 uppercase tracking-widest ml-2">
                      {['Insumos', 'Fijo', 'Operativo'].includes(formGasto.categoria) ? 'Proveedor' : 'Beneficiario'}
                    </label>
                    {['Insumos', 'Fijo', 'Operativo'].includes(formGasto.categoria) && (
                      <button 
                        type="button" 
                        onClick={() => setShowModalNuevoProveedor(true)}
                        className="text-[8px] font-black text-agri-600 hover:text-agri-700 transition-colors uppercase tracking-widest"
                      >
                        + Nuevo
                      </button>
                    )}
                  </div>
                  
                  {['Insumos', 'Fijo', 'Operativo'].includes(formGasto.categoria) ? (
                    <select 
                      required 
                      value={formGasto.proveedorId} 
                      onChange={e => setFormGasto({...formGasto, proveedorId: e.target.value})} 
                      className="w-full bg-agri-50/50 border border-agri-100/50 rounded-2xl px-5 py-3 text-xs font-bold text-agri-900 focus:ring-4 focus:ring-agri-500/10 outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Seleccionar Proveedor...</option>
                      {proveedores.map(prov => (
                        <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      value={formGasto.proveedorId} 
                      onChange={e => setFormGasto({...formGasto, proveedorId: e.target.value})} 
                      className="w-full bg-agri-50/50 border border-agri-100/50 rounded-2xl px-5 py-3 text-xs font-bold text-agri-900 focus:ring-4 focus:ring-agri-500/10 outline-none" 
                      placeholder="Ej: Taller Mecánico..."
                    />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-black text-agri-900/40 uppercase tracking-widest ml-2">Concepto</label>
                    <input 
                      required 
                      type="text" 
                      value={formGasto.concepto} 
                      onChange={e => setFormGasto({...formGasto, concepto: e.target.value})} 
                      className="w-full bg-agri-50/50 border border-agri-100/50 rounded-2xl px-5 py-3 text-xs font-bold text-agri-900 focus:ring-4 focus:ring-agri-500/10 outline-none" 
                      placeholder="Descripción del gasto"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-agri-900/40 uppercase tracking-widest ml-2">Folio</label>
                    <input type="text" value={formGasto.folio} onChange={e => setFormGasto({...formGasto, folio: e.target.value})} className="w-full bg-agri-50/50 border border-agri-100/50 rounded-2xl px-5 py-3 text-xs font-bold text-agri-900 focus:ring-4 focus:ring-agri-500/10 outline-none text-center" placeholder="XXX" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-agri-900/40 uppercase tracking-widest ml-2">Importe ($)</label>
                    <input required type="number" step="0.01" value={formGasto.monto} onChange={e => setFormGasto({...formGasto, monto: e.target.value})} className="w-full bg-agri-50/50 border border-agri-100/50 rounded-2xl px-5 py-3 text-base font-black text-agri-600 focus:ring-4 focus:ring-agri-500/10 outline-none text-center" placeholder="0.00" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-agri-900/40 uppercase tracking-widest ml-2">Fecha</label>
                    <input required type="date" value={formGasto.fecha} onChange={e => setFormGasto({...formGasto, fecha: e.target.value})} className="w-full bg-agri-50/50 border border-agri-100/50 rounded-2xl px-5 py-3 text-xs font-bold text-agri-900 focus:ring-4 focus:ring-agri-500/10 outline-none" />
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-agri-50/30 rounded-2xl border border-agri-100/50">
                  <label className="text-[9px] font-black text-agri-900/40 uppercase tracking-widest ml-2 block leading-none">Método de Pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Efectivo', 'Cuenta', 'Crédito'].map((m: any) => (
                      <button 
                        key={m} 
                        type="button" 
                        onClick={() => setFormGasto({...formGasto, metodo: m})} 
                        className={`py-3 rounded-xl flex items-center justify-center gap-2 text-[9px] font-black transition-all border ${formGasto.metodo === m ? 'bg-white text-agri-600 border-agri-600 shadow-sm scale-105' : 'bg-transparent text-gray-300 border-agri-100/50'}`}
                      >
                         {m === 'Efectivo' ? <Banknote size={12}/> : m === 'Cuenta' ? <CreditCard size={12}/> : <Coins size={12}/>}
                         {m}
                      </button>
                    ))}
                  </div>
                  {formGasto.metodo === 'Cuenta' && (
                    <select 
                      required 
                      value={formGasto.cuentaId} 
                      onChange={e => setFormGasto({...formGasto, cuentaId: e.target.value})} 
                      className="w-full p-2 bg-white border border-blue-100 rounded-xl text-[9px] font-black text-blue-600 outline-none uppercase tracking-widest"
                    >
                      <option value="" disabled>Seleccionar Cuenta...</option>
                      {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  )}
                </div>

                 <div className="space-y-1">
                   <label className="text-[9px] font-black text-agri-900/40 uppercase tracking-widest ml-2 block leading-none">Temporada / Ciclo</label>
                   <div className="relative group">
                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-agri-400 group-focus-within:text-agri-600 transition-colors pointer-events-none" />
                     <select 
                       required 
                       value={formGasto.seasonId} 
                       onChange={e => setFormGasto({...formGasto, seasonId: e.target.value})} 
                       className="w-full bg-agri-50/50 border border-agri-100/50 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-agri-900 focus:ring-4 focus:ring-agri-500/10 outline-none appearance-none cursor-pointer"
                     >
                       <option value="" disabled>Seleccionar Temporada...</option>
                       {temporadas.map(t => (
                         <option key={t.id} value={t.id}>{t.nombre}</option>
                       ))}
                     </select>
                   </div>
                 </div>

                 <div className="pt-2 flex gap-3 border-t border-agri-50">
                   <button type="button" onClick={() => setShowModalGasto(false)} className="flex-1 px-4 py-3 border border-agri-100 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-agri-50 active:scale-95 transition-all text-agri-400">Cancelar</button>
                   <button type="submit" className={`flex-1 px-4 py-3 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest active:scale-95 transition-all shadow-xl ${activeCategory ? gastosConfig[activeCategory].color : 'bg-agri-600'}`}>Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {showDetailModal && selectedGastoId && (() => {
        const item = gastos.find(g => g.id === selectedGastoId);
        if (!item) return null;
        const totalAbonado = item.abonos?.reduce((acc: number, a: any) => acc + (a.monto || 0), 0) || 0;
        const saldo = (item.monto || 0) - totalAbonado;

        return (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
               <div className={`p-10 text-white relative flex items-center gap-6 shrink-0 ${activeCategory ? gastosConfig[activeCategory].color : 'bg-agri-900'}`}>
                  <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center backdrop-blur-md">
                     <Receipt className="w-10 h-10" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-display text-white italic tracking-tighter leading-none">{item.proveedor}</h2>
                     <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{item.concepto}</p>
                  </div>
                  <button onClick={() => setShowDetailModal(false)} className="absolute top-10 right-10 p-3 bg-white/10 hover:bg-white/20 rounded-2xl">
                    <X className="w-6 h-6 text-white" />
                  </button>
               </div>
               
               <div className="p-10 overflow-y-auto custom-scrollbar space-y-10">
                  <div className={`grid gap-6 ${item.metodo === 'Crédito' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                     <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Monto Total</p>
                        <p className="text-xl font-black text-agri-900">${item.monto.toLocaleString()}</p>
                     </div>
                     
                     {item.metodo === 'Crédito' ? (
                       <>
                         <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Abonado</p>
                            <p className="text-xl font-black text-agri-600">${totalAbonado.toLocaleString()}</p>
                         </div>
                         <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Saldo</p>
                            <p className={`text-xl font-black ${saldo > 0 ? 'text-red-500' : 'text-green-500'}`}>${saldo.toLocaleString()}</p>
                         </div>
                       </>
                     ) : (
                       <>
                         <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Forma de Pago</p>
                            <div className="flex items-center gap-2">
                               {item.metodo === 'Efectivo' ? <Banknote className="w-4 h-4 text-green-600"/> : <CreditCard className="w-4 h-4 text-blue-600"/>}
                               <p className="text-xl font-black text-agri-900">{item.metodo}</p>
                            </div>
                         </div>
                         <div className="bg-agri-600/5 p-6 rounded-[2rem] border border-agri-600/10 flex flex-col items-center">
                            <p className="text-[8px] font-black text-agri-600 uppercase tracking-widest mb-2">Estado</p>
                            <div className="flex items-center gap-2">
                               <CheckCircle2 className="w-4 h-4 text-agri-600"/>
                               <p className="text-xl font-black text-agri-600">PAGADO</p>
                            </div>
                         </div>
                       </>
                     )}

                     <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 flex flex-col items-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">Fecha Registro</p>
                        <p className="text-sm font-black text-gray-700">{item.fecha}</p>
                     </div>
                  </div>

                  {item.metodo === 'Crédito' ? (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between px-2">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Historial de Abonos</p>
                          {saldo > 0 && (
                            <button onClick={() => { setAbonoError(null); setShowAbonoModal(true); }} className="bg-agri-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-agri-600/20 active:scale-95 transition-all">
                               <Plus className="w-4 h-4" /> Nuevo Abono
                            </button>
                          )}
                       </div>
                       <div className="bg-white border-2 border-gray-50 rounded-[2.5rem] overflow-hidden">
                          {item.abonos && item.abonos.length > 0 ? (
                            <div className="divide-y-2 divide-gray-50">
                               {[...item.abonos].sort((a,b) => b.fecha.localeCompare(a.fecha)).map(a => (
                                <div key={a.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                   <div className="flex items-center gap-4">
                                      <div className={`p-4 rounded-2xl ${a.metodo === 'Efectivo' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                         {a.metodo === 'Efectivo' ? <Banknote className="w-5 h-5"/> : <CreditCard className="w-5 h-5"/>}
                                      </div>
                                      <div>
                                         <p className="text-lg font-black text-agri-900">${a.monto.toLocaleString()}</p>
                                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{a.fecha}</p>
                                      </div>
                                   </div>
                                   <p className="text-[10px] italic text-gray-400 font-medium">{a.nota || 'Sin nota'}</p>
                                </div>
                               ))}
                            </div>
                          ) : (
                            <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                               <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-3xl flex items-center justify-center">
                                  <Coins className="w-8 h-8" />
                               </div>
                               <p className="text-sm font-black text-gray-400 italic">No hay abonos registrados para este crédito.</p>
                            </div>
                          )}
                       </div>
                    </div>
                  ) : (
                     <div className="p-10 bg-agri-50/50 rounded-[2.5rem] border border-dashed border-agri-200 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-white text-agri-600 rounded-3xl flex items-center justify-center shadow-lg shadow-agri-900/5">
                           <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                           <p className="text-sm font-black text-agri-900 italic">"Compra liquidada al contado"</p>
                        </div>
                     </div>
                  )}

                  <div className="pt-10 flex border-t border-gray-50 px-2">
                     <button onClick={() => setShowDetailModal(false)} className="w-full py-5 bg-agri-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] active:scale-95 transition-all shadow-xl shadow-agri-900/20">Cerrar Detalle</button>
                  </div>
               </div>
             </div>
          </div>
        );
      })()}

      {/* MODAL NUEVO PROVEEDOR (QUICK ADD) */}
      {showModalNuevoProveedor && (
        <div className="fixed inset-0 bg-slate-900/40 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 bg-agri-900 text-white relative">
                 <h2 className="text-xl font-display">Nuevo Proveedor</h2>
                 <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-1">Alta rápida</p>
                 <button onClick={() => setShowModalNuevoProveedor(false)} className="absolute top-8 right-8 p-2 bg-white/10 hover:bg-white/20 rounded-xl">
                    <X className="w-4 h-4" />
                 </button>
              </div>
              <form onSubmit={handleQuickProveedorSubmit} className="p-8 space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-agri-900/40 uppercase tracking-widest ml-1">Nombre Comercial</label>
                    <input autoFocus required type="text" value={newProveedorForm.nombre} onChange={e => setNewProveedorForm({...newProveedorForm, nombre: e.target.value})} className="w-full bg-agri-50 border border-agri-100/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-agri-900 outline-none focus:ring-4 focus:ring-agri-900/5" placeholder="Ej: Fertilizantes del Norte" />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-agri-900/40 uppercase tracking-widest ml-1">RFC (Opcional)</label>
                    <input type="text" value={newProveedorForm.rfc} onChange={e => setNewProveedorForm({...newProveedorForm, rfc: e.target.value})} className="w-full bg-agri-50 border border-agri-100/50 rounded-2xl px-5 py-3.5 text-sm font-bold text-agri-900 outline-none" placeholder="XAXX010101000" />
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowModalNuevoProveedor(false)} className="flex-1 py-4 border border-agri-100 rounded-2xl font-black uppercase text-[9px] tracking-widest text-agri-400">Cancelar</button>
                    <button type="submit" className="flex-1 py-4 bg-agri-900 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest active:scale-95 transition-all shadow-lg shadow-agri-900/20">Guardar</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* ABONO MODAL */}
      {showAbonoModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className={`p-8 text-white relative ${activeCategory ? gastosConfig[activeCategory].color : 'bg-agri-600'}`}>
               <h2 className="text-2xl font-display">Registrar Abono</h2>
               <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Nuevo pago para el proveedor</p>
            </div>
            
            <form onSubmit={handleAbonoSubmit} className="p-10 space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Monto del Abono ($)</label>
                 <input required type="number" step="0.01" value={formAbono.monto} onChange={e => setFormAbono({...formAbono, monto: e.target.value})} className="w-full bg-agri-50/50 border border-agri-100/50 rounded-2xl px-6 py-4 text-xl font-black text-agri-600 outline-none text-center" placeholder="0.00" />
                 {abonoError && <p className="text-[10px] font-bold text-red-500 text-center animate-bounce">{abonoError}</p>}
               </div>

               <div className="space-y-4 p-6 bg-agri-50/30 rounded-[2rem] border border-agri-100/50">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Método de Pago</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Efectivo', 'Cuenta'].map((m: any) => (
                      <button 
                        key={m} 
                        type="button" 
                        onClick={() => setFormAbono({...formAbono, metodo: m})} 
                        className={`py-4 rounded-xl flex flex-col items-center justify-center gap-2 text-[10px] font-black transition-all border-2 ${formAbono.metodo === m ? 'bg-white text-agri-600 border-agri-600 shadow-lg scale-105' : 'bg-transparent text-gray-300 border-agri-100/50 opacity-60'}`}
                      >
                         {m === 'Efectivo' ? <Banknote className="w-5 h-5"/> : <CreditCard className="w-5 h-5"/>}
                         {m}
                      </button>
                    ))}
                  </div>

                  {formAbono.metodo === 'Cuenta' && (
                    <select 
                      required
                      value={formAbono.cuentaId} 
                      onChange={e => setFormAbono({...formAbono, cuentaId: e.target.value})} 
                      className="w-full mt-3 p-4 bg-white border border-blue-100 rounded-2xl text-[10px] font-black text-blue-600 outline-none uppercase tracking-widest"
                    >
                      <option value="" disabled>Seleccionar Cuenta...</option>
                      {cuentas.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                  )}
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Fecha del Pago</label>
                 <input required type="date" value={formAbono.fecha} onChange={e => setFormAbono({...formAbono, fecha: e.target.value})} className="w-full bg-agri-50/50 border border-agri-100/50 rounded-2xl px-6 py-4 text-sm font-bold text-gray-700 outline-none text-center" />
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nota Interna (Opcional)</label>
                 <input type="text" value={formAbono.nota} onChange={e => setFormAbono({...formAbono, nota: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium text-gray-700" placeholder="Ej: Pago parcial..." />
               </div>

               <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setShowAbonoModal(false)} className="flex-1 px-4 py-5 border border-agri-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-agri-400 active:scale-95 transition-all">Cerrar</button>
                  <button type="submit" className={`flex-1 px-4 py-5 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-xl shadow-agri-600/20 ${activeCategory ? gastosConfig[activeCategory].color : 'bg-agri-600'}`}>Confirmar Abono</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gastos;
