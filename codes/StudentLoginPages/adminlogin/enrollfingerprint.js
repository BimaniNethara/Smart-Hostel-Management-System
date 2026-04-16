import { db } from "./firebase.js";

import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

console.log("Enroll page loaded");

const studentIdInput = document.getElementById("studentId");
const studentNameInput = document.getElementById("studentName");
const enrollBtn = document.getElementById("enrollBtn");

const scannerText = document.querySelector(".scanner");

let currentStudent = null;


// =============================
// ENROLL BUTTON CLICK
// =============================

enrollBtn.addEventListener("click", async () => {

    const studentId = studentIdInput.value.trim();
    const studentName = studentNameInput.value.trim();

    console.log("Enroll clicked", studentId);

    if (!studentId || !studentName) {

        scannerText.innerHTML = "Enter Student ID and Name";
        return;

    }

    scannerText.innerHTML = "Checking student...";

    const studentRef = doc(db, "students", studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {

        scannerText.innerHTML = "Student not found!";
        return;

    }

    currentStudent = studentId;

    scannerText.innerHTML = "Sending command to scanner...";

    await setDoc(doc(db, "enrollCommand", "command"), {

        action: "ENROLL",
        studentId: studentId,
        timestamp: new Date()

    });

});


// =============================
// LISTEN FOR ENROLL RESULT
// =============================

onSnapshot(doc(db, "enrollCommand", "command"), async (snap) => {

    if (!snap.exists()) return;

    const data = snap.data();

    console.log("Firestore update:", data);

    if (data.action === "ENROLL") {

        scannerText.innerHTML = "Place finger on scanner";

    }

    if (data.fingerprintId) {

        scannerText.innerHTML = "Fingerprint Enrolled Successfully";

        if (currentStudent) {

            await updateDoc(doc(db, "students", currentStudent), {

                biometric_id: data.fingerprintId

            });

        }

    }

});