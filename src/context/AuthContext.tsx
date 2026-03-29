import React, { createContext, useContext, useEffect, useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { startSync } from '../lib/dbSync';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Await the initial startSync to ensure local data is ready before removing the splash screen
        await startSync();
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // 1. Clear local database to ensure next user doesn't see previous data
      const { db } = await import('../db/db');
      await Promise.all(db.tables.map(table => table.clear()));
      
      // 2. Clear zustand store state
      const { useStore } = await import('../store/useStore');
      useStore.setState({
        empleados: [],
        clientes: [],
        proveedores: [],
        huertas: [],
        cabos: [],
        cuentasBancarias: [],
        folios: [],
        gastos: [],
        cuadrillas: [],
        rayasSemanales: [],
        pagosNominaSemanal: [],
        productos: [],
        toasts: []
      });

      // 3. Sign out from Firebase
      await firebaseSignOut(auth);
      
      // 4. Force reload to ensure a clean state
      window.location.href = '/login';
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, signInWithGoogle, signOut }}>
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
