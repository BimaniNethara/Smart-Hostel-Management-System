import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");
const alertBox = document.getElementById("alertBox");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginAsSelect = document.getElementById("loginAs");

function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`;
  alertBox.style.display = "block";
  setTimeout(() => {
    alertBox.style.display = "none";
  }, 4000);
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const loginAs = loginAsSelect.value;

  if (!email) {
    showAlert("Please Enter Email / University ID", "error");
    emailInput.focus();
    return;
  }

  if (!password) {
    showAlert("Please Enter Password", "error");
    passwordInput.focus();
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; // declared only ONCE

    // Student check
    if (loginAs === "student") {
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        showAlert("You are not registered as a student.", "error");
        await auth.signOut();
        return; // stops here if not found
      }

      const studentData = querySnapshot.docs[0].data();
      console.log("Student found:", studentData.firstName);
    }

    // Runs only if check passed
    console.log("Logged in user:", user.email);
    showAlert(`Login successful as ${loginAs}`, "success");

    setTimeout(() => {
      if (loginAs === "student") {
        window.location.href = "../student_dashboard/MyDashboard.html";
      } else if (loginAs === "admin") {
        window.location.href = "adminlogin/admindashboard.html";
      } else if (loginAs === "warden") {
        window.location.href = "/StudentLoginPages/WardenPannel/wardenmain.html";
      }
    }, 1500);

  } catch (error) {
    console.error(error);
    if (error.code === "auth/user-not-found") {
      showAlert("User account not found", "error");
    } else if (error.code === "auth/wrong-password") {
      showAlert("Password is incorrect", "error");
    } else {
      showAlert(error.message, "error");
    }
  }
});