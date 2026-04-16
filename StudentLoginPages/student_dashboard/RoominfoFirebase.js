// ==================== FIREBASE IMPORTS ====================
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ==================== ROOM DATA ====================
let currentRoomData = {
    studentId: null,
    roomNumber: null,
    block: null,
    floor: null,
    bedNumber: null,
    roomType: null,
    capacity: null,
    occupied: null,
    occupancy: null,
    status: null,
    facilities: []
};

// ==================== DOM ELEMENTS ====================
const elements = {
    roomStatus: document.getElementById('room-status'),
    roomNumber: document.getElementById('room-number'),
    roomBlock: document.getElementById('room-block'),
    roomFloor: document.getElementById('room-floor'),
    bedNumber: document.getElementById('bed-number'),
    roomType: document.getElementById('room-type'),
    roomOccupancy: document.getElementById('room-occupancy'),
    facilitiesGrid: document.getElementById('facilities-grid'),
    logoutBtn: document.getElementById('logout-btn')
};

// ==================== DEFAULT FACILITIES ====================
const defaultFacilities = [
    { id: 1, name: 'Air condition', icon: '❄️', available: true },
    { id: 2, name: 'Wi-Fi', icon: '📶', available: true },
    { id: 3, name: 'Study Lamp', icon: '💡', available: true },
    { id: 4, name: 'Wardrobe', icon: '🚪', available: true },
    { id: 5, name: 'Study Table', icon: '📚', available: true },
    { id: 6, name: 'Power Outlets', icon: '🔌', available: true }
];

// ==================== AUTHENTICATION CHECK ====================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('User logged in:', user.email);
        await loadRoomInformation(user.uid);
    } else {
        console.log('No user logged in');
        window.location.href = 'login.html';
    }
});

// ==================== LOAD ROOM INFORMATION FROM FIREBASE ====================
async function loadRoomInformation(userId) {
    try {
        showLoading(true);
        
        console.log('Loading room information for user:', userId);
        
        // Firebase Firestore එකෙන් student data ගන්නවා
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Room data loaded from Firebase:', userData);
            
            // Registration වෙලා save වෙච්ච room data extract කරනවා
            currentRoomData = {
                studentId: userId,
                roomNumber: userData.roomNumber || '001 - B',
                block: extractBlock(userData.hostelName) || 'Block A',
                floor: userData.floor ? `${userData.floor}${getFloorSuffix(userData.floor)} Floor` : '2nd Floor',
                bedNumber: userData.bedNumber || 'Bed 2',
                roomType: userData.roomType || 'Double Sharing',
                capacity: userData.capacity || 2,
                occupied: userData.occupied || 2,
                occupancy: `${userData.occupied || 2}/${userData.capacity || 2} student`,
                status: userData.status || 'Active',
                facilities: userData.facilities || defaultFacilities
            };
            
            // UI update කරනවා
            updateRoomDetails(currentRoomData);
            updateRoomFacilities(currentRoomData.facilities);
            
            console.log('Room information displayed successfully');
            
        } else {
            console.error('Student data not found');
            alert('Student profile not found. Please contact admin.');
            await signOut(auth);
            window.location.href = 'login.html';
        }
        
    } catch (error) {
        console.error('Error loading room information:', error);
        alert('Failed to load room data. Please try again.');
    } finally {
        showLoading(false);
    }
}

// ==================== EXTRACT BLOCK FROM HOSTEL NAME ====================
function extractBlock(hostelName) {
    if (!hostelName) return 'Block A';
    
    // "Smart Hostel - Block A" වගේ format එකෙන් block එක ගන්නවා
    const match = hostelName.match(/Block\s+([A-Z])/i);
    return match ? `Block ${match[1].toUpperCase()}` : 'Block A';
}

// ==================== GET FLOOR SUFFIX ====================
function getFloorSuffix(floor) {
    const num = parseInt(floor);
    if (num === 1) return 'st';
    if (num === 2) return 'nd';
    if (num === 3) return 'rd';
    return 'th';
}

// ==================== UPDATE ROOM DETAILS ====================
function updateRoomDetails(roomData) {
    // Status update - Registration වෙලා save වෙච්ච status එක show කරනවා
    if (elements.roomStatus) {
        elements.roomStatus.textContent = roomData.status;
        
        if (roomData.status && roomData.status.toLowerCase() === 'inactive') {
            elements.roomStatus.classList.add('inactive');
        } else {
            elements.roomStatus.classList.remove('inactive');
        }
    }
    
    // Room Number - Registration වෙලා save වෙච්ච room number එක
    if (elements.roomNumber) {
        elements.roomNumber.textContent = roomData.roomNumber;
    }
    
    // Block - Hostel name එකෙන් extract කරපු block එක
    if (elements.roomBlock) {
        elements.roomBlock.textContent = roomData.block;
    }
    
    // Floor - Registration වෙලා save වෙච්ච floor එක
    if (elements.roomFloor) {
        elements.roomFloor.textContent = roomData.floor;
    }
    
    // Bed Number - Student ට assign වෙච්ච bed එක
    if (elements.bedNumber) {
        elements.bedNumber.textContent = roomData.bedNumber;
    }
    
    // Room Type - Registration data එකෙන් ගන්න room type එක
    if (elements.roomType) {
        elements.roomType.textContent = roomData.roomType;
    }
    
    // Occupancy - කීයදෙනෙක් room එකේ ඉන්නවද
    if (elements.roomOccupancy) {
        elements.roomOccupancy.textContent = roomData.occupancy;
    }
}

// ==================== UPDATE ROOM FACILITIES ====================
function updateRoomFacilities(facilities) {
    if (!elements.facilitiesGrid) return;
    
    elements.facilitiesGrid.innerHTML = '';
    
    if (!facilities || facilities.length === 0) {
        // Default facilities use කරනවා data නැත්නම්
        facilities = defaultFacilities;
    }
    
    // Registration වෙලා save වෙච්ච facilities list එක show කරනවා
    facilities.forEach(facility => {
        const facilityItem = document.createElement('div');
        facilityItem.className = 'facility-item';
        facilityItem.setAttribute('data-facility-id', facility.id);
        
        if (!facility.available) {
            facilityItem.style.opacity = '0.5';
        }
        
        facilityItem.innerHTML = `
            <div class="facility-icon">${facility.icon}</div>
            <div class="facility-name">${facility.name}</div>
        `;
        
        elements.facilitiesGrid.appendChild(facilityItem);
    });
}

// ==================== LOGOUT ====================
if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (confirm('Are you sure you want to logout?')) {
            try {
                await signOut(auth);
                sessionStorage.clear();
                localStorage.clear();
                currentRoomData = {
                    studentId: null,
                    roomNumber: null,
                    block: null,
                    floor: null,
                    bedNumber: null,
                    roomType: null,
                    capacity: null,
                    occupied: null,
                    occupancy: null,
                    status: null,
                    facilities: []
                };
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

// ==================== REFRESH FUNCTION ====================
async function refreshRoomInfo() {
    const user = auth.currentUser;
    if (user) {
        console.log('Refreshing room information...');
        await loadRoomInformation(user.uid);
    }
}

// ==================== EXPORT FUNCTIONS ====================
window.refreshRoomInfo = refreshRoomInfo;
window.loadRoomInformation = loadRoomInformation;
window.getCurrentRoomData = () => currentRoomData;

console.log('Room information page initialized with Firebase integration');