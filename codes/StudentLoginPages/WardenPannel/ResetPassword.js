import { auth } from "./firebase.js";
import {
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Get elements
const resetForm = document.getElementById('resetForm');
const resetAlertBox = document.getElementById('resetAlertBox');
const resetEmailInput = document.getElementById('resetEmail');
const backToLoginBtn = document.getElementById('backToLogin');

// Show alert
function showAlert(message, type) {
  resetAlertBox.textContent = message;
  resetAlertBox.className = `alert alert-${type}`;
  resetAlertBox.style.display = 'block';

  setTimeout(() => {
    resetAlertBox.style.display = 'none';
  }, 4000);
}

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Submit form
resetForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = resetEmailInput.value.trim();

  if (!email) {
    showAlert("Please enter your email address", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showAlert("Please enter a valid email address", "error");
    return;
  }

  const submitBtn = resetForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  try {
    //  Firebase Password Reset
    await sendPasswordResetEmail(auth, email);

    showAlert(`Password reset link sent to ${email}`, "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);

  } catch (error) {
    console.error(error);

    if (error.code === "auth/user-not-found") {
      showAlert("No account found with this email", "error");
    } else {
      showAlert("Something went wrong. Try again.", "error");
    }

    submitBtn.disabled = false;
  }
});

// Back to login
backToLoginBtn.addEventListener('click', () => {
  window.location.href = "login.html";
});
