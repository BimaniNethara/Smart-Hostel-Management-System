// ==================== FIREBASE IMPORTS ====================
import { auth, db } from "../firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ==================== GLOBAL VARIABLES ====================
let currentStudent = null;
let currentRoom = null;

// ==================== AUTH CHECK ====================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('✅ User authenticated:', user.email);
        await loadRoomInformation(user.uid);
    } else {
        console.log('❌ Not logged in - redirecting...');
        window.location.href = '../../index.html';
    }
});

// ==================== LOAD DATA ====================
async function loadRoomInformation(userId) {
    try {
        showLoading();
        console.log('📥 Loading student data...');

        // Step 1: Student data ගන්නවා
        const studentsRef = collection(db, "students");
        const studentQuery = query(studentsRef, where("uid", "==", userId));
        const studentSnapshot = await getDocs(studentQuery);

        if (studentSnapshot.empty) {
            console.error('❌ Student not found');
            alert('Student profile not found!');
            await signOut(auth);
            window.location.href = '../../index.html';
            return;
        }

        const studentData = studentSnapshot.docs[0].data();
        currentStudent = studentData;
        console.log('✅ Student found:', studentData.firstName);
        console.log('🏠 Room number:', studentData.room);

        // Step 2: Room data ගන්නවා - student එකේ room field එකෙන්
        const roomNumber = studentData.room; // e.g. "06"

        if (!roomNumber) {
            console.warn('⚠️ No room assigned to student');
            updateRoomUI(null, studentData);
            return;
        }

        const roomDocRef = doc(db, "rooms", roomNumber);
        const roomDoc = await getDoc(roomDocRef);

        if (roomDoc.exists()) {
            currentRoom = roomDoc.data();
            console.log('✅ Room found:', currentRoom);
        } else {
            console.warn('⚠️ Room document not found for:', roomNumber);
            currentRoom = null;
        }

        // Step 3: UI update
        updateRoomUI(currentRoom, studentData);

    } catch (error) {
        console.error('❌ Error loading room info:', error);
        alert('Error loading room data. Please refresh.');
    } finally {
        hideLoading();
    }
}

// ==================== UPDATE UI ====================
function updateRoomUI(roomData, studentData) {

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
        else console.warn('⚠️ Element not found:', id);
    }
    // ==================== PROFILE PICTURE ====================
    const profileImgEl = document.getElementById('profileImage');
    if (profileImgEl) {
        if (studentData.profileImage) {
            profileImgEl.src           = studentData.profileImage;
            profileImgEl.style.display = 'block';
            console.log('✅ Profile image displayed');
        } else {
            // Photo නැත්නම් initials show කරනවා
            profileImgEl.style.display = 'none';
            showInitials(studentData.firstName, studentData.lastName);
            console.log('ℹ️ No profile image — showing initials');
        }
    }

    if (roomData) {
        // Rooms collection fields එකෙන් ආපු data
        setText('room-number', roomData.roomNo || studentData.room || '--');
        setText('room-floor', roomData.floor || '--');
        setText('room-type', roomData.type || '--');
        setText('room-capacity', roomData.capacity || '--');
        setText('room-status', 'Active');

        // Occupancy - capacity එකෙන් හදනවා
        const occupied = roomData.occupied || '--';
        const capacity = roomData.capacity || '--';
        setText('room-occupancy', `${occupied}/${capacity} students`);

        // Students collection එකෙන් ආපු data
        setText('room-block', studentData.hostelName || '--');
        setText('bed-number', studentData.bedNumber || '--');

        // Facilities - rooms collection එකේ තියෙනවා නම්
        const facilities = roomData.facilities || [];
        updateRoomFacilities(facilities);

        console.log('✅ Room UI updated successfully');

    } else {
        // Room data නැත්නම් student data එකෙන් fallback
        setText('room-number', studentData.room || '--');
        setText('room-block', studentData.hostelName || '--');
        setText('room-floor', '--');
        setText('room-type', '--');
        setText('room-occupancy', '--');
        setText('room-status', 'N/A');
        setText('bed-number', '--');

        updateRoomFacilities([]);
        console.warn('⚠️ Showing fallback data - room not found');
    }
}

// ==================== FACILITIES ====================
function updateRoomFacilities(facilities) {
    const grid = document.getElementById('facilities-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!facilities || facilities.length === 0) {
        // Default facilities පෙන්වනවා
        const defaultFacilities = [
            { name: 'Wi-Fi', icon: '📶' },
            { name: 'Study Table', icon: '📚' },
            { name: 'Wardrobe', icon: '🚪' },
            { name: 'Power Outlets', icon: '🔌' },
            { name: 'Study Lamp', icon: '💡' },
            { name: 'Air condition', icon: '❄️' }
        ];

        defaultFacilities.forEach(facility => {
            const item = document.createElement('div');
            item.className = 'facility-item';
            item.innerHTML = `
                <div class="facility-icon">${facility.icon}</div>
                <div class="facility-name">${facility.name}</div>
            `;
            grid.appendChild(item);
        });
        return;
    }

    facilities.forEach(facility => {
        const item = document.createElement('div');
        item.className = 'facility-item';
        item.innerHTML = `
            <div class="facility-icon">${facility.icon || '📦'}</div>
            <div class="facility-name">${facility.name || '--'}</div>
        `;
        grid.appendChild(item);
    });
}

// ==================== LOADING ====================
function showLoading() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.opacity = '0.6';
        mainContent.style.pointerEvents = 'none';
    }
}

function hideLoading() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.opacity = '1';
        mainContent.style.pointerEvents = 'auto';
    }
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
                console.log('✅ Logged out successfully');
                window.location.href = '../../index.html';
            } catch (error) {
                console.error('❌ Logout error:', error);
                alert('Error logging out. Please try again.');
            }
        }
    });
} else {
    console.warn('⚠️ logout-btn not found in HTML');
}

console.log('🏠 Room Information System initialized with Firebase');
console.log('🔥 Waiting for authentication...');