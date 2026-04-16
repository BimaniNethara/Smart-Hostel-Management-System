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
    limit,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";


onSnapshot(doc(db, "system_state", "latest_scan"), async (snapshot) => {

    if (!snapshot.exists()) return;

    const biometricId = snapshot.data().biometric_id;

    if (!biometricId) return;

    console.log("Fingerprint scanned:", biometricId);


    /* Find student */

    const studentQuery = query(
        collection(db, "students"),
        where("Biometric_id", "==", biometricId)
    );

    const studentSnap = await getDocs(studentQuery);

    if (studentSnap.empty) {

        window.location.href = "checkin-unsucces.html";

        return;
    }

    const studentDoc = studentSnap.docs[0];
    const studentId = studentDoc.id;


    /* Check last attendance */

    const attendanceQuery = query(
        collection(db, "Attendance"),
        where("Student_id", "==", studentId),
        orderBy("Timestamp", "desc"),
        limit(1)
    );

    const attendanceSnap = await getDocs(attendanceQuery);


    const now = new Date();


    /* Decide check-in / check-out */

    if (attendanceSnap.empty) {

        await addDoc(collection(db, "Attendance"), {
            Student_id: studentId,
            Attendance_status: "Checked In",
            Date: now.toLocaleDateString(),
            Time_in: now.toLocaleTimeString(),
            Timestamp: now
        });

        window.location.href = `checkin_success.html?student=${studentId}`;

    }
    else {

        const lastStatus = attendanceSnap.docs[0].data().Attendance_status;

        if (lastStatus === "Checked In") {

            await addDoc(collection(db, "Attendance"), {
                Student_id: studentId,
                Attendance_status: "Checked Out",
                Date: now.toLocaleDateString(),
                Time_out: now.toLocaleTimeString(),
                Timestamp: now
            });

            window.location.href = `checkout_success.html?student=${studentId}`;

        }
        else {

            await addDoc(collection(db, "Attendance"), {
                Student_id: studentId,
                Attendance_status: "Checked In",
                Date: now.toLocaleDateString(),
                Time_in: now.toLocaleTimeString(),
                Timestamp: now
            });

            window.location.href = `checkin_success.html?student=${studentId}`;

        }

    }


    /* reset scanner */

    await updateDoc(doc(db, "system_state", "latest_scan"), {
        biometric_id: null
    });

});