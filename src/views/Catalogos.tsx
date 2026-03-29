import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  HardHat, Tractor, Building2, Edit2, Power, 
  PowerOff, Plus, X, CreditCard, 
  ShoppingBag, ArrowLeft, Users, Briefcase,
  ChevronRight
} from 'lucide-react';

type TabType = 'Empleados' | 'Cabos' | 'Huertas' | 'Proveedores' | 'Cuentas' | 'Clientes' | 'Productos';

const Catalogos = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Empleados');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const catalogConfig: Record<TabType, { label: string, icon: any, color: string, desc: string }> = {
    'Empleados': { label: 'Empleados', icon: Users, color: 'bg-blue-500', desc: 'Personal fijo y administrativo' },
    'Cabos': { label: 'Cabos', icon: HardHat, color: 'bg-orange-500', desc: 'Líderes de cuadrillas externas' },
    'Huertas': { label: 'Huertas', icon: Tractor, color: 'bg-emerald-500', desc: 'Predios y superficies de cultivo' },
    'Proveedores': { label: 'Proveedores', icon: Building2, color: 'bg-slate-500', desc: 'Insumos, servicios y fletes' },
    'Cuentas': { label: 'Cuentas', icon: CreditCard, color: 'bg-purple-500', desc: 'Bancos, cajas y métodos de pago' },
    'Clientes': { label: 'Clientes', icon: Briefcase, color: 'bg-indigo-500', desc: 'Compradores y comercializadoras' },
    'Productos': { label: 'Productos', icon: ShoppingBag, color: 'bg-rose-500', desc: 'Productos y Variedades' }
  };

  const singularTab: Record<TabType, string> = {
    'Empleados': 'Empleado',
    'Cabos': 'Cabo',
    'Huertas': 'Huerta',
    'Proveedores': 'Provedor',
    'Cuentas': 'Cuenta',
    'Clientes': 'Cliente',
    'Productos': 'Producto'
  };

  const { 
    empleados, cabos, huertas, proveedores, cuentasBancarias,
    toggleActivo, addEmpleado, updateEmpleado, addCabo, updateCabo,
    addHuerta, updateHuerta, addProveedor, updateProveedor,
    addCuentaBancaria, updateCuentaBancaria, clientes, addCliente, updateCliente,
    productos, addProducto, updateProducto
  } = useStore(useShallow(state => ({
    empleados: state.empleados,
    cabos: state.cabos,
    huertas: state.huertas,
    proveedores: state.proveedores,
    cuentasBancarias: state.cuentasBancarias,
    clientes: state.clientes,
    productos: state.productos,
    toggleActivo: state.toggleActivo,
    addEmpleado: state.addEmpleado,
    updateEmpleado: state.updateEmpleado,
    addCabo: state.addCabo,
    updateCabo: state.updateCabo,
    addHuerta: state.addHuerta,
    updateHuerta: state.updateHuerta,
    addProveedor: state.addProveedor,
    updateProveedor: state.updateProveedor,
    addCuentaBancaria: state.addCuentaBancaria,
    updateCuentaBancaria: state.updateCuentaBancaria,
    addCliente: state.addCliente,
    updateCliente: state.updateCliente,
    addProducto: state.addProducto,
    updateProducto: state.updateProducto
  })));

  const [formData, setFormData] = useState<any>({});

  const handleToggle = (catalogMapName: 'empleados' | 'cabos' | 'huertas' | 'proveedores' | 'cuentasBancarias' | 'clientes' | 'productos', id: string, name: string) => {
    if (window.confirm(`¿Cambiar el estado de ${name}?`)) {
      toggleActivo(catalogMapName, id);
    }
  };

  const getActiveData = () => {
    switch(activeTab) {
      case 'Empleados': return empleados;
      case 'Cabos': return cabos;
      case 'Huertas': return huertas;
      case 'Proveedores': return proveedores;
      case 'Cuentas': return cuentasBancarias;
      case 'Clientes': return clientes;
      case 'Productos': return productos;
      default: return [];
    }
  };

  const items = getActiveData();

  const handleOpenModal = () => {
    setFormData({});
    setEditingId(null);
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setFormData(item);
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      if (activeTab === 'Empleados') updateEmpleado(editingId, formData);
      else if (activeTab === 'Cabos') updateCabo(editingId, formData);
      else if (activeTab === 'Huertas') updateHuerta(editingId, formData);
      else if (activeTab === 'Proveedores') updateProveedor(editingId, formData);
      else if (activeTab === 'Cuentas') updateCuentaBancaria(editingId, formData);
      else if (activeTab === 'Clientes') updateCliente(editingId, formData);
      else if (activeTab === 'Productos') updateProducto(editingId, formData);
    } else {
      if (activeTab === 'Empleados') addEmpleado(formData);
      else if (activeTab === 'Cabos') addCabo(formData);
      else if (activeTab === 'Huertas') addHuerta(formData);
      else if (activeTab === 'Proveedores') addProveedor(formData);
      else if (activeTab === 'Cuentas') addCuentaBancaria(formData);
      else if (activeTab === 'Clientes') addCliente(formData);
      else if (activeTab === 'Productos') addProducto(formData);
    }
    setShowModal(false);
  };

  const selectCatalog = (tab: TabType) => {
    setActiveTab(tab);
    setView('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
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
            <h1 className="text-4xl md:text-5xl font-display text-agri-900 tracking-tight">
              {view === 'grid' ? 'Catálogos' : catalogConfig[activeTab].label}
            </h1>
            <p className="text-agri-400 text-sm font-medium leading-relaxed italic">
              {view === 'grid' 
                ? 'Administración central de datos maestros y parámetros operativos.' 
                : catalogConfig[activeTab].desc}
            </p>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        /* GRID VIEW: Dashboard Style */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {(Object.keys(catalogConfig) as TabType[]).map((tab) => {
            const config = catalogConfig[tab];
            const Icon = config.icon;
            return (
              <button
                key={tab}
                onClick={() => selectCatalog(tab)}
                className="group relative bg-white p-6 rounded-[2.5rem] border border-agri-100 shadow-sm hover:shadow-xl hover:shadow-agri-600/5 hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden active:scale-[0.98]"
              >
                <div className={`w-14 h-14 ${config.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-display text-agri-900 mb-1 group-hover:text-agri-600 transition-colors">{config.label}</h3>
                  <p className="text-agri-400 text-sm leading-snug">{config.desc}</p>
                </div>
                <div className="absolute top-6 right-6 p-2 rounded-xl bg-agri-50 text-agri-400 group-hover:bg-agri-600 group-hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW: Specific Catalog Items */
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center bg-agri-50/50 p-4 rounded-[2rem] border border-agri-100/50 shadow-inner">
            <div className="flex items-center gap-3 ml-2">
              <div className={`p-2 rounded-xl ${catalogConfig[activeTab].color} text-white`}>
                {React.createElement(catalogConfig[activeTab].icon, { className: 'w-4 h-4' })}
              </div>
              <span className="text-sm font-black text-agri-900 uppercase tracking-widest">{items.length} {catalogConfig[activeTab].label}</span>
            </div>
            <button 
              onClick={handleOpenModal}
              className="bg-agri-600 hover:bg-agri-700 text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-agri-600/20 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nuevo {singularTab[activeTab]}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item: any) => {
              const Icon = catalogConfig[activeTab].icon;
              return (
                <div key={item.id} className={`bg-white rounded-[2rem] p-6 border transition-all duration-200 ${item.activo === false ? 'border-red-100 bg-gray-50 opacity-75' : 'border-agri-100/50 shadow-sm hover:shadow-md'} relative group`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl border ${item.activo === false ? 'bg-gray-200 text-gray-400 border-gray-300' : 'bg-agri-50 text-agri-600 border-agri-100 shadow-inner'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg leading-tight ${item.activo === false ? 'text-gray-600 line-through decoration-gray-400' : 'text-gray-900 italic'}`}>{item.nombre}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.activo === false ? (
                             <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 uppercase">Inactivo</span>
                          ) : (
                             <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100 uppercase tracking-tighter">Activo</span>
                          )}
                          {item.syncStatus === 'pending' && <p className="text-[9px] text-yellow-600 font-bold ml-1 flex items-center gap-1 uppercase tracking-tighter"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span> Local</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-400 hover:text-agri-600 hover:bg-agri-50 rounded-xl transition-all active:scale-90"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          const catalogMap: any = {
                            'Cuentas': 'cuentasBancarias', 'Clientes': 'clientes', 'Empleados': 'empleados',
                            'Cabos': 'cabos', 'Huertas': 'huertas', 'Proveedores': 'proveedores', 'Productos': 'productos'
                          };
                          handleToggle(catalogMap[activeTab], item.id, item.nombre);
                        }}
                        className={`p-2 rounded-xl transition-all active:scale-90 ${item.activo === false ? 'text-green-600 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`}
                      >
                        {item.activo === false ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 mt-4 text-sm font-medium">
                    {activeTab === 'Empleados' && (
                      <>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-50"><span className="text-gray-400 text-xs text uppercase font-bold tracking-tighter">Puesto</span><span className="text-gray-800">{item.puesto}</span></div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-50"><span className="text-gray-400 text-xs text uppercase font-bold tracking-tighter">Sueldo Diario</span><span className="font-bold text-agri-600">${item.sueldoDiario || 0}</span></div>
                        {item.telefono && <div className="flex justify-between items-center py-1.5 border-b border-gray-50"><span className="text-gray-400 text-xs text uppercase font-bold tracking-tighter">Teléfono</span><span className="text-gray-800">{item.telefono}</span></div>}
                      </>
                    )}
                    {activeTab === 'Cabos' && (
                      <>
                        {item.telefono ? <div className="flex justify-between items-center py-1.5 border-b border-gray-50"><span className="text-gray-400 text-xs text uppercase font-bold tracking-tighter">Teléfono</span><span className="text-gray-800">{item.telefono}</span></div> : <p className="text-gray-400 text-xs py-1 italic opacity-60">Sin detalles adicionales</p>}
                      </>
                    )}
                    {activeTab === 'Huertas' && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-50"><span className="text-gray-400 text-xs text uppercase font-bold tracking-tighter">Superficie</span><span className="text-gray-800">{item.hectareas} Has</span></div>
                    )}
                    {activeTab === 'Proveedores' && (
                      <>
                        {item.rfc && <div className="flex justify-between items-center py-1.5 border-b border-gray-50"><span className="text-gray-400 text-xs text uppercase font-bold tracking-tighter">RFC</span><span className="text-gray-800">{item.rfc}</span></div>}
                        {item.telefono && <div className="flex justify-between items-center py-1.5 border-b border-gray-50"><span className="text-gray-400 text-xs text uppercase font-bold tracking-tighter">Teléfono</span><span className="text-gray-800">{item.telefono}</span></div>}
                      </>
                    )}
                    {activeTab === 'Cuentas' && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-50"><span className="text-gray-400 text-xs text uppercase font-bold tracking-tighter">Cuenta / Clabe</span><span className="text-gray-800 truncate max-w-[140px] font-mono text-xs">{item.numero}</span></div>
                    )}
                    {activeTab === 'Clientes' && (
                      <>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-50"><span className="text-gray-400 text-xs text uppercase font-bold tracking-tighter">RFC</span><span className="text-gray-800">{item.rfc || 'X'}</span></div>
                        {item.esExportacion && <div className="flex justify-between items-center py-1.5 border-b border-gray-50"><span className="text-gray-400 text-xs text uppercase font-bold tracking-tighter">Envío</span><span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100 uppercase tracking-tighter">Exportación</span></div>}
                      </>
                    )}

                  </div>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-agri-200 rounded-[3rem] bg-agri-50/30 shadow-inner">
                <div className="bg-white p-5 rounded-[2rem] shadow-sm mb-4">
                  {React.createElement(catalogConfig[activeTab].icon, { className: 'w-8 h-8 text-agri-200' })}
                </div>
                <h3 className="text-xl font-display text-agri-900 mb-1 italic opacity-60">Sin registros aún</h3>
                <p className="text-agri-400 text-sm font-medium">Pulsa el botón superior para agregar el primer registro.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL SECTION */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className={`px-8 py-6 text-white relative flex items-center justify-between shadow-lg ${catalogConfig[activeTab].color}`}>
              <div>
                <h2 className="text-xl font-display text-white">{editingId ? 'Modificar' : 'Alta de'}</h2>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">{singularTab[activeTab]}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white/20 text-white hover:bg-white/30 p-2.5 rounded-2xl transition-all active:scale-95 shadow-inner"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="font-display text-xs font-black uppercase tracking-widest text-agri-900/40 ml-1">
                  {activeTab === 'Productos' ? 'Nombre' : 'Nombre Completo / Razón Social'}
                </label>
                <input required type="text" value={formData.nombre || ''} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full bg-agri-50/30 border border-agri-100/30 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-agri-500/10 outline-none font-bold text-agri-900 transition-all shadow-inner placeholder:opacity-30" placeholder="Nombre completo..." />
              </div>
              
              {activeTab === 'Empleados' && (
                <>
                  <div className="space-y-2">
                    <label className="font-display text-xs font-black uppercase tracking-widest text-agri-900/40 ml-1">Puesto</label>
                    <input required type="text" value={formData.puesto || ''} onChange={e => setFormData({...formData, puesto: e.target.value})} className="w-full bg-agri-50/30 border border-agri-100/30 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-agri-500/10 outline-none font-bold text-agri-900 transition-all shadow-inner" placeholder="Ej: Tractorista" />
                  </div>
                  <div className="space-y-2">
                    <label className="font-display text-xs font-black uppercase tracking-widest text-agri-900/40 ml-1">Sueldo Diario ($)</label>
                    <input required type="number" value={formData.sueldoDiario || ''} onChange={e => setFormData({...formData, sueldoDiario: Number(e.target.value)})} className="w-full bg-agri-50/40 border border-agri-100/50 rounded-2xl px-5 py-4 text-base focus:ring-4 focus:ring-agri-500/10 outline-none font-black text-agri-600 transition-all shadow-inner" placeholder="0.00" />
                  </div>
                </>
              )}

              {activeTab === 'Huertas' && (
                <div className="space-y-2">
                  <label className="font-display text-xs font-black uppercase tracking-widest text-agri-900/40 ml-1">Hectáreas (Opcional)</label>
                  <input type="number" step="0.1" value={formData.hectareas || ''} onChange={e => setFormData({...formData, hectareas: e.target.value})} className="w-full bg-agri-50/30 border border-agri-100/30 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-agri-500/10 outline-none font-bold text-agri-900 shadow-inner" placeholder="0.0" />
                </div>
              )}

              {(activeTab === 'Proveedores' || activeTab === 'Empleados' || activeTab === 'Cabos' || activeTab === 'Clientes') && (
                <div className="space-y-2">
                  <label className="font-display text-xs font-black uppercase tracking-widest text-agri-900/40 ml-1">Teléfono (Opcional)</label>
                  <input type="tel" value={formData.telefono || ''} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full bg-agri-50/30 border border-agri-100/30 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-agri-500/10 outline-none font-bold text-agri-900 shadow-inner" placeholder="667123..." />
                </div>
              )}

              {activeTab === 'Cuentas' && (
                <div className="space-y-2">
                  <label className="font-display text-xs font-black uppercase tracking-widest text-agri-900/40 ml-1">Número de Cuenta / Clabe</label>
                  <input type="text" value={formData.numero || ''} onChange={e => setFormData({...formData, numero: e.target.value})} className="w-full bg-agri-50/30 border border-agri-100/30 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-agri-500/10 outline-none font-mono tracking-widest shadow-inner text-center font-bold" placeholder="0001 ..." />
                </div>
              )}

              <div className="pt-6 flex gap-3 border-t border-agri-50">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-4 border border-agri-100 text-agri-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-agri-50 active:scale-95 transition-all">Cancelar</button>
                <button type="submit" className={`flex-1 px-4 py-4 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all ${catalogConfig[activeTab].color} shadow-${catalogConfig[activeTab].color.split('-')[1]}/20`}>Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogos;
