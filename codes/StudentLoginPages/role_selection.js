// Select buttons
const studentBtn = document.getElementById('studentBtn');
const wardenBtn = document.getElementById('wardenBtn');
const adminBtn = document.getElementById('adminBtn');

// Navigate to respective registration pages
studentBtn.addEventListener('click', () => {
    window.location.href = 'student_registration.html'; // Change to your student registration page
});

wardenBtn.addEventListener('click', () => {
    window.location.href = 'WardenPannel/wardenreg.html'; // Placeholder
});

adminBtn.addEventListener('click', () => {
    window.location.href = 'adminlogin/adminregistration.html'; // Placeholder
});
