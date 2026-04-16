import { db } from "./firebase.js";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// Listen for fingerprint scan from ESP32
onSnapshot(doc(db, "system_state", "latest_scan"), async (snapshot) => {
    if (!snapshot.exists()) return;

    const biometricId = snapshot.data().biometric_id;
    if (!biometricId) return;

    // Check if student exists in STUDENT collection
    const studentQuery = query(
        collection(db, "STUDENT"),
        where("Biometric_id", "==", biometricId)
    );

    const studentSnap = await getDocs(studentQuery);

    if (studentSnap.empty) {
        // Student NOT registered → show check-in unsuccessful screen
        showCheckinUnsuccessScreen();
    } else {
        console.log("Student exists.");
    }
});

// Function to show check-in unsuccessful screen and auto-return to scan
function showCheckinUnsuccessScreen() {
    const screen = document.querySelector(".checkin-container");
    if (screen) screen.style.display = "block";

    setTimeout(() => {
        window.location.reload();
    }, 4000);
} setTimeout(() => {
    window.location.href = "fingerprintscan.html";
}, 4000);