import { useStore } from '../store/useStore';

export const injectTestData = () => {
  const state = useStore.getState();

  // 1. Crear Temporada
  const testSeasonId = state.addTemporada({
    nombre: 'TEMPORADA TEST (MARZO 2024)',
    descripcion: 'Temporada para pruebas de Balance General',
  });
  
  state.setActiveSeason(testSeasonId);

  // 2. Crear Cuentas Bancarias
  const cuentaId = state.addCuentaBancaria({
    nombre: 'CUENTA OPERATIVA',
    banco: 'BANCO PRUEBA S.A.',
    titular: 'AGRICORE OPERACIONES',
    numero: '987654321',
    saldo: 0
  });

  // 3. Ventas (Folios) con Abonos
  const v1Id = state.addFolio({
    clienteId: 'c1',
    destino: 'EXPORTADORA FRUTY-BEST',
    variedad: 'HASS',
    placas: 'ABC-123',
    peso: '25000',
    precio: '40',
    cuadrillaId: 'c1',
    fleteMonto: 15000,
    comisionMonto: 5000,
    empaqueMonto: 10000,
    metodo: 'Transferencia',
    status: 'Pendiente',
    seasonId: testSeasonId,
  });
  state.setVentaMontoTotal(v1Id, 1000000);
  // Pago parcial (Flujo de entrada)
  state.addAbonoVenta(v1Id, { 
    fecha: '2024-03-20', 
    monto: 600000, 
    metodo: 'Transferencia', 
    cuentaId 
  });

  const v2Id = state.addFolio({
    clienteId: 'c2',
    destino: 'MERCADO LOCAL ABRAHAM',
    variedad: 'MENDEZ',
    placas: 'XYZ-789',
    peso: '10000',
    precio: '20',
    cuadrillaId: 'c2',
    metodo: 'Efectivo',
    status: 'Pendiente',
    seasonId: testSeasonId,
  });
  state.setVentaMontoTotal(v2Id, 200000);
  // Pago parcial en efectivo (Flujo de entrada)
  state.addAbonoVenta(v2Id, { 
    fecha: '2024-03-25', 
    monto: 151000, 
    metodo: 'Efectivo' 
  });

  // 4. Gastos Operativos con Abonos
  const g1Id = state.addGasto({
    concepto: 'FERTILIZANTES Y QUIMICOS',
    monto: 85000,
    categoria: 'Insumos',
    proveedor: 'AGRO-PROVEEDOR CENTRAL',
    metodo: 'Transferencia',
    tieneComprobante: true,
    folio: 'F-123',
    seasonId: testSeasonId,
  });
  // Pago total (Flujo de salida)
  state.addAbonoGasto(g1Id, { 
    fecha: '2024-03-18', 
    monto: 85000, 
    metodo: 'Transferencia', 
    cuentaId 
  });

  const g2Id = state.addGasto({
    concepto: 'DIESEL Y LUBRICANTES',
    monto: 45000,
    categoria: 'Combustibles',
    proveedor: 'GASOLINERA EL ARCO',
    metodo: 'Efectivo',
    tieneComprobante: false,
    folio: '',
    seasonId: testSeasonId,
  });
  // Pago total en efectivo (Flujo de salida)
  state.addAbonoGasto(g2Id, { 
    fecha: '2024-03-22', 
    monto: 45000, 
    metodo: 'Efectivo' 
  });

  // 5. Nóminas (Rayas)
  state.addRayaSemanal({
    empleadoId: 'e1',
    empleadoNombre: 'JUAN PEREZ (MAYORDOMO)',
    puesto: 'Cabo',
    sueldoDiario: 500,
    semana: '2024-W12',
    asistencia: {
      'L': { asistio: true, horasExtra: 0, bonoExtra: 0 },
      'M': { asistio: true, horasExtra: 2, bonoExtra: 0 },
      'X': { asistio: true, horasExtra: 0, bonoExtra: 100 },
      'J': { asistio: true, horasExtra: 0, bonoExtra: 0 },
      'V': { asistio: true, horasExtra: 0, bonoExtra: 0 },
      'S': { asistio: true, horasExtra: 0, bonoExtra: 0 },
      'D': { asistio: false, horasExtra: 0, bonoExtra: 0 },
    },
    cerrada: true,
    seasonId: testSeasonId
  });

  // 6. Cuadrillas
  state.addCuadrilla({
    caboId: 'c1',
    caboNombre: 'CABO MIGUEL',
    personas: 15,
    tarifa: 350,
    flete: 0,
    comida: 0,
    otrosGastos: 0,
    otrosGastosDesc: '',
    huerta: 'HUERTA LOS PINOS',
    fecha: '2024-03-15',
    semana: '2024-W11',
    seasonId: testSeasonId
  });

  state.addCuadrilla({
    caboId: 'c2',
    caboNombre: 'CABO ANTONIO',
    personas: 20,
    tarifa: 350,
    flete: 500,
    comida: 0,
    otrosGastos: 0,
    otrosGastosDesc: '',
    huerta: 'HUERTA EL CARMEN',
    fecha: '2024-03-22',
    semana: '2024-W12',
    seasonId: testSeasonId
  });

  state.addToast('Datos detallados de Egresos, Nómina y Cuadrillas cargados', 'success');
  
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};
