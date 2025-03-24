import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyC7PdIOtRton3vlCCOlsdVYDsuKCDFgU-A",
  authDomain: "active-citizen-firebase.firebaseapp.com",
  projectId: "active-citizen-firebase",
  storageBucket: "active-citizen-firebase.firebasestorage.app",
  messagingSenderId: "580808811102",
  appId: "1:580808811102:web:43b61d7233d7ecd9b74acf",
};


const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { app, firestore };