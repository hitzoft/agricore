import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyB5L-7EqQe4Vmibp2l_dIwBxqB2kGyno9g",
  authDomain: "agricore-web.firebaseapp.com",
  projectId: "agricore-web",
  storageBucket: "agricore-web.firebasestorage.app",
  messagingSenderId: "1036861288503",
  appId: "1:1036861288503:web:0849748f771f51ea12cfb2",
  measurementId: "G-8793KR9JZ0"
};

// Initialize Firebase
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({})
});
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);

export default app;
