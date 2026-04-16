import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBaCswlWTMSxi543o1v87g36RafGxd3eSM",
  authDomain: "smart-hostel-management-d55fd.firebaseapp.com",
  projectId: "smart-hostel-management-d55fd",
  storageBucket: "smart-hostel-management-d55fd.firebasestorage.app",
  messagingSenderId: "240337905227",
  appId: "1:240337905227:web:c4bae229f77bdacd380fce"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
