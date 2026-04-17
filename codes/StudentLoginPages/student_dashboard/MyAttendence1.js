// ==================== FIREBASE IMPORTS ====================
import { auth, db } from "../firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ==================== GLOBAL VARIABLES ====================
let currentStudent = null;

// ==================== AUTH CHECK ====================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('✅ User authenticated:', user.email);
        await loadStudentAttendance(user.uid);
    } else {
        console.log('❌ Not logged in - redirecting...');
        window.location.href = 'login.html';
    }
});

// ==================== LOAD DATA ====================
async function loadStudentAttendance(userId) {
    try {
        console.log('📥 Loading student data...');

        // Step 1: students collection එකෙන් student එක හොයනවා
        const studentsRef     = collection(db, "students");
        const studentQuery    = query(studentsRef, where("uid", "==", userId));
        const studentSnapshot = await getDocs(studentQuery);

        if (studentSnapshot.empty) {
            console.error('❌ Student not found');
            alert('Student profile not found!');
            await signOut(auth);
            window.location.href = 'login.html';
            return;
        }

        const studentData = studentSnapshot.docs[0].data();
        currentStudent    = studentData;
        console.log('✅ Student found:', studentData.firstName);

        // Step 2: Attendance collection එකෙන් records හොයනවා
        const fullStudentId      = studentData.studentId;
        console.log('🔍 Searching attendance for studentId:', fullStudentId);

        const attendanceRef      = collection(db, "Attendance");
        const attendanceQuery    = query(attendanceRef, where("Student_id", "==", fullStudentId));
        const attendanceSnapshot = await getDocs(attendanceQuery);

        const attendanceRecords = [];
        attendanceSnapshot.forEach(doc => {
            attendanceRecords.push(doc.data());
        });

        console.log('📋 Attendance records found:', attendanceRecords.length);

        // Step 3: UI update — studentData මෙතන available
        updateAttendanceUI(studentData, attendanceRecords);

    } catch (error) {
        console.error('❌ Error loading data:', error);
        alert('Error loading attendance data. Please refresh.');
    }
}

// ==================== UPDATE UI ====================
function updateAttendanceUI(studentData, attendanceRecords) {

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
        else console.warn('⚠️ Element not found:', id);
    }

    // Student basic info
    setText('student-full-name',   `${studentData.firstName} ${studentData.lastName}`);
    setText('university-id',        studentData.studentId || 'N/A');
    setText('room-number-display',  studentData.room      || '--');
    setText('student-contact',      studentData.contact   || '--');
    setText('student-faculty',      studentData.faculty   || '--');
    setText('student-email',        studentData.email     || '--');

    // ==================== PROFILE PICTURE ====================
    const profileImgEl = document.getElementById('profileImage');
    if (profileImgEl) {
        if (studentData.profileImage) {
            // Registration ගේදී upload කරපු Base64 photo
            profileImgEl.src           = studentData.profileImage;
            profileImgEl.style.display = 'block';
            console.log('Profile image displayed');
        } else {
            // Photo නැත්නම් initials එක show කරනවා (default-avatar.png file එකක් නැතිව)
            profileImgEl.style.display = 'none';
            showInitials(studentData.firstName, studentData.lastName);
            console.log('ℹ️ No profile image — showing initials');
        }
    }

    // Today's date
    const todayEl = document.getElementById('today-date');
    if (todayEl) {
        todayEl.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // Attendance status

// Today's date — Firestore format එකට match කරනවා: "3/16/2026"
const today = new Date();
const todayStr = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`;
console.log('Today string:', todayStr);

// Today's record හොයනවා
const todayRecord = attendanceRecords.find(r => r.Date === todayStr);
console.log('Today record:', todayRecord);

if (todayRecord) {
    // Today check-in/out record තියෙනවා
    setText('attendance-status', todayRecord.Attendance_status); // "Checked In" / "Checked Out"
    setText('today-checkin',  todayRecord.Time_in  || '--');
    setText('today-checkout', todayRecord.Time_out || '--');
} else {
    // Today record නැහැ
    setText('attendance-status', 'Not Checked In');
    setText('today-checkin',  '--');
    setText('today-checkout', '--');
}

    // Attendance history table
    const tbody = document.getElementById('attendance-history');
    if (tbody) {
        tbody.innerHTML = '';

        if (attendanceRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding:20px; color:#888;">
                        No attendance records found
                    </td>
                </tr>`;
            return;
        }

        const sorted = [...attendanceRecords].sort((a, b) => {
            return new Date(b.Date) - new Date(a.Date);
        });

        sorted.forEach(record => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${record.Date              || '--'}</td>
                <td>${record.Time_in           || '--'}</td>
                <td>${record.Time_out          || '--'}</td>
                <td>${record.Attendance_status || '--'}</td>
            `;
            tbody.appendChild(tr);
        });

        console.log('Attendance table updated');
    }
}

// ==================== SHOW INITIALS (fallback for no photo) ====================
// default-avatar.png file එක නැතිව initials circle එකක් show කරනවා
function showInitials(firstName, lastName) {
    const avatarDiv = document.querySelector('.avatar');
    if (!avatarDiv) return;

    const f = (firstName || '').charAt(0).toUpperCase();
    const l = (lastName  || '').charAt(0).toUpperCase();
    const initials = (f + l) || 'SP';

    // Existing img hide කරලා initials span එකක් show කරනවා
    avatarDiv.innerHTML = `
        <div style="
            width:100%; height:100%;
            border-radius:50%;
            background: linear-gradient(135deg, #4a9eff, #2d7dd2);
            display:flex; align-items:center; justify-content:center;
            color:white; font-weight:700; font-size:20px;
        ">${initials}</div>
    `;
}

// ==================== LOGOUT ====================
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            try {
                await signOut(auth);
                sessionStorage.clear();
                localStorage.clear();
                console.log('Logged out successfully');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error logging out. Please try again.');
            }
        }
    });
}

console.log('Attendance System initialized');