import { db } from '../db/db';
import { pushToCloud } from '../lib/dbSync';
export async function seedMockData() {
  const products = [
    { name: 'Aguacate Hass' },
    { name: 'Aguacate Mendez' },
    { name: 'Aguacate Flor de Loca' }
  ];

  const employees = [
    { name: 'Juan Pérez', puesto: 'Cortador', sueldoDiario: 450 },
    { name: 'María García', puesto: 'Seleccionadora', sueldoDiario: 420 },
    { name: 'Pedro López', puesto: 'Chofer', sueldoDiario: 600 },
    { name: 'Ana Martínez', puesto: 'Administrativo', sueldoDiario: 750 },
    { name: 'José Rodríguez', puesto: 'General', sueldoDiario: 400 }
  ];

  const cabos = [
    { name: 'Cabo Roberto', telefono: '3310001122' },
    { name: 'Cabo Felipe', telefono: '3310003344' }
  ];

  const huertas = [
    { name: 'Huerta El Refugio', hectareas: 14.5 },
    { name: 'Huerta La Esperanza', hectareas: 10.2 }
  ];

  const clients = [
    { name: 'Frutas del Pacífico', esExportacion: false },
    { name: 'Exportadora San José', esExportacion: true },
    { name: 'Mercado Local', esExportacion: false }
  ];

  const providers = [
    { name: 'Fertilizantes del Agro' },
    { name: 'Maquinaria Pesada S.A.' },
    { name: 'Empaques Industriales' }
  ];

  const accounts = [
    { name: 'BBVA Principal', banco: 'BBVA', numero: '1234' },
    { name: 'Banorte Operativa', banco: 'Banorte', numero: '5678' }
  ];

  try {
    const updatedAt = new Date().toISOString();

    for (const p of products) {
      const id = crypto.randomUUID();
      const product = { id, nombre: p.name, activo: true, syncStatus: 'pending' as const, updatedAt };
      await db.productos.add(product);
      await pushToCloud('productos', product);
    }

    for (const e of employees) {
      const id = crypto.randomUUID();
      const employee = { 
        id, 
        nombre: e.name, 
        puesto: e.puesto, 
        sueldoDiario: e.sueldoDiario, 
        activo: true, 
        syncStatus: 'pending' as const, 
        updatedAt 
      };
      await db.empleados.add(employee);
      await pushToCloud('empleados', employee);
    }

    for (const c of cabos) {
      const id = crypto.randomUUID();
      const cabo = { 
        id, 
        nombre: c.name, 
        telefono: c.telefono, 
        activo: true, 
        syncStatus: 'pending' as const, 
        updatedAt 
      };
      await db.cabos.add(cabo);
      await pushToCloud('cabos', cabo);
    }

    for (const h of huertas) {
      const id = crypto.randomUUID();
      const huerta = { 
        id, 
        nombre: h.name, 
        hectareas: h.hectareas, 
        activo: true, 
        syncStatus: 'pending' as const, 
        updatedAt 
      };
      await db.huertas.add(huerta);
      await pushToCloud('huertas', huerta);
    }

    for (const c of clients) {
      const id = crypto.randomUUID();
      const client = { 
        id, 
        nombre: c.name, 
        esExportacion: c.esExportacion, 
        activo: true, 
        syncStatus: 'pending' as const, 
        updatedAt 
      };
      await db.clientes.add(client);
      await pushToCloud('clientes', client);
    }

    for (const p of providers) {
      const id = crypto.randomUUID();
      const provider = { 
        id, 
        nombre: p.name, 
        activo: true, 
        syncStatus: 'pending' as const, 
        updatedAt 
      };
      await db.proveedores.add(provider);
      await pushToCloud('proveedores', provider);
    }

    for (const a of accounts) {
      const id = crypto.randomUUID();
      const account = { 
        id, 
        nombre: a.name, 
        banco: a.banco, 
        numero: a.numero, 
        activo: true, 
        syncStatus: 'pending' as const, 
        updatedAt 
      };
      await db.cuentasBancarias.add(account);
      await pushToCloud('cuentasBancarias', account);
    }

    return true;
  } catch (error) {
    console.error('Error seeding data:', error);
    return false;
  }
}
