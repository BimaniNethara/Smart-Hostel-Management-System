// ==================== FIREBASE IMPORTS ====================
import { auth, db, storage } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js";

let currentProfileData = {};
let firestoreDocId     = null;

// ==================== DOM ELEMENTS ====================
const elements = {
    headerStudentName:  document.getElementById('header-student-name'),
    firstName:          document.getElementById('first-name'),
    lastName:           document.getElementById('last-name'),
    dateOfBirth:        document.getElementById('date-of-birth'),
    email:              document.getElementById('email'),
    address:            document.getElementById('address'),
    gender:             document.getElementById('gender'),
    phoneNumber:        document.getElementById('phone-number'),
    emergencyNumber:    document.getElementById('emergency-number'),
    studentId:          document.getElementById('student-id'),
    year:               document.getElementById('year'),
    department:         document.getElementById('department'),
    faculty:            document.getElementById('faculty'),
    regDate:            document.getElementById('reg-date'),
    expiredDate:        document.getElementById('expired-date'),
    // Main profile card picture
    profileImage:       document.getElementById('profile-image'),
    profilePlaceholder: document.getElementById('profile-placeholder'),
    profileInitials:    document.getElementById('profile-initials'),
    profileUpload:      document.getElementById('profile-upload'),
    logoutBtn:          document.getElementById('logout-btn'),
    // Sidebar picture
    sidebarImage:       document.getElementById('profileImage')
};

// ==================== AUTH STATE ====================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        await loadStudentProfile(user.uid);
    } else {
        window.location.href = 'login.html';
    }
});

// ==================== LOAD PROFILE ====================
async function loadStudentProfile(userId) {
    try {
        const q    = query(collection(db, "students"), where("uid", "==", userId));
        const snap = await getDocs(q);

        let userData = null;
        if (!snap.empty) {
            firestoreDocId = snap.docs[0].id;
            userData       = snap.docs[0].data();
        }

        if (!userData) {
            alert('Profile not found. Please contact administrator.');
            await signOut(auth);
            window.location.href = 'login.html';
            return;
        }

        currentProfileData = {
            userId,
            firstName:       userData.firstName        || '',
            lastName:        userData.lastName         || '',
            fullName:        `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            dateOfBirth:     userData.dob              || '',
            email:           userData.email            || '',
            address:         userData.address          || '',
            gender:          userData.gender           || '',
            phoneNumber:     userData.contact          || '',
            emergencyNumber: userData.emergency        || '',
            studentIdValue:  userData.studentId        || '',
            faculty:         userData.faculty          || '',
            department:      userData.department       || '',
            year:            userData.academicYear     || '',
            regDate:         userData.registrationDate || '',
            expiredDate:     userData.expiryDate       || '',
            profilePicture:  userData.profileImage     || null
        };

        populateForm(currentProfileData);

    } catch (err) {
        console.error('❌ Error:', err);
        alert('Error loading profile. Please refresh.');
    }
}

// ==================== POPULATE FORM ====================
function populateForm(d) {
    if (elements.headerStudentName) elements.headerStudentName.textContent = d.fullName || 'Student';
    if (elements.firstName)         elements.firstName.value       = d.firstName;
    if (elements.lastName)          elements.lastName.value        = d.lastName;
    if (elements.dateOfBirth)       elements.dateOfBirth.value     = formatDate(d.dateOfBirth);
    if (elements.email)             elements.email.value           = d.email;
    if (elements.address)           elements.address.value         = d.address;
    if (elements.gender)            elements.gender.value          = d.gender;
    if (elements.phoneNumber)       elements.phoneNumber.value     = d.phoneNumber;
    if (elements.emergencyNumber)   elements.emergencyNumber.value = d.emergencyNumber;
    if (elements.studentId)         elements.studentId.value       = d.studentIdValue;
    if (elements.year)              elements.year.value            = d.year;
    if (elements.department)        elements.department.value      = d.department;
    if (elements.faculty)           elements.faculty.value         = d.faculty;
    if (elements.regDate)           elements.regDate.value         = formatDate(d.regDate);
    if (elements.expiredDate)       elements.expiredDate.value     = formatDate(d.expiredDate);

    // Main card picture + sidebar picture දෙකම update
    updateAllPictures(d.profilePicture, d.firstName, d.lastName);
}

// ==================== UPDATE ALL PICTURES ====================
// Main profile card + sidebar දෙකම එකවර update කරනවා
function updateAllPictures(url, firstName, lastName) {
    // 1. Main profile card picture
    if (url) {
        if (elements.profileImage) {
            elements.profileImage.src           = url;
            elements.profileImage.style.display = 'block';
        }
        if (elements.profilePlaceholder) elements.profilePlaceholder.style.display = 'none';
    } else {
        if (elements.profileImage)       elements.profileImage.style.display       = 'none';
        if (elements.profilePlaceholder) elements.profilePlaceholder.style.display = 'flex';
        if (elements.profileInitials) {
            const f = (firstName || '').charAt(0).toUpperCase();
            const l = (lastName  || '').charAt(0).toUpperCase();
            elements.profileInitials.textContent = (f + l) || 'SP';
        }
    }

    // 2. Sidebar picture (id="profileImage" in sidebar)
    if (elements.sidebarImage) {
        if (url) {
            elements.sidebarImage.src           = url;
            elements.sidebarImage.style.display = 'block';
        } else {
            elements.sidebarImage.style.display = 'none';
            // Initials fallback for sidebar
            const avatarDiv = document.querySelector('.sidebar .avatar');
            if (avatarDiv) {
                const f = (firstName || '').charAt(0).toUpperCase();
                const l = (lastName  || '').charAt(0).toUpperCase();
                avatarDiv.innerHTML = `
                    <div style="
                        width:100%; height:100%; border-radius:50%;
                        background:linear-gradient(135deg,#4a9eff,#2d7dd2);
                        display:flex; align-items:center; justify-content:center;
                        color:white; font-weight:700; font-size:20px;
                    ">${(f + l) || 'SP'}</div>`;
            }
        }
    }
}

// ==================== FORMAT DATE ====================
function formatDate(val) {
    if (!val) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const gm = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (gm) return `${gm[3]}-${gm[2].padStart(2,'0')}-${gm[1].padStart(2,'0')}`;
    try { return new Date(val).toISOString().split('T')[0]; } catch { return val; }
}

// ==================== PROFILE PICTURE UPLOAD ====================
if (elements.profileUpload) {
    elements.profileUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
        if (file.size > 5 * 1024 * 1024)    { alert('File must be under 5MB'); return; }

        // Local preview — main card + sidebar දෙකම
        const reader = new FileReader();
        reader.onload = ev => updateAllPictures(
            ev.target.result,
            currentProfileData.firstName,
            currentProfileData.lastName
        );
        reader.readAsDataURL(file);

        const user = auth.currentUser;
        if (!user) return;

        const label = document.querySelector('.upload-button');
        if (label) label.textContent = 'Uploading...';

        try {
            // Firebase Storage upload
            const imgRef = ref(storage, `profileImages/${user.uid}`);
            await uploadBytes(imgRef, file);
            const url = await getDownloadURL(imgRef);

            // Firestore — students collection update
            if (firestoreDocId) {
                await updateDoc(doc(db, "students", firestoreDocId), { profileImage: url });
            }

            currentProfileData.profilePicture = url;

            // Storage URL එකෙන් දෙකම update
            updateAllPictures(url, currentProfileData.firstName, currentProfileData.lastName);

            showSuccessMessage('✅ Profile picture updated!');
        } catch (err) {
            console.error('❌ Upload error:', err);
            alert('Error uploading picture. Try again.');
        } finally {
            if (label) {
                label.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                </svg> Change Photo`;
            }
        }
    });
}

// ==================== LOGOUT ====================
if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to logout?')) return;
        try {
            await signOut(auth);
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = 'login.html';
        } catch (err) {
            console.error('❌ Logout error:', err);
        }
    });
}

// ==================== SUCCESS MESSAGE ====================
function showSuccessMessage(msg) {
    const div = document.createElement('div');
    div.className   = 'success-message';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

console.log('🎓 MyStudentProfile.js ready');