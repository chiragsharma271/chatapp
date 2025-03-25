import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAdVBlrfMn_HF2Cr6_-JlkRjOTO-qaICug",
  authDomain: "realtime-chatapp-c555e.firebaseapp.com",
  projectId: "realtime-chatapp-c555e",
  storageBucket: "realtime-chatapp-c555e.firebasestorage.app",
  messagingSenderId: "143486192803",
  appId: "1:143486192803:web:221bf78c942f5ea9ef8316"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };