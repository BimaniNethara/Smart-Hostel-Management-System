import { db, auth } from "./firebasenew.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { collection, query, where, getDocs, limit } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const alertBox = document.getElementById("alertBox");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginAsSelect = document.getElementById("loginAs");

function showAlert(message, type = "error") {
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
  alertBox.style.display = "block";
  setTimeout(() => (alertBox.style.display = "none"), 3000);
}

// Prevent the form from resetting or auto-submitting
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const role = loginAsSelect.value;

  if (!role) return showAlert("Please select a user type.", "error");
  if (!email) return showAlert("Please enter your email.", "error");
  if (!password) return showAlert("Please enter your password.", "error");

  try {
    // 1️⃣ Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2️⃣ Handle roles separately
    if (role === "admin") {
      const q = query(collection(db, "adminAccounts"), where("email", "==", email), limit(1));
      const snap = await getDocs(q);

      if (snap.empty) return showAlert("Admin account not found in Firestore.", "error");

      const adminData = snap.docs[0].data();

      // ✅ Save session info
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          role: "admin",
          uid: adminData.uid || "",
          email: adminData.email || "",
          username: adminData.username || ""
        })
      );

      showAlert("✅ Admin login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href ="admindashboard.html";
      }, 1000);
      return;
    }

    if (role === "student") {
      showAlert("Student login not connected yet.", "error");
      return;
    }

    if (role === "warden") {
      showAlert("Warden login not connected yet.", "error");
      return;
    }
  } catch (error) {
    console.error(error);
    if (error.code === "auth/user-not-found") showAlert("Account not found.", "error");
    else if (error.code === "auth/wrong-password") showAlert("Incorrect password.", "error");
    else showAlert("Login failed: " + error.message, "error");
  }
});
