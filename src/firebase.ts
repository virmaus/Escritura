import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Config values retrieved from the environment / file
const firebaseConfig = {
  apiKey: "AIzaSyDUvOKw0BC1Rc2CGsa2YFE0wxpYv0kHs-A",
  authDomain: "gen-lang-client-0321643589.firebaseapp.com",
  projectId: "gen-lang-client-0321643589",
  storageBucket: "gen-lang-client-0321643589.firebasestorage.app",
  messagingSenderId: "333619496941",
  appId: "1:333619496941:web:586aee4896cba13cd049e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
const db = getFirestore(app, "ai-studio-8e03f561-19c4-4b58-8104-1fa24554a706");

export { app, db };
