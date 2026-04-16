import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    addDoc,
    collection
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";


const params = new URLSearchParams(window.location.search);

const studentId = params.get("student");

console.log("Checkout student ID:", studentId);


loadStudent();


async function loadStudent() {

    if (!studentId) return;

    const studentRef = doc(db, "students", studentId);

    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {

        console.log("Student not found");

        return;

    }

    const student = studentSnap.data();

    const now = new Date();


    document.getElementById("full-name").innerHTML =
        `<strong>Full Name</strong> ${student.firstName || ""} ${student.lastName || ""}`;

    document.getElementById("room-number").innerHTML =
        `<strong>Room Number</strong> ${student.hostelName || "-"}`;

    document.getElementById("year").innerHTML =
        `<strong>Year</strong> ${student.academicYear || "-"}`;

    document.getElementById("student-id").innerHTML =
        `<strong>Student ID</strong> ${studentId}`;

    document.getElementById("floor").innerHTML =
        `<strong>Floor</strong> ${student.floor || "-"}`;

    document.getElementById("faculty").innerHTML =
        `<strong>Faculty</strong> ${student.faculty || "-"}`;


    document.getElementById("date-span").innerText =
        now.toLocaleDateString("en-US", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

    document.getElementById("time-span").innerText =
        now.toLocaleTimeString();


    const form = document.querySelector(".reason-form");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const reason = document.getElementById("reason").value;

        await addDoc(collection(db, "Attendance"), {

            Student_id: studentId,

            Attendance_status: "Checked Out",

            Reason: reason,

            Date: now.toLocaleDateString(),

            Time_out: now.toLocaleTimeString(),

            Timestamp: now

        });

        alert("Checkout recorded successfully");


        setTimeout(() => {

            window.location.href = "fingerprintscan.html";

        }, 2000);

    });

}