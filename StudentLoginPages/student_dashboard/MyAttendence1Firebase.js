// ==================== FIREBASE IMPORTS ====================
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ==================== GLOBAL VARIABLES ====================
let currentStudent = null;

// ==================== DOM ELEMENTS ====================
const elements = {
    studentFullName: document.getElementById('student-full-name'),
    studentContact: document.getElementById('student-contact'),
    studentFaculty: document.getElementById('student-faculty'),
    studentEmail: document.getElementById('student-email'),
    universityId: document.getElementById('university-id'),
    roomNumberDisplay: document.getElementById('room-number-display'),
    attendanceStatus: document.getElementById('attendance-status'),
    todayCheckin: document.getElementById('today-checkin'),
    todayCheckout: document.getElementById('today-checkout'),
    attendanceHistory: document.getElementById('attendance-history'),
    logoutBtn: document.getElementById('logout-btn')
};

// ==================== AUTHENTICATION CHECK ====================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('User logged in:', user.email);
        await loadStudentAttendance(user.uid);
    } else {
        console.log('No user logged in');
        window.location.href = 'login.html';
    }
});

// ==================== LOAD STUDENT ATTENDANCE DATA ====================
async function loadStudentAttendance(userId) {
    try {
        showLoading(true);
        
        // Student profile data ගන්නවා
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            currentStudent = {
                id: userId,
                name: `${userData.firstName} ${userData.lastName}`,
                universityId: userData.universityId || 'HS/2022/19628',
                roomNumber: userData.roomNumber || '01',
                status: 'Active',
                contact: userData.contact,
                faculty: userData.faculty,
                email: userData.email,
                attendance: []
            };
            
            // Attendance records load කරනවා
            await loadAttendanceRecords(userId);
            
            // UI update කරනවා
            updateAttendanceUI();
            
        } else {
            console.error('Student data not found');
            alert('Student profile not found. Please contact admin.');
            await signOut(auth);
            window.location.href = 'login.html';
        }
        
    } catch (error) {
        console.error('Error loading attendance:', error);
        showError('Failed to load attendance data.');
    } finally {
        showLoading(false);
    }
}

// ==================== LOAD ATTENDANCE RECORDS FROM FIRESTORE ====================
async function loadAttendanceRecords(userId) {
    try {
        // Attendance collection එකෙන් records ගන්නවා
        const attendanceRef = collection(db, "attendance");
        const q = query(
            attendanceRef, 
            where("studentId", "==", userId),
            orderBy("date", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        
        currentStudent.attendance = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            currentStudent.attendance.push({
                date: data.date,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                reason: data.reason || 'Regular'
            });
        });
        
        // If no records, add mock data
        if (currentStudent.attendance.length === 0) {
            currentStudent.attendance = [
                { date: '2026-01-20', checkIn: '08:30 AM', checkOut: '06:45 PM', reason: 'Regular' },
                { date: '2026-01-21', checkIn: '08:35 AM', checkOut: '06:50 PM', reason: 'Regular' }
            ];
        }
        
    } catch (error) {
        console.error('Error loading attendance records:', error);
        // Use mock data if error
        currentStudent.attendance = [
            { date: '2026-01-20', checkIn: '08:30 AM', checkOut: '06:45 PM', reason: 'Regular' },
            { date: '2026-01-21', checkIn: '08:35 AM', checkOut: '06:50 PM', reason: 'Regular' }
        ];
    }
}

// ==================== UPDATE ATTENDANCE UI ====================
function updateAttendanceUI() {
    if (!currentStudent) return;
    
    // Profile section update
    if (elements.studentFullName) {
        elements.studentFullName.textContent = currentStudent.name;
    }
    
    if (elements.studentContact) {
        elements.studentContact.textContent = currentStudent.contact || 'N/A';
    }
    
    if (elements.studentFaculty) {
        elements.studentFaculty.textContent = currentStudent.faculty || 'N/A';
    }
    
    if (elements.studentEmail) {
        elements.studentEmail.textContent = currentStudent.email;
    }
    
    if (elements.universityId) {
        elements.universityId.textContent = currentStudent.universityId;
    }
    
    if (elements.roomNumberDisplay) {
        elements.roomNumberDisplay.textContent = currentStudent.roomNumber;
    }
    
    if (elements.attendanceStatus) {
        elements.attendanceStatus.textContent = currentStudent.status;
    }
    
    // Today's attendance
    if (currentStudent.attendance.length > 0) {
        const today = currentStudent.attendance[0];
        
        if (elements.todayCheckin) {
            elements.todayCheckin.textContent = today.checkIn;
        }
        
        if (elements.todayCheckout) {
            elements.todayCheckout.textContent = today.checkOut;
        }
    }
    
    // Attendance history
    updateAttendanceHistory();
}

// ==================== UPDATE ATTENDANCE HISTORY TABLE ====================
function updateAttendanceHistory() {
    const tbody = elements.attendanceHistory;
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    currentStudent.attendance.forEach(record => {
        const tr = document.createElement('tr');
        
        const reasonClass = record.reason === 'Visit' ? 'reason-visit' : 
                          record.reason === 'Academic' ? 'reason-academic' : 
                          'reason-other';
        
        tr.innerHTML = `
            <td>${record.date}</td>
            <td>${record.checkIn}</td>
            <td>${record.checkOut}</td>
            <td class="${reasonClass}">${record.reason}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// ==================== LOGOUT HANDLER ====================
if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (confirm('Are you sure you want to logout?')) {
            try {
                await signOut(auth);
                sessionStorage.clear();
                localStorage.clear();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
                alert('Error logging out. Please try again.');
            }
        }
    });
}

// ==================== UTILITY FUNCTIONS ====================
function showLoading(show) {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        if (show) {
            mainContent.classList.add('loading');
        } else {
            mainContent.classList.remove('loading');
        }
    }
}

function showError(message) {
    alert(message);
    console.error('Error:', message);
}

console.log('Attendance page initialized with Firebase integration');