import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where,
  runTransaction,
  getDocs
} from 'firebase/firestore';
import { db as firebaseDb, auth } from './firebase';
import { db as localDb } from '../db/db';
import { useStore } from '../store/useStore';

const collections = [
  'empleados', 'clientes', 'proveedores', 'huertas', 
  'cabos', 'cuentasBancarias', 'folios', 'gastos', 
  'cuadrillas', 'rayasSemanales', 'pagosNominaSemanal', 'productos', 'temporadas'
];

export async function syncLocalToCloud() {
  const user = auth.currentUser;
  const { addToast } = useStore.getState();

  if (!user) {
    console.error('[Sync] Intento de sincronización sin usuario autenticado.');
    addToast('Sesión no detectada. Por favor, reingresa.', 'error');
    return;
  }

  console.log('Iniciando sincronización de salida (local -> nube)...');
  let totalSynced = 0;

  for (const colName of collections) {
    // @ts-ignore
    const pendingItems = await localDb[colName].where('syncStatus').equals('pending').toArray();
    if (pendingItems.length > 0) {
      console.log(`[Sync] Encontrados ${pendingItems.length} registros pendientes en ${colName}...`);
      for (const item of pendingItems) {
        const success = await pushToCloud(colName, item);
        if (success) totalSynced++;
      }
    }
  }
  
  if (totalSynced > 0) {
    addToast(`Sincronización exitosa: ${totalSynced} registros subidos.`, 'success');
  }
  console.log('Sincronización de salida completada.');
}

export async function startSync() {
  const user = auth.currentUser;
  if (!user) return;

  // 1. CARGA INICIAL INSTANTÁNEA (PRIORIDAD LOCAL)
  await refreshStore();
  console.log('[Sync] Datos locales cargados.');

  // 2. INTENTAR SUBIR CAMBIOS PENDIENTES SI HAY RED
  if (navigator.onLine) {
    try {
      await syncLocalToCloud();
    } catch (err) {
      console.warn('[Sync] No se pudo subir datos locales (offline).');
    }
  }

  // 3. SUSCRIBIRSE A CAMBIOS DE LA NUBE
  const unsubscribes = collections.map(colName => {
    const q = query(
      collection(firebaseDb, colName), 
      where('ownerId', '==', user.uid)
    );

    return onSnapshot(q, async (snapshot) => {
      console.log(`[Sync] OK -> Recibidos ${snapshot.docs.length} documentos para ${colName}`);
      
      const promises = snapshot.docChanges().map(async (change) => {
        const data = change.doc.data();
        const id = change.doc.id;
        
        if (change.type === 'added' || change.type === 'modified') {
          // @ts-ignore
          await localDb[colName].put({ ...data, id });
        } else if (change.type === 'removed') {
          // @ts-ignore
          await localDb[colName].delete(id);
        }
      });

      await Promise.all(promises);
      await refreshStore();
    }, (error) => {
      console.error(`[Sync Error] Falla en ${colName}:`, error);
    });
  });

  return () => unsubscribes.forEach(unsub => unsub());
}

export async function refreshStore() {
  const stateUpdates: any = {};
  
  for (const colName of collections) {
    // @ts-ignore
    const data = await localDb[colName].toArray();
    stateUpdates[colName] = data;
  }

  useStore.setState(stateUpdates);
 
  // Auto-activate season if none selected but we have seasons
  const currentStore = useStore.getState();
  if (!currentStore.activeSeasonId && stateUpdates.temporadas?.length > 0) {
    const active = stateUpdates.temporadas.find((t: any) => t.activa) || stateUpdates.temporadas[0];
    if (active) useStore.setState({ activeSeasonId: active.id });
  }
}

/**
 * Lógica de Re-foliado:
 * Si el folio ya existe en la nube (porque otro dispositivo lo usó mientras estábamos offline),
 * esta función busca el siguiente disponible y actualiza el registro.
 */
async function checkAndRefolio(data: any): Promise<any> {
  const user = auth.currentUser;
  if (!user || !data.folio || !data.folio.startsWith('V-')) return data;

  return await runTransaction(firebaseDb, async () => {
    // 1. Verificar si el folio actual ya existe para este usuario
    const q = query(
      collection(firebaseDb, 'folios'),
      where('ownerId', '==', user.uid),
      where('folio', '==', data.folio)
    );
    
    // Nota: Por simplicidad en este entorno usamos una búsqueda rápida.
    // En producción esto se puede optimizar con un documento "counters".
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // El folio es seguro, no hay conflicto
      return data;
    }

    // 2. HAY CONFLICTO: Buscar el máximo actual en la nube
    console.warn(`[Sync] Conflicto detectado en Folio ${data.folio}. Re-foliando...`);
    const allFoliosQ = query(
      collection(firebaseDb, 'folios'),
      where('ownerId', '==', user.uid)
    );
    const allSnap = await getDocs(allFoliosQ);
    
    const lastNum = allSnap.docs
      .map(d => {
        const f = d.data().folio;
        return f && f.startsWith('V-') ? parseInt(f.split('-')[1]) : 0;
      })
      .reduce((max, val) => Math.max(max, val), 0);

    const newFolio = `V-${String(lastNum + 1).padStart(3, '0')}`;
    console.log(`[Sync] Nuevo Folio asignado: ${newFolio}`);
    
    return { ...data, folio: newFolio };
  });
}

export async function pushToCloud(collectionName: string, data: any): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  let finalData = data;
  if (collectionName === 'folios') {
    try {
      finalData = await checkAndRefolio(data);
      // Si el folio cambió, actualizar base de datos local para que coincidan
      if (finalData.folio !== data.folio) {
        // @ts-ignore
        await localDb.folios.update(data.id, { folio: finalData.folio });
      }
    } catch (err) {
      console.error('[Sync] Error en re-foliado:', err);
    }
  }

  const docRef = doc(firebaseDb, collectionName, finalData.id);
  
  // Limpiador recursivo de datos (Firestore NO acepta undefined)
  const sanitize = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([key, value]) => 
            key !== 'syncStatus' && 
            value !== undefined && 
            value !== null
          )
          .map(([key, value]) => [key, sanitize(value)])
      );
    }
    return obj;
  };

  const cleanData = sanitize(finalData);
  
  try {
    await setDoc(docRef, {
      ...cleanData,
      ownerId: user.uid,
      updatedAt: new Date().toISOString()
    });

    // Éxito: Marcamos como sincronizado localmente
    // @ts-ignore
    await localDb[collectionName].update(data.id, { syncStatus: 'synced' });
    console.log(`[Sync OK] ${collectionName}/${data.id} subido con éxito.`);
    await refreshStore();
    return true;
  } catch (err: any) {
    console.error(`[Sync FAIL] ${collectionName}/${data.id}:`, err.message || err);
    const { addToast } = useStore.getState();
    addToast(`Error al subir ${collectionName}: ${err.message || 'Fallo de permisos'}`, 'error');
    return false;
  }
}

/**
 * PELIGRO: Borra todos los datos del usuario actual de la nube y localmente.
 */
export async function purgeUserData() {
  const user = auth.currentUser;
  if (!user || !window.confirm('¿ESTÁS SEGURO? Esto borrará permanentemente TODOS TUS DATOS de la nube y el celular.')) return;

  const { deleteDoc, getDocs, query, collection, where } = await import('firebase/firestore');

  for (const colName of collections) {
    const q = query(
      collection(firebaseDb, colName), 
      where('ownerId', '==', user.uid)
    );
    const snap = await getDocs(q);
    
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
    
    // @ts-ignore
    await localDb[colName].clear();
  }

  alert('Tus datos han sido eliminados. El sistema se reiniciará.');
  window.location.reload();
}

/**
 * Borra una colección específica filtrando por el ownerId actual de la nube.
 */
export async function clearHistoryFromCloud() {
  const user = auth.currentUser;
  if (!user) return;

  const { getDocs, query, collection, where, writeBatch } = await import('firebase/firestore');
  const oprCollections = ['folios', 'gastos', 'cuadrillas', 'rayasSemanales', 'pagosNominaSemanal', 'temporadas'];

  for (const colName of oprCollections) {
    const q = query(
      collection(firebaseDb, colName), 
      where('ownerId', '==', user.uid)
    );
    const snap = await getDocs(q);
    
    // Batch delete
    const batch = writeBatch(firebaseDb);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`[Sync] OK -> Eliminados ${snap.docs.length} registros de ${colName} de la nube.`);
  }
}
