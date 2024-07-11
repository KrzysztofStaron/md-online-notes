import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDNQ62_lzmxYh2Ec_Xo-PKmzHB2p9KZjVE",
  authDomain: "simple-notes-bbf2e.firebaseapp.com",
  projectId: "simple-notes-bbf2e",
  storageBucket: "simple-notes-bbf2e.appspot.com",
  messagingSenderId: "110062312174",
  appId: "1:110062312174:web:03b8b3fd6f73b0bf4ff1ff",
  measurementId: "G-DMVJB13R82",
};
const app: any = initializeApp(firebaseConfig);
const auth: any = getAuth(app);
const db: any = getFirestore(app);

export { db, app, auth };
