console.log("Fingerprint scanner running");

import { db } from "./firebase.js";

import {
    doc,
    onSnapshot,
    collection,
    query,
    where,
    getDocs,
    addDoc,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";


// Listen for fingerprint scan
onSnapshot(doc(db, "system_state", "latest_scan"), async (snapshot) => {

    if (!snapshot.exists()) return;

    const biometricId = snapshot.data().biometric_id;
    if (!biometricId) return;

    console.log("Fingerprint scanned:", biometricId);


    // Check if student exists
    const studentQuery = query(
        collection(db, "STUDENT"),
        where("Biometric_id", "==", biometricId)
    );

    const studentSnap = await getDocs(studentQuery);


    // Student NOT registered
    if (studentSnap.empty) {

        showScreen("checkout-unsuccess");

        setTimeout(() => {
            showScreen("scan-view");
        }, 3000);

        return;
    }


    // Student found
    const studentDoc = studentSnap.docs[0];
    const studentData = studentDoc.data();
    const studentId = studentDoc.id;


    // Check last attendance
    const attendanceQuery = query(
        collection(db, "ATTENDANCE"),
        where("Student_id", "==", studentId),
        orderBy("Timestamp", "desc"),
        limit(1)
    );

    const attendanceSnap = await getDocs(attendanceQuery);

    const now = new Date();


    // First scan → Check-in
    if (attendanceSnap.empty) {

        await addDoc(collection(db, "ATTENDANCE"), {
            Student_id: studentId,
            Attendance_status: "Checked In",
            Date: now.toLocaleDateString(),
            Time_in: now.toLocaleTimeString(),
            Timestamp: now
        });

        populateSuccessScreen(studentData, studentId);
        return;
    }


    const lastStatus = attendanceSnap.docs[0].data().Attendance_status;


    if (lastStatus === "Checked In") {

        // Check-out
        await addDoc(collection(db, "ATTENDANCE"), {
            Student_id: studentId,
            Attendance_status: "Checked Out",
            Date: now.toLocaleDateString(),
            Time_out: now.toLocaleTimeString(),
            Timestamp: now
        });

        populateSuccessScreen(studentData, studentId);

    } else {

        // Check-in again
        await addDoc(collection(db, "ATTENDANCE"), {
            Student_id: studentId,
            Attendance_status: "Checked In",
            Date: now.toLocaleDateString(),
            Time_in: now.toLocaleTimeString(),
            Timestamp: now
        });

        populateSuccessScreen(studentData, studentId);
    }

});


// Screen switcher
function showScreen(screenId) {

    const screens = [
        "scan-view",
        "checkout-success",
        "checkout-unsuccess"
    ];

    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    const screen = document.getElementById(screenId);
    if (screen) screen.style.display = "block";
}



// Populate success screen
function populateSuccessScreen(studentData, studentId) {

    showScreen("checkout-success");

    document.querySelector(".student-detail1 p:nth-child(1)").innerHTML =
        `<strong>Full Name</strong> ${studentData.Student_firstname} ${studentData.Student_lastname}`;

    document.querySelector(".student-detail1 p:nth-child(2)").innerHTML =
        `<strong>Room Number</strong> ${studentData.Room_id || "-"}`;

    document.querySelector(".student-detail1 p:nth-child(3)").innerHTML =
        `<strong>Year</strong> ${studentData.Academic_year || "-"}`;

    document.querySelector(".student-detail2 p:nth-child(1)").innerHTML =
        `<strong>Student ID</strong> ${studentId}`;

    document.querySelector(".student-detail2 p:nth-child(2)").innerHTML =
        `<strong>Floor</strong> ${studentData.Floor || "-"}`;

    document.querySelector(".student-detail2 p:nth-child(3)").innerHTML =
        `<strong>Faculty</strong> ${studentData.Faculty || "-"}`;


    const timestampSpans = document.querySelectorAll(".timestamp span");

    const now = new Date();

    timestampSpans[0].innerText = now.toLocaleDateString(
        "en-US",
        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    );

    timestampSpans[1].innerText = now.toLocaleTimeString();


    // Return to scanner after 3 seconds
    setTimeout(() => {
        window.location.href = "fingerprintscan.html";
    }, 3000);

}