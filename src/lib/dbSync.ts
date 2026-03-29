import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where
} from 'firebase/firestore';
import { db as firebaseDb, auth } from './firebase';
import { db as localDb } from '../db/db';
import { useStore } from '../store/useStore';

const collections = [
  'empleados', 'clientes', 'proveedores', 'huertas', 
  'cabos', 'cuentasBancarias', 'folios', 'gastos', 
  'cuadrillas', 'rayasSemanales', 'pagosNominaSemanal', 'productos'
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
}

export async function pushToCloud(collectionName: string, data: any): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  const docRef = doc(firebaseDb, collectionName, data.id);
  
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

  const cleanData = sanitize(data);
  
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

