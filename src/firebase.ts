import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBs_ANhtpvXppeLjdGxZu-MZxWNP3tWXmg",
  authDomain: "project-ad03afd1-c6ff-4697-968.firebaseapp.com",
  projectId: "project-ad03afd1-c6ff-4697-968",
  storageBucket: "project-ad03afd1-c6ff-4697-968.firebasestorage.app",
  messagingSenderId: "665576353658",
  appId: "1:665576353658:web:e5959845192bb86b63f0c3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
