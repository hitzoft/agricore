import { create } from 'zustand';
import { db as localDb } from '../db/db';
import { pushToCloud } from '../lib/dbSync';

// --- Type Definitions ---
export type SyncStatus = 'synced' | 'pending' | 'error';
export type DiaSemana = 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';

export interface BaseRecord {
  id: string;
  syncStatus: SyncStatus;
  updatedAt: string;
  activo?: boolean;
}

export type GastoCategoria = 'Insumos' | 'Operativo' | 'Mantenimiento' | 'Fijo' | 'Caja Chica' | 'Administrativo';

export interface Empleado extends BaseRecord {
  nombre: string;
  puesto: string;
  sueldoDiario: number;
  telefono?: string;
  rfc?: string;
}

export interface Cliente extends BaseRecord {
  nombre: string;
  rfc?: string;
  telefono?: string;
  direccion?: string;
  esExportacion: boolean;
}

export interface Proveedor extends BaseRecord {
  nombre: string;
  rfc?: string;
  telefono?: string;
}

export interface Huerta extends BaseRecord {
  nombre: string;
  hectareas?: number;
}

export interface Cabo extends BaseRecord {
  nombre: string;
  telefono?: string;
}

export interface CuentaBancaria extends BaseRecord {
  nombre: string;
  banco?: string;
  numero?: string;
}

export interface Producto extends BaseRecord {
  nombre: string;
}

export interface PagoDetalle {
  id: string;
  fecha: string;
  monto: number;
  metodo: 'Efectivo' | 'Cuenta';
  cuentaId?: string;
  nota?: string;
}

export type Abono = PagoDetalle;

export interface StatusCambio {
  id: string;
  fecha: string;
  status: string;
  nota?: string;
}

export interface Temporada extends BaseRecord {
  nombre: string;
  descripcion?: string;
  activa: boolean;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface FolioVenta extends BaseRecord {
  folio: string;
  placas: string;
  variedad: string;
  peso: string; // "21,500 kg"
  destino: string;
  fecha: string;
  status: string;
  montoTotal: number;
  precioPorKilo?: number;
  tipoVenta: 'precio_fijo' | 'a_definir';
  clienteId: string;
  esExportacion: boolean;
  abonos: Abono[];
  statusHistory: StatusCambio[];
  seasonId: string;
}

export interface Gasto extends BaseRecord {
  proveedor: string;
  concepto: string;
  monto: number;
  fecha: string;
  fullDate: string; // ISO string for precise filtering
  folio: string;
  tieneComprobante: boolean;
  metodo: 'Efectivo' | 'Cuenta' | 'Crédito';
  abonos: Abono[];
  status: 'Pendiente' | 'Parcial' | 'Pagado';
  cuentaId?: string;
  categoria: GastoCategoria;
  seasonId: string;
}

export interface NominaCuadrilla extends BaseRecord {
  cabo: string;
  personas: number;
  tarifa: number;
  flete: number;
  comida: number;
  otrosGastos: number;
  otrosGastosDesc: string;
  huerta: string;
  fecha: string;
  semana: string;
  pagos: PagoDetalle[];
  status: 'Parcial' | 'Pagada';
  seasonId: string;
}

export interface DiaAsistencia {
  asistio: boolean;
  horasExtra: number;
  bonoExtra: number;
}

export interface RayaSemanal extends BaseRecord {
  empleadoId: string;
  empleadoNombre: string;
  puesto: string;
  sueldoDiario: number;
  semana: string;
  asistencia: Record<DiaSemana, DiaAsistencia>;
  cerrada: boolean;
  seasonId: string;
}

export interface PagoNominaSemanal extends BaseRecord {
  semana: string;
  pagos: PagoDetalle[];
  totalPagado: number;
  status: 'Parcial' | 'Pagada';
  seasonId: string;
}

export interface Alerta {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  text: string;
  time: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppState {
  folios: FolioVenta[];
  gastos: Gasto[];
  cuadrillas: NominaCuadrilla[];
  rayasSemanales: RayaSemanal[];
  pagosNominaSemanal: PagoNominaSemanal[];
  alertas: Alerta[];
  toasts: Toast[];
  proveedores: Proveedor[];
  huertas: Huerta[];
  cabos: Cabo[];
  empleados: Empleado[];
  cuentasBancarias: CuentaBancaria[];
  clientes: Cliente[];
  productos: Producto[];
  temporadas: Temporada[];
  activeSeasonId: string;
  
  // Acciones
  setActiveSeason: (id: string) => void;
  addTemporada: (temp: Partial<Temporada>) => void;
  updateTemporada: (id: string, data: Partial<Temporada>) => void;
  addCliente: (cliente: Omit<Cliente, 'id' | 'syncStatus' | 'updatedAt' | 'activo'>) => string;
  updateCliente: (id: string, data: Partial<Cliente>) => void;
  addFolio: (folio: Omit<FolioVenta, 'id' | 'syncStatus' | 'updatedAt' | 'activo' | 'montoTotal' | 'abonos' | 'statusHistory' | 'folio' | 'esExportacion' | 'fecha'> & { fecha?: string }) => string;
  setVentaMontoTotal: (idVenta: string, monto: number, nota?: string) => void;
  addAbonoVenta: (idVenta: string, abono: Omit<Abono, 'id'>) => void;
  updateVentaStatus: (idVenta: string, status: string, fechaManual?: string, nota?: string) => void;

  addGasto: (gasto: Omit<Gasto, 'id' | 'syncStatus' | 'updatedAt' | 'activo' | 'abonos' | 'status' | 'fecha' | 'fullDate'> & { fecha?: string; fullDate?: string }) => void;
  addAbonoGasto: (idGasto: string, abono: Omit<Abono, 'id'>) => void;
  
  // Catálogos
  addEmpleado: (empleado: Omit<Empleado, 'id' | 'syncStatus' | 'updatedAt' | 'activo'>) => void;
  updateEmpleado: (id: string, data: Partial<Empleado>) => void;
  addCabo: (cabo: Omit<Cabo, 'id' | 'syncStatus' | 'updatedAt' | 'activo'>) => void;
  updateCabo: (id: string, data: Partial<Cabo>) => void;
  addHuerta: (huerta: Omit<Huerta, 'id' | 'syncStatus' | 'updatedAt' | 'activo'>) => void;
  updateHuerta: (id: string, data: Partial<Huerta>) => void;
  addProveedor: (prov: Omit<Proveedor, 'id' | 'syncStatus' | 'updatedAt' | 'activo'>) => Proveedor;
  updateProveedor: (id: string, data: Partial<Proveedor>) => void;
  addCuentaBancaria: (cuenta: Omit<CuentaBancaria, 'id' | 'syncStatus' | 'updatedAt' | 'activo'>) => void;
  updateCuentaBancaria: (id: string, data: Partial<CuentaBancaria>) => void;
  addProducto: (producto: Omit<Producto, 'id' | 'syncStatus' | 'updatedAt' | 'activo'>) => string;
  updateProducto: (id: string, data: Partial<Producto>) => void;
  toggleActivo: (catalog: 'proveedores' | 'huertas' | 'cabos' | 'empleados' | 'cuentasBancarias' | 'clientes' | 'productos' | 'temporadas', id: string) => void;

  addCuadrilla: (cuadrilla: Omit<NominaCuadrilla, 'id' | 'syncStatus' | 'updatedAt' | 'activo' | 'pagos' | 'status'>) => void;
  actualizarCuadrilla: (id: string, data: Partial<NominaCuadrilla>) => void;
  
  // Nomina Semanal
  generarNominaActiva: (semana: string) => void;
  toggleAsistencia: (idRaya: string, dia: DiaSemana) => void;
  setExtras: (idRaya: string, dia: DiaSemana, horasExtra: number, bonoExtra: number) => void;
  setAsistenciaMasiva: (semana: string, dia: DiaSemana, valor: boolean) => void;
  cerrarNomina: (semana: string) => void;
  actualizarRaya: (id: string, data: Partial<RayaSemanal>) => void;
  addPagoNominaSemanal: (semana: string, pago: PagoDetalle) => void;
  actualizarPagosNominaSemanal: (semana: string, pagos: PagoDetalle[]) => void;
  confirmarPagoNomina: (semana: string) => void;
  confirmarPagoCuadrilla: (id: string) => void;

  syncPending: () => Promise<void>;
  addAlert: (alerta: Omit<Alerta, 'id'>) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  clearAllData: () => Promise<void>;
}

export const generateId = () => crypto.randomUUID();

export const useStore = create<AppState>((set) => ({
  empleados: [],
  proveedores: [],
  huertas: [],
  cabos: [],
  folios: [],
  gastos: [],
  cuadrillas: [],
  rayasSemanales: [],
  pagosNominaSemanal: [],
  alertas: [],
  toasts: [],
  cuentasBancarias: [],
  clientes: [],
  productos: [],
  temporadas: [],
  activeSeasonId: '',

  setActiveSeason: (id) => set({ activeSeasonId: id }),

  addTemporada: (tempData) => set((state) => {
    const newRecord: Temporada = { 
      id: generateId(), 
      nombre: tempData.nombre || 'Sin Nombre',
      descripcion: tempData.descripcion || '',
      activa: true,
      syncStatus: 'pending', 
      updatedAt: new Date().toISOString()
    };
    localDb.temporadas.put(newRecord);
    pushToCloud('temporadas', newRecord);
    return { 
      temporadas: [...state.temporadas, newRecord],
      activeSeasonId: newRecord.id 
    };
  }),

  updateTemporada: (id, data) => set((state) => {
    const item = state.temporadas.find(t => t.id === id);
    if (!item) return state;
    const updatedRecord: Temporada = { ...item, ...data, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.temporadas.put(updatedRecord);
    pushToCloud('temporadas', updatedRecord);
    return { temporadas: state.temporadas.map(t => t.id === id ? updatedRecord : t) };
  }),

  toggleActivo: (catalog, id) => set((state) => {
    // @ts-ignore
    const list = state[catalog];
    // @ts-ignore
    const item = list.find(i => i.id === id);
    if (!item) return state;

    const updatedItem = { ...item, activo: item.activo === undefined ? false : !item.activo, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    
    // Save to DBs
    // @ts-ignore
    localDb[catalog].put(updatedItem);
    pushToCloud(catalog, updatedItem);

    // @ts-ignore
    const updatedList = list.map(i => i.id === id ? updatedItem : i);
    return { [catalog]: updatedList };
  }),

  addCliente: (clienteData) => {
    const newId = generateId();
    set((state) => {
      const newRecord: Cliente = { 
        ...clienteData, 
        id: newId, 
        syncStatus: 'pending' as const, 
        updatedAt: new Date().toISOString(), 
        activo: true 
      };
      localDb.clientes.put(newRecord);
      pushToCloud('clientes', newRecord);
      return { clientes: [newRecord, ...state.clientes] };
    });
    return newId;
  },

  updateCliente: (id, data) => set((state) => {
    const client = state.clientes.find(c => c.id === id);
    if (!client) return state;

    const updatedRecord: Cliente = { ...client, ...data, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.clientes.put(updatedRecord);
    pushToCloud('clientes', updatedRecord);

    return {
      clientes: state.clientes.map(c => c.id === id ? updatedRecord : c)
    };
  }),

  // CxC Actions
  setVentaMontoTotal: (idVenta, monto, nota) => set(state => {
    const venta = state.folios.find(f => f.id === idVenta);
    if (!venta || venta.status === 'Liquidado') return state;

    const updatedRecord: FolioVenta = { 
      ...venta, 
      montoTotal: monto, 
      statusHistory: [
        { 
          id: generateId(), 
          fecha: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }), 
          status: venta.status, 
          nota: nota || 'Definición de precio' 
        },
        ...venta.statusHistory
      ],
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending' as const
    };

    localDb.folios.put(updatedRecord);
    pushToCloud('folios', updatedRecord);

    return {
      folios: state.folios.map(f => f.id === idVenta ? updatedRecord : f),
      alertas: [{ id: generateId(), type: 'success', text: `Monto total de venta definido: $${monto.toLocaleString()}`, time: 'Ahora' }, ...state.alertas]
    };
  }),

  addAbonoVenta: (idVenta, abono) => set(state => {
    const venta = state.folios.find(f => f.id === idVenta);
    if (!venta || venta.status === 'Liquidado') return state;

    const totalPagado = venta.abonos.reduce((acc, a) => acc + a.monto, 0) + abono.monto;
    const isNewlyLiquidated = venta.montoTotal > 0 && totalPagado >= venta.montoTotal;
    
    const updatedRecord: FolioVenta = { 
      ...venta, 
      status: isNewlyLiquidated ? 'Liquidado' : venta.status,
      abonos: [...venta.abonos, { ...abono, id: generateId() }],
      statusHistory: isNewlyLiquidated ? [
        { 
          id: generateId(), 
          fecha: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }), 
          status: 'Liquidado', 
          nota: 'Liquidación automática por pago total' 
        },
        ...venta.statusHistory
      ] : venta.statusHistory,
      syncStatus: 'pending' as const,
      updatedAt: new Date().toISOString()
    };

    localDb.folios.put(updatedRecord);
    pushToCloud('folios', updatedRecord);

    return {
      folios: state.folios.map(f => f.id === idVenta ? updatedRecord : f),
      alertas: [{ id: generateId(), type: 'info', text: `Abono registrado exitosamente por $${abono.monto}`, time: 'Ahora' }, ...state.alertas]
    }
  }),

  updateVentaStatus: (idVenta, status, fechaManual, nota) => set(state => {
    const venta = state.folios.find(f => f.id === idVenta);
    
    if (!venta || venta.status === 'Liquidado') return state;
    if (status === 'Liquidado') return state;

    const fecha = fechaManual || new Date().toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const updatedRecord: FolioVenta = { 
      ...venta, 
      status, 
      statusHistory: [
        { id: generateId(), fecha, status, nota },
        ...venta.statusHistory
      ],
      syncStatus: 'pending' as const,
      updatedAt: new Date().toISOString()
    };

    localDb.folios.put(updatedRecord);
    pushToCloud('folios', updatedRecord);
    
    return {
      folios: state.folios.map(f => f.id === idVenta ? updatedRecord : f),
      alertas: [{ id: generateId(), type: 'info', text: `Estado de venta actualizado a: ${status}`, time: 'Ahora' }, ...state.alertas]
    }
  }),

  // Nomina semanal actions
  generarNominaActiva: (semana) => set((state) => {
    const nuevasRayas = [...state.rayasSemanales];
    let agregadas = 0;
    
    const activos = state.empleados.filter(e => e.activo !== false);
    
    if (activos.length === 0) {
      setTimeout(() => state.addToast('No hay empleados activos en el catálogo para generar la nómina.', 'warning'), 0);
      return state;
    }

    activos.forEach(emp => {
      const existe = nuevasRayas.find(r => r.empleadoId === emp.id && r.semana === semana && r.seasonId === state.activeSeasonId);
      if(!existe) {
        const newRaya: RayaSemanal = {
          id: `raya_${semana}_${emp.id}_${state.activeSeasonId}`.replace(/\s+/g, '_'), 
          empleadoId: emp.id, 
          empleadoNombre: emp.nombre, 
          puesto: emp.puesto,
          sueldoDiario: emp.sueldoDiario || 0, 
          semana, 
          cerrada: false,
          seasonId: state.activeSeasonId,
          asistencia: {
            'L': { asistio: false, horasExtra: 0, bonoExtra: 0 }, 'M': { asistio: false, horasExtra: 0, bonoExtra: 0 }, 'X': { asistio: false, horasExtra: 0, bonoExtra: 0 },
            'J': { asistio: false, horasExtra: 0, bonoExtra: 0 }, 'V': { asistio: false, horasExtra: 0, bonoExtra: 0 }, 'S': { asistio: false, horasExtra: 0, bonoExtra: 0 }, 'D': { asistio: false, horasExtra: 0, bonoExtra: 0 },
          },
          syncStatus: 'pending' as const, updatedAt: new Date().toISOString()
        };
        nuevasRayas.push(newRaya);
        localDb.rayasSemanales.put(newRaya);
        pushToCloud('rayasSemanales', newRaya);
        agregadas++;
      }
    });

    if (agregadas > 0) {
       setTimeout(() => state.addToast(`Se generó la nómina con ${agregadas} empleados.`, 'success'), 0);
    }
    
    return { rayasSemanales: nuevasRayas };
  }),

  toggleAsistencia: (idRaya, dia) => set(state => {
    const raya = state.rayasSemanales.find(r => r.id === idRaya);
    if (!raya) return state;

    const updatedRecord: RayaSemanal = { 
      ...raya, 
      asistencia: { 
        ...raya.asistencia, 
        [dia]: { ...raya.asistencia[dia], asistio: !raya.asistencia[dia].asistio } 
      },
      syncStatus: 'pending' as const,
      updatedAt: new Date().toISOString()
    };
    
    localDb.rayasSemanales.put(updatedRecord);
    pushToCloud('rayasSemanales', updatedRecord);

    return {
      rayasSemanales: state.rayasSemanales.map(r => r.id === idRaya ? updatedRecord : r)
    };
  }),

  setExtras: (idRaya, dia, horasExtra, bonoExtra) => set(state => {
    const raya = state.rayasSemanales.find(r => r.id === idRaya);
    if (!raya) return state;

    const updatedRecord: RayaSemanal = { 
      ...raya, 
      asistencia: { 
        ...raya.asistencia, 
        [dia]: { ...raya.asistencia[dia], horasExtra, bonoExtra } 
      },
      syncStatus: 'pending' as const,
      updatedAt: new Date().toISOString()
    };

    localDb.rayasSemanales.put(updatedRecord);
    pushToCloud('rayasSemanales', updatedRecord);

    return {
      rayasSemanales: state.rayasSemanales.map(r => r.id === idRaya ? updatedRecord : r)
    };
  }),

  setAsistenciaMasiva: (semana, dia, valor) => set((state) => {
    const raysToUpdate = state.rayasSemanales.filter(r => r.semana === semana && !r.cerrada);
    
    raysToUpdate.forEach(r => {
      const updatedRecord: RayaSemanal = {
        ...r,
        asistencia: {
          ...r.asistencia,
          [dia]: { ...r.asistencia[dia], asistio: valor }
        },
        syncStatus: 'pending' as const,
        updatedAt: new Date().toISOString()
      };
      localDb.rayasSemanales.put(updatedRecord);
      pushToCloud('rayasSemanales', updatedRecord);
    });

    return {
      rayasSemanales: state.rayasSemanales.map(r => 
        r.semana === semana && !r.cerrada
          ? {
              ...r,
              asistencia: {
                ...r.asistencia,
                [dia]: { ...r.asistencia[dia], asistio: valor }
              },
              syncStatus: 'pending' as const,
              updatedAt: new Date().toISOString()
            }
          : r
      )
    };
  }),

  cerrarNomina: (semana) => set(state => {
    const raysToClose = state.rayasSemanales.filter(r => r.semana === semana);
    
    raysToClose.forEach(r => {
      const updatedRecord: RayaSemanal = { ...r, cerrada: true, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
      localDb.rayasSemanales.put(updatedRecord);
      pushToCloud('rayasSemanales', updatedRecord);
    });

    return {
      rayasSemanales: state.rayasSemanales.map(r => r.semana === semana ? { ...r, cerrada: true } : r),
      alertas: [{ id: generateId(), type: 'info', text: `La ${semana} de Rayas fue CERRADA.`, time: 'Ahora' }, ...state.alertas]
    }
  }),

  addFolio: (folioData) => {
    const newId = generateId();
    let newFolioNumber = '';

    set((state) => {
      const lastFolio = state.folios
        .filter(f => f.folio.startsWith('V-'))
        .map(f => parseInt(f.folio.split('-')[1]))
        .sort((a, b) => b - a)[0] || 0;
      
      newFolioNumber = `V-${String(lastFolio + 1).padStart(3, '0')}`;
      
      let montoTotal = 0;
      if (folioData.tipoVenta === 'precio_fijo' && folioData.precioPorKilo) {
        const weight = parseFloat(folioData.peso.replace(/[^0-9.]/g, '')) || 0;
        montoTotal = weight * folioData.precioPorKilo;
      }

      const client = state.clientes.find(c => c.id === folioData.clienteId);
      const now = new Date();
      const finalFecha = folioData.fecha || now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      const historyFecha = folioData.fecha ? 
        new Date(folioData.fecha).toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' }) : 
        now.toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' });

      const newFolioRecord: FolioVenta = { 
        ...folioData,
        fecha: finalFecha,
        folio: newFolioNumber,
        montoTotal, 
        esExportacion: client?.esExportacion || false,
        abonos: [], 
        statusHistory: [{
          id: generateId(),
          fecha: historyFecha,
          status: folioData.status,
          nota: 'Registro inicial de salida'
        }],
        seasonId: state.activeSeasonId,
        id: newId, 
        syncStatus: 'pending' as const, 
        updatedAt: now.toISOString() 
      };

      localDb.folios.put(newFolioRecord);
      pushToCloud('folios', newFolioRecord);

      return { 
        folios: [newFolioRecord, ...state.folios],
        alertas: [
          { 
            id: generateId(), 
            type: 'info', 
            text: `Nueva Venta: ${newFolioNumber} (${client?.nombre || 'Sin Cliente'})`, 
            time: 'Ahora' 
          }, 
          ...state.alertas
        ]
      };
    });
    return newId;
  },

  addCuadrilla: (cuadrillaData) => set((state) => {
    const newRecord: NominaCuadrilla = { 
      ...cuadrillaData, 
      pagos: [], 
      status: 'Parcial', 
      seasonId: state.activeSeasonId,
      id: generateId(), 
      syncStatus: 'pending' as const, 
      updatedAt: new Date().toISOString() 
    };
    localDb.cuadrillas.put(newRecord);
    pushToCloud('cuadrillas', newRecord);
    return { 
      cuadrillas: [newRecord, ...state.cuadrillas],
      alertas: [
        { 
          id: generateId(), 
          type: 'info', 
          text: `Nueva Cuadrilla: ${newRecord.cabo} (${newRecord.huerta})`, 
          time: 'Ahora' 
        }, 
        ...state.alertas
      ]
    };
  }),

  actualizarCuadrilla: (id, data) => set((state) => {
    const item = state.cuadrillas.find(c => c.id === id);
    if (!item) return state;
    const updatedRecord: NominaCuadrilla = { ...item, ...data, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.cuadrillas.put(updatedRecord);
    pushToCloud('cuadrillas', updatedRecord);
    return { cuadrillas: state.cuadrillas.map(c => c.id === id ? updatedRecord : c) };
  }),

  actualizarRaya: (id, data) => set((state) => {
    const item = state.rayasSemanales.find(r => r.id === id);
    if (!item) return state;
    const updatedRecord: RayaSemanal = { ...item, ...data, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.rayasSemanales.put(updatedRecord);
    pushToCloud('rayasSemanales', updatedRecord);
    return { rayasSemanales: state.rayasSemanales.map(r => r.id === id ? updatedRecord : r) };
  }),

  addPagoNominaSemanal: (semana, pago) => set((state) => {
    const existing = state.pagosNominaSemanal.find(p => p.semana === semana && p.seasonId === state.activeSeasonId);
    let updatedRecord: PagoNominaSemanal;

    if (existing) {
      updatedRecord = { 
        ...existing, 
        pagos: [...existing.pagos, pago], 
        totalPagado: existing.totalPagado + pago.monto,
        syncStatus: 'pending' as const,
        updatedAt: new Date().toISOString() 
      };
    } else {
      updatedRecord = { 
        id: `pagos_semana_${semana}_${state.activeSeasonId}`.replace(/\s+/g, '_'), 
        semana, 
        pagos: [pago], 
        totalPagado: pago.monto, 
        status: 'Parcial', 
        seasonId: state.activeSeasonId,
        syncStatus: 'pending' as const, 
        updatedAt: new Date().toISOString() 
      };
    }

    localDb.pagosNominaSemanal.put(updatedRecord);
    pushToCloud('pagosNominaSemanal', updatedRecord);

    if (existing) {
      return {
        pagosNominaSemanal: state.pagosNominaSemanal.map(p => p.semana === semana ? updatedRecord : p)
      };
    } else {
      return {
        pagosNominaSemanal: [updatedRecord, ...state.pagosNominaSemanal]
      };
    }
  }),

  actualizarPagosNominaSemanal: (semana: string, pagos: PagoDetalle[]) => set((state) => {
    const existing = state.pagosNominaSemanal.find(p => p.semana === semana && p.seasonId === state.activeSeasonId);
    const totalPagado = pagos.reduce((acc: number, p: PagoDetalle) => acc + p.monto, 0);
    let updatedRecord: PagoNominaSemanal;

    if (existing) {
      updatedRecord = { ...existing, pagos, totalPagado, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    } else {
      updatedRecord = { 
        id: `pagos_semana_${semana}_${state.activeSeasonId}`.replace(/\s+/g, '_'), 
        semana, 
        pagos, 
        totalPagado, 
        status: 'Parcial', 
        seasonId: state.activeSeasonId,
        syncStatus: 'pending' as const, 
        updatedAt: new Date().toISOString() 
      };
    }

    localDb.pagosNominaSemanal.put(updatedRecord);
    pushToCloud('pagosNominaSemanal', updatedRecord);

    if (existing) {
      return {
        pagosNominaSemanal: state.pagosNominaSemanal.map(p => p.semana === semana ? updatedRecord : p)
      };
    } else {
      return {
        pagosNominaSemanal: [updatedRecord, ...state.pagosNominaSemanal]
      };
    }
  }),

  confirmarPagoNomina: (semana: string) => set((state) => {
    const existing = state.pagosNominaSemanal.find(p => p.semana === semana);
    if (!existing) return state;
    
    const updatedRecord: PagoNominaSemanal = { ...existing, status: 'Pagada', syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.pagosNominaSemanal.put(updatedRecord);
    pushToCloud('pagosNominaSemanal', updatedRecord);

    return {
      pagosNominaSemanal: state.pagosNominaSemanal.map(p => p.semana === semana ? updatedRecord : p),
      toasts: [{ id: generateId(), message: `Nómina de la semana ${semana} marcada como PAGADA.`, type: 'success' }, ...state.toasts]
    };
  }),
 
  confirmarPagoCuadrilla: (id: string) => set((state) => {
    const item = state.cuadrillas.find(c => c.id === id);
    if (!item) return state;
    const updatedRecord: NominaCuadrilla = { ...item, status: 'Pagada', syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.cuadrillas.put(updatedRecord);
    pushToCloud('cuadrillas', updatedRecord);

    return {
      cuadrillas: state.cuadrillas.map(c => c.id === id ? updatedRecord : c),
      toasts: [{ id: generateId(), message: `Pago de cabo marcado como PAGADO.`, type: 'success' }, ...state.toasts]
    };
  }),

  addProveedor: (provData) => {
    let newRecord: Proveedor = { id: '' } as any;
    set((state) => {
      newRecord = { ...provData, activo: true, id: generateId(), syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
      localDb.proveedores.put(newRecord);
      pushToCloud('proveedores', newRecord);
      return { proveedores: [newRecord, ...state.proveedores] };
    });
    return newRecord;
  },

  addHuerta: (huertaData) => set((state) => {
    const newRecord: Huerta = { ...huertaData, activo: true, id: generateId(), syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.huertas.put(newRecord);
    pushToCloud('huertas', newRecord);
    return { huertas: [newRecord, ...state.huertas] };
  }),

  addCabo: (caboData) => set((state) => {
    const newRecord: Cabo = { ...caboData, activo: true, id: generateId(), syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.cabos.put(newRecord);
    pushToCloud('cabos', newRecord);
    return { cabos: [newRecord, ...state.cabos] };
  }),

  addEmpleado: (empData) => set((state) => {
    const newRecord: Empleado = { ...empData, activo: true, id: generateId(), syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.empleados.put(newRecord);
    pushToCloud('empleados', newRecord);
    return { empleados: [newRecord, ...state.empleados] };
  }),
  
  updateEmpleado: (id, data) => set((state) => {
    const item = state.empleados.find(e => e.id === id);
    if (!item) return state;
    const updatedRecord: Empleado = { ...item, ...data, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.empleados.put(updatedRecord);
    pushToCloud('empleados', updatedRecord);
    return { empleados: state.empleados.map(e => e.id === id ? updatedRecord : e) };
  }),

  updateCabo: (id, data) => set((state) => {
    const item = state.cabos.find(c => c.id === id);
    if (!item) return state;
    const updatedRecord: Cabo = { ...item, ...data, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.cabos.put(updatedRecord);
    pushToCloud('cabos', updatedRecord);
    return { cabos: state.cabos.map(c => c.id === id ? updatedRecord : c) };
  }),

  updateHuerta: (id, data) => set((state) => {
    const item = state.huertas.find(h => h.id === id);
    if (!item) return state;
    const updatedRecord: Huerta = { ...item, ...data, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.huertas.put(updatedRecord);
    pushToCloud('huertas', updatedRecord);
    return { huertas: state.huertas.map(h => h.id === id ? updatedRecord : h) };
  }),

  updateProveedor: (id, data) => set((state) => {
    const item = state.proveedores.find(p => p.id === id);
    if (!item) return state;
    const updatedRecord: Proveedor = { ...item, ...data, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.proveedores.put(updatedRecord);
    pushToCloud('proveedores', updatedRecord);
    return { proveedores: state.proveedores.map(p => p.id === id ? updatedRecord : p) };
  }),

  addCuentaBancaria: (cuentaData) => set((state) => {
    const newRecord: CuentaBancaria = { ...cuentaData, activo: true, id: generateId(), syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.cuentasBancarias.put(newRecord);
    pushToCloud('cuentasBancarias', newRecord);
    return { cuentasBancarias: [newRecord, ...state.cuentasBancarias] };
  }),

  updateCuentaBancaria: (id, data) => set((state) => {
    const item = state.cuentasBancarias.find(c => c.id === id);
    if (!item) return state;
    const updatedRecord: CuentaBancaria = { ...item, ...data, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    localDb.cuentasBancarias.put(updatedRecord);
    pushToCloud('cuentasBancarias', updatedRecord);
    return { cuentasBancarias: state.cuentasBancarias.map(c => c.id === id ? updatedRecord : c) };
  }),

  addProducto: (productoData) => {
    const newId = generateId();
    set((state) => {
      const newRecord: Producto = { 
        ...productoData, 
        activo: true, 
        id: newId, 
        syncStatus: 'pending' as const, 
        updatedAt: new Date().toISOString() 
      };
      // @ts-ignore
      localDb.productos.put(newRecord);
      pushToCloud('productos', newRecord);
      return { productos: [newRecord, ...state.productos] };
    });
    return newId;
  },

  updateProducto: (id, data) => set((state) => {
    const item = state.productos.find(p => p.id === id);
    if (!item) return state;
    const updatedRecord: Producto = { ...item, ...data, syncStatus: 'pending' as const, updatedAt: new Date().toISOString() };
    // @ts-ignore
    localDb.productos.put(updatedRecord);
    pushToCloud('productos', updatedRecord);
    return { productos: state.productos.map(p => p.id === id ? updatedRecord : p) };
  }),

  addGasto: (gastoData: any) => set((state) => {
    const now = new Date();
    let finalFullDate = gastoData.fullDate || now.toISOString();
    
    if (gastoData.fullDate && gastoData.fullDate.length === 10) {
      const timeStr = now.toISOString().substring(10);
      finalFullDate = gastoData.fullDate + timeStr;
    }

    const d = new Date(finalFullDate);
    const finalFecha = gastoData.fecha || d.toLocaleDateString('es-MX', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    });

    const newRecord: Gasto = { 
      ...gastoData, 
      abonos: [], 
      status: gastoData.metodo === 'Crédito' ? 'Pendiente' : 'Pagado',
      fecha: finalFecha,
      fullDate: finalFullDate,
      seasonId: state.activeSeasonId,
      id: generateId(), 
      syncStatus: 'pending' as const, 
      updatedAt: now.toISOString() 
    };

    localDb.gastos.put(newRecord);
    pushToCloud('gastos', newRecord);

    return {
      gastos: [newRecord, ...state.gastos],
      alertas: [
        { 
          id: generateId(), 
          type: 'warning', 
          text: `Nuevo Gasto: ${newRecord.concepto} ($${newRecord.monto.toLocaleString()})`, 
          time: 'Ahora' 
        }, 
        ...state.alertas
      ]
    };
  }),

  addAbonoGasto: (idGasto, abono) => set(state => {
    const gasto = state.gastos.find(g => g.id === idGasto);
    if (!gasto || gasto.status === 'Pagado') return state;

    const totalPagado = gasto.abonos.reduce((acc, a) => acc + a.monto, 0) + abono.monto;
    const isNewlyPaid = totalPagado >= gasto.monto;

    const updatedRecord: Gasto = {
      ...gasto,
      status: isNewlyPaid ? 'Pagado' : 'Parcial',
      abonos: [...gasto.abonos, { ...abono, id: generateId() }],
      syncStatus: 'pending' as const,
      updatedAt: new Date().toISOString()
    };

    localDb.gastos.put(updatedRecord);
    pushToCloud('gastos', updatedRecord);

    return {
      gastos: state.gastos.map(g => g.id === idGasto ? updatedRecord : g),
      toasts: [{ id: generateId(), message: `Abono de $${abono.monto} registrado correctamente.`, type: 'success' }, ...state.toasts]
    };
  }),

  addAlert: (alerta) => set((state) => ({
    alertas: [{ id: generateId(), ...alerta, timestamp: new Date().toISOString() }, ...state.alertas]
  })),

  addToast: (message, type = 'info') => set((state) => {
    const id = generateId();
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, 4000);
    return { toasts: [...state.toasts, { id, message, type }] };
  }),

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),

  syncPending: async () => {
    const { syncLocalToCloud } = await import('../lib/dbSync');
    await syncLocalToCloud();
  },

  clearAllData: async () => {
    const { clearHistoryFromCloud } = await import('../lib/dbSync');
    
    // 1. Clear Firestore FIRST
    await clearHistoryFromCloud();

    const collectionsToClear = ['folios', 'gastos', 'cuadrillas', 'rayasSemanales', 'pagosNominaSemanal', 'temporadas'];
    
    // 2. Clear IndexedDB
    for (const col of collectionsToClear) {
      // @ts-ignore
      await localDb[col].clear();
    }

    // 3. Update State
    set({
      folios: [],
      gastos: [],
      cuadrillas: [],
      rayasSemanales: [],
      pagosNominaSemanal: [],
      temporadas: [],
      activeSeasonId: '',
      toasts: [{ id: generateId(), message: 'Historial borrado de la nube y localmente.', type: 'success' }, ...useStore.getState().toasts]
    });
  }
}));
