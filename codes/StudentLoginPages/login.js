import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from 
"https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

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

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const loginAs = loginAsSelect.value;

  // Basic validation
  if (!email) {
    showAlert("Please Enter Email / University ID", "error");
    emailInput.focus();
    return;
  }

  if (!password) {
    showAlert("Please Enter Password ", "error");
    passwordInput.focus();
    return;
  }

  try {
    //  Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;
    console.log("Logged in user:", user.email);

    showAlert(`Login successful as ${loginAs}`, "success");

    // Redirect by role
    setTimeout(() => {
      if (loginAs === "student") {
        window.location.href = "student_dashboard/MyDashboard.html";
      } 
      else if (loginAs === "admin") {
        window.location.href = "adminlogin/admindashboard.html";
      } 
      else if (loginAs === "warden") {
        window.location.href = "/StudentLoginPages/WardenPannel/wardenmain.html";
      }
    }, 1500);

  } catch (error) {
    console.error(error);

    // Friendly error messages
    if (error.code === "auth/user-not-found") {
      showAlert("User account does not found", "error");
    } 
    else if (error.code === "auth/wrong-password") {
      showAlert("Password is incorrect", "error");
    } 
    else {
      showAlert(error.message, "error");
    }
  }
});
