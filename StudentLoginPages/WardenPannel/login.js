// login.js
// ===============================
// Handles Login for Student, Admin, and Warden
// ===============================

// [FIX // Change "./firebase.js" to "./firebasenew.js"
import { db } from "./firebasenew.js"; 
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const auth = getAuth(); // Ensure you initialize auth correctly

// Form elements
const loginForm = document.getElementById("loginForm");
const alertBox = document.getElementById("alertBox");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginAsSelect = document.getElementById("loginAs");

// Alert function
function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`;
  alertBox.style.display = "block";

  setTimeout(() => {
    alertBox.style.display = "none";
  }, 4000);
}

// Login submit
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const originalInput = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const loginAs = loginAsSelect.value;

  // Basic validation
  if (!originalInput) {
    showAlert("Please Enter Email / University ID", "error");
    emailInput.focus();
    return;
  }

  if (!password) {
    showAlert("Please Enter Password ", "error");
    passwordInput.focus();
    return;
  }

  // [FIX 2] Handle "Username vs Email" logic
  // If the user typed a simple username (no '@'), we append the domain
  // based on the registration logic we just built.
  let loginEmail = originalInput;

  if (!loginEmail.includes("@")) {
    if (loginAs === "warden") {
      loginEmail = `${originalInput}@warden.system`;
    } else if (loginAs === "student") {
      // Assuming students might also use IDs. 
      // Change this domain if students register differently!
      loginEmail = `${originalInput}@student.ruhuna.lk`; 
    } else {
      // Admins might need a specific domain too
      loginEmail = `${originalInput}@admin.system`;
    }
  }

  console.log(`Attempting login for: ${loginEmail} (${loginAs})`);

  try {
    // Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      loginEmail,
      password
    );

    const user = userCredential.user;
    console.log("Logged in user:", user.email);

    showAlert(`Login successful as ${loginAs}`, "success");

   // ... inside login.js ...

    // Redirect by role
    setTimeout(() => {
      if (loginAs === "student") {
        window.location.href = "../StudentLoginPages/student_dashboard/studentDashboard.html";
      } 
      else if (loginAs === "admin") {
        window.location.href = "../adminlogin/adminDashboard.html";
      } 
      else if (loginAs === "warden") {
        // [CHANGE THIS LINE]
        window.location.href = "wardenmain.html"; 
      }
    }, 500);

  } catch (error) {
    console.error(error);

    // Friendly error messages
    let msg = "Login failed. Please check your credentials.";
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
      msg = "Invalid User ID or Password.";
    } else if (error.code === "auth/invalid-email") {
      msg = "Invalid ID format.";
    } else if (error.code === "auth/wrong-password") {
      msg = "Incorrect Password.";
    }
    
    showAlert(msg, "error");
  }
});