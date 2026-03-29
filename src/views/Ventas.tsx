import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  ChevronRight, 
  MapPin, 
  Search, 
  ArrowLeft, 
  Truck,
  User,
  Scale,
  Calendar,
  Clock,
  DollarSign,
  Wallet,
  X,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';

const Ventas = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'list' | 'detail' | 'form'>('dashboard');
  const [activeTab, setActiveTab] = useState<'Todos' | 'Nacional' | 'Exportacion'>('Todos');
  const [showModal, setShowModal] = useState(false);
  const [showQuickClientModal, setShowQuickClientModal] = useState(false);
  const [showQuickProductModal, setShowQuickProductModal] = useState(false);
  
  const { 
    folios, addFolio, setVentaMontoTotal, updateVentaStatus, 
    clientes, productos, addCliente, addProducto, activeSeasonId, temporadas
  } = useStore(useShallow(state => ({
    folios: state.folios,
    addFolio: state.addFolio,
    setVentaMontoTotal: state.setVentaMontoTotal,
    updateVentaStatus: state.updateVentaStatus,
    clientes: state.clientes,
    productos: state.productos,
    addCliente: state.addCliente,
    addProducto: state.addProducto,
    activeSeasonId: state.activeSeasonId,
    temporadas: state.temporadas
  })));

  const [selectedFolioId, setSelectedFolioId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'liquidar' | 'status' | 'confirmacion'>('liquidar');
  const [liquidarMonto, setLiquidarMonto] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({ status: '', fecha: '', nota: '' });
  
  // Quick Add Forms
  const [quickClient, setQuickClient] = useState({ nombre: '', alias: '', telefono: '' });
  const [quickProduct, setQuickProduct] = useState({ nombre: '', categoria: 'Fruta' });

  const [formData, setFormData] = useState({
    placas: '',
    variedad: '',
    peso: '',
    destino: '',
    status: 'En Ruta',
    tipoVenta: 'a_definir' as 'a_definir' | 'precio_fijo',
    precioPorKilo: '',
    clienteId: '',
    fecha: new Date().toISOString().split('T')[0],
    seasonId: activeSeasonId || ''
  });

  const formatThousands = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    return raw ? parseInt(raw).toLocaleString('en-US') : '';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date).replace(/ de /g, ' de ').replace(/ del /g, ' del ');
  };

  const handleOpenModal = (type: 'liquidar' | 'status' | 'confirmacion', id?: string) => {
    setModalType(type);
    if (id) setSelectedFolioId(id);
    setShowModal(true);
  };

  const handleSelectVenta = (id: string) => {
    setSelectedFolioId(id);
    setCurrentView('detail');
  };

  const handleNewVenta = () => {
    setFormData(prev => ({ 
      ...prev,
      placas: '', variedad: '', peso: '', destino: '', 
      status: 'En Ruta', tipoVenta: 'a_definir', 
      precioPorKilo: '', clienteId: '', 
      fecha: new Date().toISOString().split('T')[0],
      seasonId: activeSeasonId || ''
    }));
    setCurrentView('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentView === 'form') {
      const client = clientes.find(c => c.id === formData.clienteId);
      const { precioPorKilo: _, ...cleanFormData } = formData;
      addFolio({
        ...cleanFormData,
        destino: client?.nombre || 'Desconocido',
        peso: formData.peso.replace(/,/g, ''),
        ...(formData.tipoVenta === 'precio_fijo' && { precioPorKilo: Number(formData.precioPorKilo) }),
        fecha: formData.fecha,
        clienteId: formData.clienteId,
        seasonId: formData.seasonId
      });
      setFormData(prev => ({ 
        ...prev,
        placas: '', variedad: '', peso: '', destino: '', 
        status: 'En Ruta', tipoVenta: 'a_definir', 
        precioPorKilo: '', clienteId: '', 
        fecha: new Date().toISOString().split('T')[0],
        seasonId: activeSeasonId || ''
      }));
      setModalType('confirmacion');
      setShowModal(true);
      return; 
    } else if (modalType === 'liquidar' && selectedFolioId) {
      setVentaMontoTotal(selectedFolioId, Number(liquidarMonto.replace(/,/g, '')), statusUpdate.nota);
      setLiquidarMonto('');
      setShowModal(false);
    } else if (modalType === 'status' && selectedFolioId) {
      const displayDate = new Date(statusUpdate.fecha).toLocaleDateString('es-MX', { 
        day: '2-digit', month: 'short'
      }) + ' ' + new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

      updateVentaStatus(selectedFolioId, statusUpdate.status, displayDate, statusUpdate.nota);
      setStatusUpdate({ status: '', fecha: '', nota: '' });
      setShowModal(false);
    }
  };

  const handleQuickClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = addCliente({ 
      nombre: quickClient.nombre, 
      telefono: quickClient.telefono,
      esExportacion: false 
    });
    console.log('Cliente creado:', newId);
    setFormData(prev => ({ ...prev, clienteId: newId }));
    setQuickClient({ nombre: '', alias: '', telefono: '' });
    setShowQuickClientModal(false);
  };

  const handleQuickProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = addProducto({ nombre: quickProduct.nombre });
    console.log('Producto creado:', newId);
    setFormData(prev => ({ ...prev, variedad: quickProduct.nombre }));
    setQuickProduct({ nombre: '', categoria: 'Fruta' });
    setShowQuickProductModal(false);
  };

  const filteredFolios = useMemo(() => {
    return folios
      .filter(f => {
        // Strict global season filter
        if (activeSeasonId && f.seasonId !== activeSeasonId) return false;
        
        if (activeTab === 'Nacional') return !f.esExportacion;
        if (activeTab === 'Exportacion') return f.esExportacion;
        return true;
      })
      .sort((a, b) => b.folio.localeCompare(a.folio));
  }, [folios, activeTab, activeSeasonId]);

  const selectedFolio = selectedFolioId ? folios.find(f => f.id === selectedFolioId) : null;
  const calcularPagado = (abonos: any[] = []) => abonos.reduce((acc, a) => acc + a.monto, 0);

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header Dinámico */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          {currentView !== 'dashboard' && (
            <button 
              onClick={() => {
                if (currentView === 'detail') setCurrentView('list');
                else setCurrentView('dashboard');
                setSelectedFolioId(null);
              }}
              className="p-3 bg-white rounded-2xl shadow-sm border border-agri-100 text-agri-600 hover:bg-agri-50 transition-all active:scale-90"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="space-y-1">
            <h1 className="title-primary text-5xl md:text-6xl leading-none">
              {currentView === 'dashboard' && 'Ventas'}
              {currentView === 'list' && 'Historial'}
              {currentView === 'form' && 'Venta'}
              {currentView === 'detail' && 'Detalle'}
            </h1>
            <p className="subtitle-secondary !text-[10px] md:!text-xs !dark:text-white">
              {currentView === 'dashboard' && 'Gestión de ventas de productos'}
              {currentView === 'list' && 'Registro histórico de folios y estados de entrega.'}
              {currentView === 'form' && 'Registro de pesaje y destino para nueva salida.'}
              {currentView === 'detail' && 'Información detallada del folio logístico.'}
            </p>
          </div>
        </div>
      </div>

      {/* DASHBOARD VIEW */}
      {currentView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
           <button 
             onClick={handleNewVenta}
             className="group bg-agri-600 p-10 rounded-[3rem] text-white text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-agri-600/30 flex flex-col justify-between h-72 relative overflow-hidden"
           >
              <div className="absolute right-[-20%] top-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-display leading-tight mb-2">Registrar<br/><span className="italic">Nueva Venta</span></h3>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Crear folio de salida</p>
              </div>
           </button>

           <button 
             onClick={() => setCurrentView('list')}
             className="group bg-white p-10 rounded-[3rem] text-left transition-all hover:scale-[1.02] hover:shadow-xl border border-gray-200 flex flex-col justify-between h-72 shadow-2xl shadow-gray-900/5"
           >
              <div className="w-16 h-16 bg-agri-50 rounded-[2rem] flex items-center justify-center group-hover:bg-agri-100 transition-colors">
                <Truck className="w-8 h-8 text-agri-600" />
              </div>
              <div>
                <h3 className="text-3xl font-display text-agri-900 leading-tight mb-2 italic">Historial de<br/><span className="not-italic">Ventas</span></h3>
                <div className="flex items-center justify-between border-t border-agri-50 pt-4 mt-2">
                   <p className="text-agri-400 text-[10px] font-black uppercase tracking-widest">{folios.filter(f => f.seasonId === activeSeasonId).length} Folios registrados</p>
                   <ChevronRight className="w-5 h-5 text-agri-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
           </button>
        </div>
      )}

      {/* LIST VIEW */}
      {currentView === 'list' && (
        <div className="bg-white rounded-[3rem] border border-agri-100 overflow-hidden animate-in slide-in-from-bottom-6 duration-500 shadow-sm">
          <div className="p-8 border-b border-agri-50 bg-agri-50/20 flex flex-col sm:flex-row justify-between items-center gap-6">
             <div className="flex bg-white/60 p-1 rounded-2xl border border-agri-100 shadow-sm w-full sm:w-auto">
                {['Todos', 'Nacional', 'Exportacion'].map((tab) => (
                   <button 
                     key={tab}
                     onClick={() => setActiveTab(tab as any)}
                     className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                       activeTab === tab ? 'bg-agri-600 text-white shadow-lg shadow-agri-600/20' : 'text-gray-400 hover:text-agri-600'
                     }`}
                   >
                     {tab}
                   </button>
                ))}
             </div>
             <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
               <div className="relative w-full sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar folio..." 
                    className="w-full bg-white border border-agri-100 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-agri-500/20 transition-all"
                  />
               </div>

               <div className="relative w-full sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar folio..." 
                    className="w-full bg-white border border-agri-100 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-agri-500/20 transition-all"
                  />
               </div>
             </div>
          </div>

          <div className="p-8">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredFolios.map((folio) => (
                 <div 
                   key={folio.id}
                   onClick={() => handleSelectVenta(folio.id)}
                   className="group relative bg-white border border-agri-100/50 p-6 rounded-[2.5rem] hover:border-agri-400 hover:shadow-xl hover:shadow-agri-900/5 transition-all cursor-pointer flex flex-col justify-between h-full animate-in fade-in"
                 >
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-agri-50 rounded-2xl flex items-center justify-center text-agri-600 group-hover:bg-agri-600 group-hover:text-white transition-all">
                             <Truck className="w-6 h-6" />
                          </div>
                          <div>
                             <h4 className="font-display text-agri-900 text-lg leading-none">{folio.folio}</h4>
                             <div className="flex items-center gap-2 mt-1">
                               <p className="text-[9px] font-black text-agri-400 uppercase tracking-widest italic">{folio.fecha}</p>
                             </div>
                          </div>
                       </div>
                       <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                         folio.status === 'Liquidado' ? 'bg-agri-50 text-agri-600 border-agri-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                       }`}>
                         {folio.status}
                       </span>
                    </div>

                    <div className="space-y-4 mb-6">
                       <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-100 group-hover:bg-white group-hover:border-agri-100 transition-all">
                          <MapPin className="w-4 h-4 text-agri-400" />
                          <span className="text-xs font-bold text-gray-600 truncate">{folio.destino}</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50/50 p-3 rounded-2xl text-center flex flex-col gap-1 border border-transparent group-hover:border-agri-50 transition-all">
                             <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Variedad</span>
                             <span className="text-[11px] font-black text-agri-900 uppercase truncate">{folio.variedad}</span>
                             <div className="mt-1.5 px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-lg">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">
                                   {temporadas.find(t => t.id === folio.seasonId)?.nombre || 'Ciclo Indefinido'}
                                </span>
                             </div>
                          </div>
                          <div className="bg-gray-50/50 p-3 rounded-2xl text-center flex flex-col gap-1 border border-transparent group-hover:border-agri-50 transition-all">
                             <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Peso Neto</span>
                             <span className="text-[11px] font-black text-agri-900">{folio.peso} <span className="text-[8px] text-gray-400">KG</span></span>
                          </div>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-agri-50 flex items-center justify-between">
                       <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Monto de Venta</p>
                          <p className="text-lg font-display text-agri-900 italic">
                            {folio.montoTotal > 0 ? `$${folio.montoTotal.toLocaleString()}` : <span className="text-orange-400">Por definir</span>}
                          </p>
                       </div>
                       <div className="w-10 h-10 rounded-full border border-agri-100 flex items-center justify-center text-agri-300 group-hover:text-agri-600 group-hover:border-agri-400 transition-all">
                          <ChevronRight className="w-5 h-5" />
                       </div>
                    </div>
                 </div>
               ))}
               {filteredFolios.length === 0 && (
                  <div className="col-span-full py-20 text-center">
                    <div className="w-20 h-20 bg-agri-50 rounded-full flex items-center justify-center mx-auto mb-4 opacity-40">
                      <Truck className="w-10 h-10 text-agri-300" />
                    </div>
                    <p className="text-agri-400 font-bold italic">No se encontraron folios con este filtro.</p>
                  </div>
               )}
             </div>
          </div>
        </div>
      )}

      {/* FORM VIEW (Registrar Venta) */}
      {currentView === 'form' && (
        <div className="bg-white rounded-[40px] border border-agri-100 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500 max-w-4xl mx-auto">
          <div className="bg-agri-600 px-8 py-4 text-white relative">
             <div className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 rounded-xl blur-lg" />
             <h2 className="text-xl font-display italic leading-none">Nueva Venta</h2>
             <p className="text-white/60 text-[8px] font-black uppercase tracking-[0.2em] mt-1">Despacho Logístico</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Cliente Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Cliente / Receptor</label>
                  <button 
                    type="button" 
                    onClick={() => setShowQuickClientModal(true)}
                    className="text-[8px] font-black text-agri-600 uppercase flex items-center gap-1 hover:text-agri-700 transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5" /> Registrar
                  </button>
                </div>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-agri-400 group-focus-within:text-agri-600" />
                  <select
                    required
                    value={formData.clienteId}
                    onChange={e => setFormData({...formData, clienteId: e.target.value})}
                    className="w-full bg-agri-50/20 border border-agri-100 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-gray-900 group-focus-within:ring-4 group-focus-within:ring-agri-500/10 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Seleccione cliente...</option>
                    {clientes.filter(c => c.activo !== false).map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Variedad Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Variedad</label>
                  <button 
                    type="button" 
                    onClick={() => setShowQuickProductModal(true)}
                    className="text-[8px] font-black text-agri-600 uppercase flex items-center gap-1 hover:text-agri-700 transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5" /> Añadir
                  </button>
                </div>
                <div className="relative group">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-agri-400 group-focus-within:text-agri-600" />
                  <select
                    required
                    value={formData.variedad}
                    onChange={e => setFormData({...formData, variedad: e.target.value})}
                    className="w-full bg-agri-50/20 border border-agri-100 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-gray-900 group-focus-within:ring-4 group-focus-within:ring-agri-500/10 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Seleccione fruta...</option>
                    {productos.filter(p => p.activo !== false).map(p => (
                      <option key={p.id} value={p.nombre}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Placas */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Transporte (Placas)</label>
                <div className="relative group">
                  <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-agri-400 group-focus-within:text-agri-600" />
                  <input
                    required
                    type="text"
                    value={formData.placas}
                    onChange={e => setFormData({...formData, placas: e.target.value.toUpperCase()})}
                    className="w-full bg-agri-50/20 border border-agri-100 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-gray-900 group-focus-within:ring-4 group-focus-within:ring-agri-500/10 transition-all outline-none"
                    placeholder="ABC-1234"
                  />
                </div>
              </div>

              {/* Peso */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Peso Neto (KG)</label>
                <div className="relative group">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-agri-400 group-focus-within:text-agri-600" />
                  <input
                    required
                    type="text"
                    value={formData.peso}
                    onChange={e => setFormData({...formData, peso: formatThousands(e.target.value)})}
                    className="w-full bg-agri-50/20 border border-agri-100 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-gray-900 group-focus-within:ring-4 group-focus-within:ring-agri-500/10 transition-all outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Fecha */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Fecha de Despacho</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-agri-400 group-focus-within:text-agri-600" />
                  <input
                    required
                    type="date"
                    value={formData.fecha}
                    onChange={e => setFormData({...formData, fecha: e.target.value})}
                    className="w-full bg-agri-50/20 border border-agri-100 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-gray-900 group-focus-within:ring-4 group-focus-within:ring-agri-500/10 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Season Selector */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Ciclo Agrícola</label>
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 group-focus-within:text-indigo-600" />
                  <select
                    required
                    value={formData.seasonId}
                    onChange={e => setFormData({...formData, seasonId: e.target.value})}
                    className="w-full bg-indigo-50/10 border border-indigo-100/30 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold text-gray-900 group-focus-within:ring-4 group-focus-within:ring-indigo-500/10 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Seleccione Ciclo...</option>
                    {temporadas.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Esquema de Venta */}
            <div className="space-y-1.5 max-w-sm">
              <div className="flex items-center gap-2 ml-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Modalidad de Precio</label>
                <div className="group relative">
                  <HelpCircle className="w-3.5 h-3.5 text-agri-400 cursor-help" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[70] shadow-xl border border-white/10">
                    <p className="font-bold mb-1 border-b border-white/10 pb-1 uppercase tracking-widest">Tipos de Precio</p>
                    <p className="mb-1.5"><span className="text-agri-400">Por Definir:</span> El camión sale sin precio pactado. Se establece el monto después en Cobranza.</p>
                    <p><span className="text-indigo-400">Precio Fijo:</span> Se pacta el precio ($) por kilo en este momento y se genera la deuda automática.</p>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-slate-900 rotate-45" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, tipoVenta: 'a_definir'})}
                   className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all ${
                     formData.tipoVenta === 'a_definir' ? 'bg-white text-agri-700 shadow-sm border border-agri-100' : 'text-gray-400 hover:text-gray-600'
                   }`}
                 >
                   <Clock className="w-3.5 h-3.5" />
                   <span className="text-[7px] font-black uppercase tracking-widest">Precio por definir</span>
                 </button>
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, tipoVenta: 'precio_fijo'})}
                   className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all ${
                     formData.tipoVenta === 'precio_fijo' ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100' : 'text-gray-400 hover:text-gray-600'
                   }`}
                 >
                   <DollarSign className="w-3.5 h-3.5" />
                   <span className="text-[7px] font-black uppercase tracking-widest">Precio Fijo</span>
                 </button>
              </div>
            </div>

            {formData.tipoVenta === 'precio_fijo' && (
              <div className="animate-in slide-in-from-top-4 duration-500 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50 space-y-3">
                 <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1">Precio por Kilo ($)</label>
                 <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 group-focus-within:text-indigo-600" />
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.precioPorKilo}
                      onChange={e => setFormData({...formData, precioPorKilo: e.target.value})}
                      className="w-full bg-white border border-indigo-200 rounded-2xl pl-11 pr-4 py-3 text-lg font-display text-indigo-900 outline-none italic"
                      placeholder="0.00"
                    />
                 </div>
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-agri-50">
               <button 
                 type="button" 
                 onClick={() => setCurrentView('dashboard')}
                 className="flex-1 px-6 py-4 border border-agri-50 text-agri-300 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-agri-50 hover:text-agri-400 transition-all active:scale-95"
               >
                 Cancelar
               </button>
               <button 
                 type="submit" 
                 className="flex-[2] bg-agri-600 text-white rounded-2xl py-4 font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-agri-600/30 hover:bg-agri-700"
               >
                 Confirmar Venta
               </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL VIEW */}
      {currentView === 'detail' && selectedFolio && (
        <div className="space-y-8 animate-in slide-in-from-right-6 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Info Principal */}
              <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-agri-100 shadow-sm relative overflow-hidden">
                 <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-agri-50 rounded-full blur-3xl opacity-50" />
                 
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-12">
                       <div className="flex items-center gap-6">
                          <div className={`p-5 rounded-[2rem] shadow-xl transition-colors ${
                            selectedFolio.status === 'Liquidado' ? 'bg-agri-600 text-white shadow-agri-200' : 'bg-blue-600 text-white shadow-blue-200'
                          }`}>
                            <Truck className="w-10 h-10" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                               <h2 className="text-4xl font-display text-agri-900 italic tracking-tight">{selectedFolio.folio}</h2>
                            </div>
                            <div className="space-y-1">
                               <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none">
                                  {formatDate(selectedFolio.fecha)}
                               </p>
                               <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${selectedFolio.status === 'Liquidado' ? 'bg-agri-500' : 'bg-orange-500'} animate-pulse`} />
                                  <span className="text-[11px] font-black text-agri-900 uppercase tracking-widest">{folios.find(f => f.id === selectedFolio.id)?.status || selectedFolio.status}</span>
                               </div>
                            </div>
                          </div>
                       </div>
                       <div className="flex gap-3">
                          <button 
                            onClick={() => handleOpenModal('status', selectedFolio.id)}
                            className="bg-white border border-agri-100 px-6 py-4 rounded-2xl text-agri-600 font-black text-[10px] uppercase tracking-widest hover:bg-agri-50 transition-all shadow-sm flex items-center gap-2"
                          >
                            <Clock className="w-4 h-4" />
                            Cambiar Estado
                          </button>
                          {selectedFolio.montoTotal === 0 && (
                            <button 
                              onClick={() => handleOpenModal('liquidar', selectedFolio.id)}
                               className="bg-agri-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-agri-600/20 active:scale-95 transition-all"
                            >
                              Definir Precio
                            </button>
                          )}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-y border-agri-50 mb-10">
                       <div>
                          <p className="text-[9px] font-black text-agri-400 uppercase tracking-widest mb-2">Comprador</p>
                          <p className="text-sm font-bold text-agri-900 truncate">
                            {clientes.find(c => c.id === selectedFolio.clienteId)?.nombre || selectedFolio.destino}
                          </p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-agri-400 uppercase tracking-widest mb-2">Variedad</p>
                          <p className="text-sm font-black text-agri-900 uppercase italic leading-none">{selectedFolio.variedad}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-agri-400 uppercase tracking-widest mb-2">Carga Neta</p>
                          <p className="text-sm font-black text-agri-900 leading-none">{selectedFolio.peso} <span className="text-[10px] text-gray-400">KG</span></p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-agri-400 uppercase tracking-widest mb-2">Transporte</p>
                          <p className="text-sm font-black text-agri-900 italic leading-none">{selectedFolio.placas}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100">
                          <div className="flex items-center gap-3 mb-4">
                             <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                                <MapPin className="w-4 h-4 text-agri-500" />
                             </div>
                             <p className="text-[10px] font-black text-agri-400 uppercase tracking-widest leading-none">Punto de Entrega</p>
                          </div>
                          <p className="text-sm font-bold text-agri-900 leading-relaxed italic">{selectedFolio.destino}</p>
                       </div>
                       <div className="bg-agri-50/50 p-6 rounded-[2rem] border border-agri-100 flex items-center justify-between">
                          <div>
                             <p className="text-[10px] font-black text-agri-400 uppercase tracking-widest mb-1">Monto Total Bruto</p>
                             <p className={`text-2xl font-display italic ${selectedFolio.montoTotal > 0 ? 'text-agri-900' : 'text-orange-400'}`}>
                                {selectedFolio.montoTotal > 0 ? `$${selectedFolio.montoTotal.toLocaleString()}` : 'Por definir'}
                             </p>
                          </div>
                          <DollarSign className="w-8 h-8 text-agri-200" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* Sidebar: Finanzas & Timeline */}
              <div className="space-y-8">
                 {/* Financial Card */}
                 <div className={`${selectedFolio.status === 'Liquidado' ? 'bg-agri-900' : 'bg-slate-900'} p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden h-72 flex flex-col justify-between group transition-colors duration-700`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
                    <div>
                       <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-center">Progreso de Cobro</p>
                       {selectedFolio.montoTotal > 0 ? (
                         <div className="flex flex-col items-center">
                            <h3 className="text-5xl font-display italic leading-none mb-1">
                              {((calcularPagado(selectedFolio.abonos) / selectedFolio.montoTotal) * 100).toFixed(0)}%
                            </h3>
                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Saldo Liquidado</p>
                         </div>
                       ) : (
                         <div className="text-center py-4 border-2 border-dashed border-white/10 rounded-2xl opacity-40 italic">
                            <span className="text-[9px] uppercase font-black">Precio por definir</span>
                         </div>
                       )}
                    </div>
                    {selectedFolio.montoTotal > 0 && (
                      <div className="space-y-4">
                         <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-agri-400 transition-all duration-1000 shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
                              style={{ width: `${(calcularPagado(selectedFolio.abonos) / selectedFolio.montoTotal) * 100}%` }}
                            />
                         </div>
                         <div className="flex justify-between items-end border-t border-white/5 pt-4">
                            <div>
                               <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 leading-none">Pendiente</p>
                               <p className="text-lg font-display text-white/90">
                                 ${(selectedFolio.montoTotal - calcularPagado(selectedFolio.abonos)).toLocaleString()}
                               </p>
                            </div>
                            <Wallet className="w-8 h-8 text-white/10" />
                         </div>
                      </div>
                    )}
                 </div>

                 {/* Timeline History */}
                 <div className="bg-white rounded-[3rem] p-8 border border-agri-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                       <Clock className="w-5 h-5 text-agri-300" />
                       <h3 className="text-[10px] font-black text-agri-400 uppercase tracking-[0.2em]">Historial de Eventos</h3>
                    </div>
                    <div className="space-y-8 relative before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-agri-50">
                       {(selectedFolio.statusHistory || []).slice().reverse().map((h: any, idx: number) => (
                         <div key={idx} className="relative pl-10 group">
                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ring-1 ring-agri-50 transition-colors ${idx === 0 ? 'bg-agri-600' : 'bg-agri-100'}`} />
                            <div>
                               <div className="flex justify-between items-center mb-1">
                                  <p className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-agri-700' : 'text-gray-400'}`}>{h.status}</p>
                                  <span className="text-[8px] font-bold text-gray-300 uppercase">{h.fecha}</span>
                               </div>
                               {h.nota && <p className="text-[11px] text-gray-400 font-medium italic italic leading-relaxed">{h.nota}</p>}
                            </div>
                         </div>
                       ))}
                       {(!selectedFolio.statusHistory || selectedFolio.statusHistory.length === 0) && (
                         <div className="pl-10 text-gray-300 text-[10px] font-bold italic">Esperando primer despacho...</div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODALES QUICK ADD (The new requested feature) */}
      
      {/* Quick Add Client */}
      {showQuickClientModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
            <div className="bg-agri-600 px-8 py-8 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display italic">Nuevo Cliente</h2>
                <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">Alta rápida comercial</p>
              </div>
              <button onClick={() => setShowQuickClientModal(false)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickClientSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Nombre Completo</label>
                <input 
                  required autoFocus
                  value={quickClient.nombre}
                  onChange={e => setQuickClient({...quickClient, nombre: e.target.value})}
                  className="w-full bg-agri-50/50 border border-agri-100 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-agri-500/10 transition-all"
                  placeholder="Ej: Distribuidora de Fruta MX"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Alias (Opcional)</label>
                  <input 
                    value={quickClient.alias}
                    onChange={e => setQuickClient({...quickClient, alias: e.target.value})}
                    className="w-full bg-agri-50/50 border border-agri-100 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-agri-500/10 transition-all"
                    placeholder="Ej: Distribuidora"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Teléfono</label>
                  <input 
                    value={quickClient.telefono}
                    onChange={e => setQuickClient({...quickClient, telefono: e.target.value})}
                    className="w-full bg-agri-50/50 border border-agri-100 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-agri-500/10 transition-all"
                    placeholder="33 0000 0000"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-agri-600 text-white rounded-[1.5rem] py-5 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-agri-600/30 hover:bg-agri-700"
              >
                Guardar y Seleccionar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Product/Variety */}
      {showQuickProductModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
            <div className="bg-agri-600 px-8 py-8 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display italic">Nueva Variedad</h2>
                <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">Registro de Producto</p>
              </div>
              <button onClick={() => setShowQuickProductModal(false)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickProductSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Nombre de la Fruta / Variedad</label>
                <input 
                  required autoFocus
                  value={quickProduct.nombre}
                  onChange={e => setQuickProduct({...quickProduct, nombre: e.target.value})}
                  className="w-full bg-agri-50/50 border border-agri-100 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-gray-900 outline-none focus:ring-4 focus:ring-agri-500/10 transition-all"
                  placeholder="Ej: Jubilee Grande"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-agri-600 text-white rounded-[1.5rem] py-5 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-agri-600/30 hover:bg-agri-700"
              >
                Añadir a la Carga
              </button>
            </form>
          </div>
        </div>
      )}

      {/* OTROS MODALES (Liquidar, Status, Éxito) */}
      {showModal && modalType === 'liquidar' && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 flex flex-col">
              <div className="bg-agri-600 px-8 py-10 text-white relative">
                <div className="absolute top-10 right-10 p-3 bg-white/20 rounded-2xl backdrop-blur-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-display italic">Definir Precio</h2>
                <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">Cerrar liquidación de venta</p>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Monto Total Bruto ($)</label>
                   <div className="relative group">
                     <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-agri-400 group-focus-within:text-agri-600 transition-colors" />
                     <input 
                       required autoFocus
                       type="text" 
                       value={liquidarMonto} 
                       onChange={e => setLiquidarMonto(formatThousands(e.target.value))} 
                       className="w-full bg-agri-50/50 border border-agri-100 rounded-[1.5rem] pl-16 pr-6 py-6 text-2xl font-display text-agri-900 focus:ring-4 focus:ring-agri-500/10 transition-all outline-none italic placeholder:text-gray-200" 
                       placeholder="0.00" 
                     />
                   </div>
                 </div>
                 <div className="flex gap-4">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 border-2 border-agri-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-agri-50 transition-all">Cancelar</button>
                    <button type="submit" className="flex-1 bg-agri-600 text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-agri-600/20 active:scale-95 transition-all">Confirmar</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showModal && modalType === 'status' && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
              <div className="bg-blue-600 px-10 py-10 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute right-[-10%] top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                   <h2 className="text-2xl font-display italic">Actualizar Estado</h2>
                   <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">Seguimiento logístico</p>
                </div>
                <Truck className="w-10 h-10 text-white/20" />
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1">Nuevo Estado</label>
                       <select
                         required
                         value={statusUpdate.status}
                         onChange={e => setStatusUpdate({...statusUpdate, status: e.target.value})}
                         className="w-full bg-blue-50/30 border border-blue-100 rounded-2xl px-5 py-4 text-xs font-black text-blue-900 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all uppercase tracking-tighter"
                       >
                         <option value="En Ruta">En Ruta</option>
                         <option value="Entregado">Entregado</option>
                         <option value="Liquidado" disabled>Liquidado (Automático)</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1">Fecha del Evento</label>
                       <input
                         required
                         type="date"
                         value={statusUpdate.fecha}
                         onChange={e => setStatusUpdate({...statusUpdate, fecha: e.target.value})}
                         className="w-full bg-blue-50/30 border border-blue-100 rounded-2xl px-5 py-4 text-xs font-black text-blue-900 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                       />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] ml-1">Notas logísticas</label>
                    <textarea
                      value={statusUpdate.nota}
                      onChange={e => setStatusUpdate({...statusUpdate, nota: e.target.value})}
                      className="w-full bg-blue-50/30 border border-blue-100 rounded-[1.5rem] p-6 text-sm font-bold text-blue-900 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all h-32 resize-none placeholder:text-blue-200"
                      placeholder="Ej: El camión llegó a la frontera sin contratiempos..."
                    />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-4 border-2 border-blue-50 text-blue-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">Cancelar</button>
                    <button type="submit" className="flex-1 bg-blue-600 text-white rounded-2xl py-4 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all">Actualizar</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showModal && modalType === 'confirmacion' && (
        <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100 p-12 text-center relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-agri-600" />
              <div className="w-24 h-24 bg-agri-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border-4 border-white shadow-xl rotate-3">
                <CheckCircle2 className="w-12 h-12 text-agri-600" />
              </div>
              <h2 className="text-3xl font-display italic text-agri-900 mb-2 leading-none uppercase tracking-tighter">¡Venta Exitosa!</h2>
              <p className="text-gray-400 text-xs font-bold mb-10 leading-relaxed uppercase tracking-widest">
                El folio logístico ha sido registrado.<br/><span className="text-agri-600 font-black italic">Operación segura.</span>
              </p>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setCurrentView('list');
                }}
                className="w-full bg-agri-900 text-white rounded-2xl py-5 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-agri-900/20 active:scale-95 transition-all"
              >
                Entendido
              </button>
           </div>
        </div>
      )}

    </div>
  );
};

export default Ventas;
