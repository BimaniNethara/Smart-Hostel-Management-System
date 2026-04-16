import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";


/* Get student ID from URL */

const params = new URLSearchParams(window.location.search);
const studentId = params.get("student");

loadStudent();


async function loadStudent() {

    if (!studentId) {
        console.log("No student ID found");
        return;
    }

    const studentRef = doc(db, "students", studentId);

    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
        console.log("Student not found");
        return;
    }

    const student = studentSnap.data();

    const now = new Date();


    /* Fill UI */

    document.getElementById("full-name").innerText =
        `${student.firstName || ""} ${student.lastName || ""}`;

    document.getElementById("room-number").innerText =
        student.hostelName || "-";

    document.getElementById("year").innerText =
        student.academicYear || "-";

    document.getElementById("student-id").innerText =
        studentId;

    document.getElementById("floor").innerText =
        student.floor || "-";

    document.getElementById("faculty").innerText =
        student.faculty || "-";


    document.getElementById("date-span").innerText =
        now.toLocaleDateString("en-US", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

    document.getElementById("time-span").innerText =
        now.toLocaleTimeString();


    /* Return to scanner after 5s */

    setTimeout(() => {
        window.location.href = "fingerprintscan.html";
    }, 5000);

}