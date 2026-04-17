// ==================== FIREBASE IMPORTS ====================
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
//import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
// ==================== GLOBAL VARIABLES ====================
let currentStudent = null;

// ==================== DOM ELEMENTS ====================
const elements = {
    studentName: document.getElementById('studentName'),
    attendanceCount: document.getElementById('attendanceCount'),
    roomNumber: document.getElementById('roomNumber'),
    roomInfo: document.getElementById('roomInfo'),
    roomStatus: document.getElementById('roomStatus'),
    logoutBtn: document.getElementById('logoutBtn')
};

// ==================== AUTHENTICATION CHECK ====================
// Page load වෙද්දී automatically check කරනවා user login වෙලා ඉන්නවද කියලා
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('✅ User authenticated:', user.email);
        console.log('🔑 User ID:', user.uid);

        // Login වෙච්ච user ගේ data load කරනවා
        await loadStudentData(user.uid);
    } else {
        console.log('❌ No user logged in - redirecting to login page');
        window.location.href = 'login.html';
    }
});

// ==================== LOAD STUDENT DATA FROM FIREBASE ====================
async function loadStudentData(userId) {
    try {
        showLoading(true);

        console.log('📥 Loading student data from Firestore...');
        console.log('👤 User ID:', userId);

        // Firebase Firestore එකෙන් registration වෙලා save වෙච්ච data ගන්නවා
        const studentsRef = collection(db, "students");
        const q = query(studentsRef, where("uid", "==", userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();

            // Registration වෙලා save වෙච්ච හැම data එකක්ම extract කරනවා
            currentStudent = {
                // User Info
                id: userId,
                universityId: userData.universityId || 'N/A',
                email: userData.email || '',

                // Personal Info - Registration වෙලා save වෙච්ච data
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                name: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
                dob: userData.dob || '',
                gender: userData.gender || '',
                address: userData.address || '',

                // Contact Info
                contact: userData.contact || '',
                emergencyContact: userData.emergency || '',

                // Academic Info - Registration form එකෙන් ආපු data
                faculty: userData.faculty || '',
                department: userData.department || '',
                academicYear: userData.academicYear || '',

                // Hostel Info - Registration වෙලා assign වෙච්ච room details
                hostelName: userData.hostelName || '',
                floor: userData.floor || '',
                roomNumber: userData.room || '--',
                bedNumber: userData.bedNumber || '--',
                roomType: userData.roomType || 'Double Sharing',
                roomBlock: userData.roomBlock || 'Block A',

                // Dashboard Info
                attendanceCount: userData.attendanceCount || 0,
                roomInfo: userData.roomInfo || '--',
                roomStatus: userData.roomStatus || 'Available',
                status: userData.status || 'Active',

                // Other Info
                profileImage: userData.profileImage || null,
                registrationDate: userData.registrationDate || '',
                expiryDate: userData.expiryDate || '',

                // Room Details
                capacity: userData.capacity || 2,
                occupied: userData.occupied || 1,
                occupancy: userData.occupancy || '1/2 students',
                facilities: userData.facilities || []
            };

            console.log('📌 Student Name:', currentStudent.name);
            console.log('🏠 Room Number:', currentStudent.roomNumber);
            console.log('📊 Attendance Count:', currentStudent.attendanceCount);
            console.log('✅ Current Student Object:', currentStudent);

            // Dashboard UI update කරනවා - Registration data එක්ක
            updateDashboard();

            // Session storage එකේ save කරනවා navigation වලට use වෙන්න
            sessionStorage.setItem('studentId', userId);
            sessionStorage.setItem('studentName', currentStudent.name);
            sessionStorage.setItem('universityId', currentStudent.universityId);
            sessionStorage.setItem('roomNumber', currentStudent.roomNumber);

            console.log('✅ Dashboard updated with registration data');

        } else {
            console.error('❌ Student profile not found in Firestore');
    console.error('🔍 Searched for user ID:', userId);
    alert('❌ Student profile not found!\n\nPlease contact administrator.');
    await signOut(auth);
            window.location.href = 'login.html';
        }

    } catch (error) {
        console.error('❌ Error loading student data:', error);
        console.error('Error details:', error.message);
        showError('Failed to load student data. Please refresh the page or contact administrator.');
    } finally {
        showLoading(false);
    }
}

// ==================== UPDATE DASHBOARD UI ====================
function updateDashboard() {
    if (!currentStudent) {
        console.error('❌ No student data available to display');
        return;
    }

    console.log('🎨 Updating dashboard UI with student data...');

    // Student name update - Registration වෙලා save වෙච්ච name එක
    if (elements.studentName) {
        elements.studentName.textContent = currentStudent.name || 'Student';
        console.log('✅ Name displayed:', currentStudent.name);
    }

    // Attendance count update - Firebase එකෙන් ආපු count එක
    if (elements.attendanceCount) {
        elements.attendanceCount.textContent = currentStudent.attendanceCount;
        console.log('✅ Attendance count displayed:', currentStudent.attendanceCount);
    }

    // Room number update - Registration වෙද්දී assign වෙච්ච room එක
    if (elements.roomNumber) {
        elements.roomNumber.textContent = currentStudent.roomNumber;
        console.log('✅ Room number displayed:', currentStudent.roomNumber);
    }

    // Room information update
    if (elements.roomInfo) {
        elements.roomInfo.textContent = currentStudent.roomInfo;
        console.log('✅ Room info displayed:', currentStudent.roomInfo);
    }

    // Room status update
    if (elements.roomStatus) {
        elements.roomStatus.textContent = currentStudent.roomStatus;
        console.log('✅ Room status displayed:', currentStudent.roomStatus);
    }
    // Profile picture update
    const profileImgEl = document.getElementById('profileImage'); // Make sure your HTML has this ID
    if (profileImgEl) {
        if (currentStudent.profileImage) {
            profileImgEl.src = currentStudent.profileImage; // Base64 image from Firestore
            profileImgEl.style.display = 'block'; // ensure it's visible
            console.log('✅ Profile image displayed');
        } else {
            profileImgEl.src = 'default-avatar.png'; // fallback image
            profileImgEl.style.display = 'block';
            console.log('ℹ️ No profile image found, showing default');
        }
    }


    // Animation add කරනවා cards වලට
    animateCards();

    console.log('✅ Dashboard UI updated successfully!');
}

// ==================== CARDS ANIMATION ====================
function animateCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });
}

// ==================== LOGOUT HANDLER ====================
if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        if (confirm('Are you sure you want to logout?')) {
            try {
                console.log('🚪 Logging out user...');
                await signOut(auth);

                // Session data clear කරනවා
                sessionStorage.clear();
                localStorage.clear();

                console.log('✅ User logged out successfully');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('❌ Logout error:', error);
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
            mainContent.style.opacity = '0.6';
            mainContent.style.pointerEvents = 'none';
            console.log('⏳ Loading...');
        } else {
            mainContent.classList.remove('loading');
            mainContent.style.opacity = '1';
            mainContent.style.pointerEvents = 'auto';
            console.log('✅ Loading complete');
        }
    }
}

function showSuccess(message) {
    alert(message);
    console.log('✅ Success:', message);
}

function showError(message) {
    alert(message);
    console.error('❌ Error:', message);
}

// ==================== REFRESH DATA FUNCTION ====================
async function refreshData() {
    const user = auth.currentUser;
    if (user) {
        console.log('🔄 Refreshing student data...');
        await loadStudentData(user.uid);
    } else {
        console.log('❌ No user to refresh data for');
    }
}

// ==================== EXPORT FOR GLOBAL ACCESS ====================
window.hostelApp = {
    // Current student data ගන්න
    getCurrentStudent: () => {
        console.log('📊 Current student data requested:', currentStudent);
        return currentStudent;
    },

    // Data refresh කරන්න
    refresh: refreshData,

    // Manual data load කරන්න
    loadStudent: (userId) => loadStudentData(userId)
};

console.log('🎓 Student Dashboard System initialized with Firebase');
console.log('🔥 Waiting for authentication...');