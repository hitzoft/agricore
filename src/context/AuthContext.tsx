import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
  userMetadata: any | null;
  isAdmin: boolean;
  isSubscribed: boolean;
  isTrialExpired: boolean;
  trialDaysLeft: number;
  isBillingNear: boolean;
  daysUntilBilling: number;
  nextBillingDate: string | null;
  planType: 'monthly' | 'annual' | null;
  isBlocked: boolean;
  isExpired: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userMetadata, setUserMetadata] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Fetch or create user metadata document in Firestore
          const { doc, getDoc, setDoc } = await import('firebase/firestore');
          const { db: firestoreDb } = await import('../lib/firebase');
          const userRef = doc(firestoreDb, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          let metadata = null;
          if (!userSnap.exists()) {
            // New user: Initial setup
            const trialStart = new Date();
            const billingDate = new Date();
            billingDate.setDate(trialStart.getDate() + 15); // Trial lasts 15 days

            metadata = {
              email: user.email,
              displayName: user.displayName,
              trialStartDate: trialStart.toISOString(),
              nextBillingDate: billingDate.toISOString(),
              planType: 'monthly',
              role: 'user',
              subscriptionStatus: 'trial',
              createdAt: trialStart.toISOString()
            };
            await setDoc(userRef, metadata);
          } else {
            metadata = userSnap.data();
          }

          setUserMetadata(metadata);
          setCurrentUser(user);
          
          // startSync is handled in the background to avoid blocking the UI
          startSync().catch(err => {
            console.error("[Auth] Initial sync failed:", err);
          });
        } else {
          setCurrentUser(null);
          setUserMetadata(null);
        }
      } catch (error: any) {
        console.error("[Auth] Error in auth state change:", error);
        // Even if metadata fails, set the user so they can at least see the app
        // unless it's a critical auth error.
        if (user) setCurrentUser(user);
      } finally {
        setLoading(false);
      }
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

  const isAdmin = userMetadata?.role === 'admin';
  const isSubscribed = userMetadata?.subscriptionStatus === 'active';
  const planType = userMetadata?.planType || 'monthly';
  const nextBillingDate = userMetadata?.nextBillingDate || null;
  
  const trialDaysLeft = useMemo(() => {
    if (isSubscribed) return 0;
    if (!userMetadata?.trialStartDate) return 0;
    const start = new Date(userMetadata.trialStartDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, 15 - days);
  }, [userMetadata, isSubscribed]);

  const daysUntilBilling = useMemo(() => {
    if (!nextBillingDate) return 0;
    const billing = new Date(nextBillingDate);
    const now = new Date();
    const diff = billing.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  }, [nextBillingDate]);

  const isBillingNear = useMemo(() => {
    // True if billing is within 5 days and user is trial OR active
    return daysUntilBilling <= 5 && daysUntilBilling > 0;
  }, [daysUntilBilling]);

  const isExpired = userMetadata?.subscriptionStatus === 'expired';
  const isTrialExpired = !isSubscribed && trialDaysLeft <= 0 && daysUntilBilling <= 0;
  const isBlocked = isExpired || (isTrialExpired && !isAdmin);

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      userMetadata,
      isAdmin,
      isSubscribed,
      isTrialExpired,
      trialDaysLeft,
      isBillingNear,
      daysUntilBilling,
      nextBillingDate,
      planType,
      isBlocked,
      isExpired,
      signInWithGoogle, 
      signOut 
    }}>
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
