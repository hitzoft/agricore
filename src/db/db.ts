import Dexie, { type Table } from 'dexie';
import type { 
  Empleado, Cliente, Proveedor, Huerta, Cabo, 
  CuentaBancaria, FolioVenta, Gasto, 
  NominaCuadrilla, RayaSemanal, PagoNominaSemanal, Producto, Temporada
} from '../store/useStore';

export class AgricoreDB extends Dexie {
  empleados!: Table<Empleado>;
  clientes!: Table<Cliente>;
  proveedores!: Table<Proveedor>;
  huertas!: Table<Huerta>;
  cabos!: Table<Cabo>;
  cuentasBancarias!: Table<CuentaBancaria>;
  folios!: Table<FolioVenta>;
  gastos!: Table<Gasto>;
  cuadrillas!: Table<NominaCuadrilla>;
  rayasSemanales!: Table<RayaSemanal>;
  pagosNominaSemanal!: Table<PagoNominaSemanal>;
  productos!: Table<Producto>;
  temporadas!: Table<Temporada>;

  constructor() {
    super('AgricoreDB');
    this.version(3).stores({
      empleados: 'id, nombre, puesto, activo, syncStatus',
      clientes: 'id, nombre, rfc, activo, syncStatus',
      proveedores: 'id, nombre, activo, syncStatus',
      huertas: 'id, nombre, activo, syncStatus',
      cabos: 'id, nombre, activo, syncStatus',
      cuentasBancarias: 'id, nombre, banco, syncStatus',
      folios: 'id, folio, status, clienteId, fecha, seasonId, syncStatus',
      gastos: 'id, proveedor, fecha, status, seasonId, syncStatus',
      cuadrillas: 'id, cabo, huerta, semana, fecha, seasonId, syncStatus',
      rayasSemanales: 'id, empleadoId, semana, seasonId, syncStatus',
      pagosNominaSemanal: 'id, semana, seasonId, syncStatus',
      productos: 'id, nombre, activo, syncStatus',
      temporadas: 'id, nombre, activa, syncStatus'
    });
  }
}

export const db = new AgricoreDB();
