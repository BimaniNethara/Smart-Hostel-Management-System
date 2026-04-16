// ==================== FIREBASE IMPORTS ====================
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js";

// ==================== STORAGE ====================
const storage = getStorage();

// ==================== STUDENT PROFILE DATA ====================
let currentProfileData = {
    userId: null,
    firstName: null,
    lastName: null,
    fullName: null,
    dateOfBirth: null,
    email: null,
    address: null,
    gender: null,
    phoneNumber: null,
    emergencyNumber: null,
    universityId: null,
    year: null,
    department: null,
    faculty: null,
    regDate: null,
    expiredDate: null,
    profilePicture: null,
    hostelName: null,
    floor: null
};

// ==================== DOM ELEMENTS ====================
const elements = {
    headerStudentName: document.getElementById('header-student-name'),
    profileForm: document.getElementById('profile-form'),
    firstName: document.getElementById('first-name'),
    lastName: document.getElementById('last-name'),
    dateOfBirth: document.getElementById('date-of-birth'),
    email: document.getElementById('email'),
    address: document.getElementById('address'),
    gender: document.getElementById('gender'),
    phoneNumber: document.getElementById('phone-number'),
    emergencyNumber: document.getElementById('emergency-number'),
    studentId: document.getElementById('student-id'),
    year: document.getElementById('year'),
    department: document.getElementById('department'),
    faculty: document.getElementById('faculty'),
    regDate: document.getElementById('reg-date'),
    expiredDate: document.getElementById('expired-date'),
    profileImage: document.getElementById('profile-image'),
    profilePlaceholder: document.getElementById('profile-placeholder'),
    profileInitials: document.getElementById('profile-initials'),
    profileUpload: document.getElementById('profile-upload'),
    saveButton: document.getElementById('save-button'),
    logoutBtn: document.getElementById('logout-btn')
};

// ==================== AUTHENTICATION CHECK ====================
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('✅ User authenticated:', user.email);
        console.log('🔑 User ID:', user.uid);
        
        // Login වෙච්ච user ගේ profile data load කරනවා
        await loadStudentProfile(user.uid);
    } else {
        console.log('❌ No user logged in - redirecting to login');
        window.location.href = 'login.html';
    }
});

// ==================== LOAD STUDENT PROFILE FROM FIREBASE ====================
async function loadStudentProfile(userId) {
    try {
        showLoading(true);
        
        console.log('📥 Loading student profile from Firestore...');
        console.log('👤 User ID:', userId);
        
        // Firebase Firestore එකෙන් registration වෙලා save වෙච්ච data ගන්නවා
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('✅ Profile data loaded from Firebase!');
            console.log('📊 Complete registration data:', userData);
            
            // Registration වෙලා save වෙච්ච හැම field එකක්ම profile data object එකට දාන්නවා
            currentProfileData = {
                userId: userId,
                
                // Personal Info - Registration Step 1 data
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                fullName: userData.fullName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
                dateOfBirth: userData.dob || '',
                email: userData.email || '',
                address: userData.address || '',
                gender: userData.gender || '',
                
                // Contact Info - Registration Step 1 data
                phoneNumber: userData.contact || '',
                emergencyNumber: userData.emergency || '',
                
                // Academic Info - Registration Step 2 data
                faculty: userData.faculty || '',
                department: userData.department || '',
                year: extractYear(userData.academicYear),
                academicYear: userData.academicYear || '',
                
                // Hostel Info - Registration Step 3 data
                hostelName: userData.hostelName || '',
                floor: userData.floor || '',
                
                // Registration Info - Step 4 data
                universityId: userData.universityId || '',
                regDate: userData.registrationDate || '',
                expiredDate: userData.expiryDate || '',
                
                // Profile Picture
                profilePicture: userData.profileImage || null
            };
            
            console.log('📌 Name:', currentProfileData.fullName);
            console.log('🎓 Faculty:', currentProfileData.faculty);
            console.log('📧 Email:', currentProfileData.email);
            console.log('🆔 University ID:', currentProfileData.universityId);
            console.log('✅ Profile data object:', currentProfileData);
            
            // Form එකේ හැම field එකම automatically fill කරනවා registration data එක්ක
            populateForm(currentProfileData);
            
            console.log('✅ Profile form populated with registration data');
            
        } else {
            console.error('❌ Student profile not found in Firestore');
            console.error('🔍 Searched for user ID:', userId);
            alert('❌ Profile not found!\n\nPlease contact administrator.');
            await signOut(auth);
            window.location.href = 'login.html';
        }
        
    } catch (error) {
        console.error('❌ Error loading student profile:', error);
        console.error('Error details:', error.message);
        alert('Failed to load profile data. Please refresh the page.');
    } finally {
        showLoading(false);
    }
}

// ==================== EXTRACT YEAR FROM ACADEMIC YEAR ====================
function extractYear(academicYear) {
    if (!academicYear) return '';
    
    // "3rd Year" වගේ format එකෙන් number එක ගන්නවා
    const match = academicYear.match(/(\d+)/);
    return match ? match[1] : '';
}

// ==================== POPULATE FORM WITH REGISTRATION DATA ====================
function populateForm(profileData) {
    console.log('🎨 Filling form fields with registration data...');
    
    // Header එකේ student name update කරනවා
    if (elements.headerStudentName) {
        elements.headerStudentName.textContent = profileData.fullName || 'Student Profile';
        console.log('✅ Header name:', profileData.fullName);
    }
    
    // Registration වෙලා save වෙච්ච හැම field එකක් automatically fill කරනවා
    
    // Personal Details - Registration Step 1 data
    if (elements.firstName) {
        elements.firstName.value = profileData.firstName;
        console.log('✅ First Name filled:', profileData.firstName);
    }
    
    if (elements.lastName) {
        elements.lastName.value = profileData.lastName;
        console.log('✅ Last Name filled:', profileData.lastName);
    }
    
    if (elements.dateOfBirth) {
        elements.dateOfBirth.value = formatDateForInput(profileData.dateOfBirth);
        console.log('✅ DOB filled:', profileData.dateOfBirth);
    }
    
    if (elements.email) {
        elements.email.value = profileData.email;
        console.log('✅ Email filled:', profileData.email);
    }
    
    if (elements.address) {
        elements.address.value = profileData.address;
        console.log('✅ Address filled:', profileData.address);
    }
    
    if (elements.gender) {
        elements.gender.value = profileData.gender;
        console.log('✅ Gender filled:', profileData.gender);
    }
    
    // Contact Details - Registration Step 1 data
    if (elements.phoneNumber) {
        elements.phoneNumber.value = profileData.phoneNumber;
        console.log('✅ Phone filled:', profileData.phoneNumber);
    }
    
    if (elements.emergencyNumber) {
        elements.emergencyNumber.value = profileData.emergencyNumber;
        console.log('✅ Emergency contact filled:', profileData.emergencyNumber);
    }
    
    // Academic Details - Registration Step 2 data
    if (elements.studentId) {
        elements.studentId.value = profileData.universityId;
        console.log('✅ University ID filled:', profileData.universityId);
    }
    
    if (elements.year) {
        elements.year.value = profileData.year;
        console.log('✅ Year filled:', profileData.year);
    }
    
    if (elements.department) {
        elements.department.value = profileData.department;
        console.log('✅ Department filled:', profileData.department);
    }
    
    if (elements.faculty) {
        elements.faculty.value = profileData.faculty;
        console.log('✅ Faculty filled:', profileData.faculty);
    }
    
    // Registration Dates - Step 4 data
    if (elements.regDate) {
        elements.regDate.value = formatDateForInput(profileData.regDate);
        console.log('✅ Registration date filled:', profileData.regDate);
    }
    
    if (elements.expiredDate) {
        elements.expiredDate.value = formatDateForInput(profileData.expiredDate);
        console.log('✅ Expiry date filled:', profileData.expiredDate);
    }
    
    // Profile picture update කරනවා - Registration වෙද්දී upload කරපු photo එක
    updateProfilePicture(profileData.profilePicture, profileData.firstName, profileData.lastName);
    
    console.log('✅ All form fields populated successfully!');
}

// ==================== FORMAT DATE FOR INPUT ====================
function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    // Check if already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }
    
    try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Date format error:', error);
        return '';
    }
}

// ==================== UPDATE PROFILE PICTURE ====================
function updateProfilePicture(pictureUrl, firstName, lastName) {
    if (pictureUrl && elements.profileImage) {
        // Registration වෙද්දී upload කරපු photo එක show කරනවා
        elements.profileImage.src = pictureUrl;
        elements.profileImage.style.display = 'block';
        if (elements.profilePlaceholder) {
            elements.profilePlaceholder.style.display = 'none';
        }
        console.log('✅ Profile picture displayed:', pictureUrl);
    } else {
        // Photo එකක් නැත්නම් initials එක show කරනවා
        if (elements.profileImage) {
            elements.profileImage.style.display = 'none';
        }
        if (elements.profilePlaceholder) {
            elements.profilePlaceholder.style.display = 'flex';
        }
        if (elements.profileInitials) {
            const initials = getInitials(firstName, lastName);
            elements.profileInitials.textContent = initials;
            console.log('✅ Profile initials displayed:', initials);
        }
    }
}

// ==================== GET INITIALS ====================
function getInitials(firstName, lastName) {
    const first = (firstName || '').charAt(0).toUpperCase();
    const last = (lastName || '').charAt(0).toUpperCase();
    return first + last || 'SP';
}

// ==================== PROFILE PICTURE UPLOAD ====================
if (elements.profileUpload) {
    elements.profileUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('⚠️ Please select an image file');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('⚠️ File size must be less than 5MB');
            return;
        }
        
        // Preview image locally first
        const reader = new FileReader();
        reader.onload = (e) => {
            updateProfilePicture(e.target.result, elements.firstName?.value, elements.lastName?.value);
        };
        reader.readAsDataURL(file);
        
        // Upload to Firebase Storage
        try {
            const user = auth.currentUser;
            if (!user) return;
            
            showLoading(true);
            console.log('📸 Uploading new profile picture...');
            
            // Firebase Storage එකට upload කරනවා
            const imageRef = ref(storage, `profileImages/${user.uid}`);
            await uploadBytes(imageRef, file);
            const profileImageURL = await getDownloadURL(imageRef);
            
            // Firestore එකේ update කරනවා
            await updateDoc(doc(db, "users", user.uid), {
                profileImage: profileImageURL
            });
            
            currentProfileData.profilePicture = profileImageURL;
            
            showSuccessMessage('✅ Profile picture updated successfully!');
            console.log('✅ Profile picture uploaded:', profileImageURL);
            
        } catch (error) {
            console.error('❌ Error uploading profile picture:', error);
            alert('❌ Error uploading profile picture. Please try again.');
        } finally {
            showLoading(false);
        }
    });
}

// ==================== FORM SUBMISSION - UPDATE PROFILE ====================
if (elements.profileForm) {
    elements.profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = auth.currentUser;
        if (!user) {
            alert('⚠️ Please login again');
            return;
        }
        
        showLoading(true);
        console.log('💾 Saving profile changes to Firebase...');
        
        try {
            // Form එකෙන් updated data ගන්නවා
            const updatedData = {
                firstName: elements.firstName?.value || '',
                lastName: elements.lastName?.value || '',
                fullName: `${elements.firstName?.value || ''} ${elements.lastName?.value || ''}`.trim(),
                dob: elements.dateOfBirth?.value || '',
                address: elements.address?.value || '',
                gender: elements.gender?.value || '',
                contact: elements.phoneNumber?.value || '',
                emergency: elements.emergencyNumber?.value || '',
                academicYear: elements.year?.value ? `${elements.year.value}${getYearSuffix(elements.year.value)} Year` : '',
                department: elements.department?.value || '',
                faculty: elements.faculty?.value || '',
                expiryDate: elements.expiredDate?.value || '',
                lastUpdated: new Date().toISOString()
            };
            
            console.log('📤 Data to update:', updatedData);
            
            // Firebase Firestore එකේ update කරනවා
            await updateDoc(doc(db, "users", user.uid), updatedData);
            
            // Current profile data update කරනවා
            currentProfileData = { 
                ...currentProfileData, 
                ...updatedData,
                phoneNumber: updatedData.contact,
                emergencyNumber: updatedData.emergency,
                dateOfBirth: updatedData.dob
            };
            
            showSuccessMessage('✅ Profile updated successfully!');
            console.log('✅ Profile updated in Firebase successfully');
            console.log('📊 Updated profile data:', currentProfileData);
            
            // Reload profile after 1 second
            setTimeout(() => {
                loadStudentProfile(user.uid);
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error updating profile:', error);
            alert('❌ Error updating profile. Please try again.');
        } finally {
            showLoading(false);
        }
    });
}

// ==================== GET YEAR SUFFIX ====================
function getYearSuffix(year) {
    if (year === '1') return 'st';
    if (year === '2') return 'nd';
    if (year === '3') return 'rd';
    return 'th';
}

// ==================== LOGOUT ====================
if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (confirm('Are you sure you want to logout?')) {
            try {
                console.log('🚪 Logging out...');
                await signOut(auth);
                sessionStorage.clear();
                localStorage.clear();
                console.log('✅ Logged out successfully');
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
    if (show) {
        if (elements.saveButton) {
            elements.saveButton.disabled = true;
            elements.saveButton.textContent = 'Saving...';
        }
        console.log('⏳ Loading...');
    } else {
        if (elements.saveButton) {
            elements.saveButton.disabled = false;
            elements.saveButton.textContent = 'Save Changes';
        }
        console.log('✅ Loading complete');
    }
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// ==================== EXPORT FUNCTIONS ====================
window.loadStudentProfile = loadStudentProfile;
window.getCurrentProfileData = () => {
    console.log('📊 Current profile data requested:', currentProfileData);
    return currentProfileData;
};

console.log('🎓 Student Profile System initialized with Firebase');
console.log('📝 Ready to load registration data...');