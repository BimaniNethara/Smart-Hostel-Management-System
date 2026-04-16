import { db } from "./firebasenew.js";
import { doc, getDoc, collection, query, where, getDocs, limit } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const profilePreview = document.getElementById("profilePreview");
const defaultIcon = document.getElementById("defaultIcon");
const inputs = document.querySelectorAll('.info-item input');
const logoutBtn = document.getElementById("logoutBtn");

function setInputByIndex(idx, value) {
  if (inputs && inputs[idx]) inputs[idx].value = value ?? "";
}

function showProfileImage(url) {
  if (!url) return;
  profilePreview.src = url;
  profilePreview.style.display = "block";
  if (defaultIcon) defaultIcon.style.display = "none";
}

function getCurrentUserSession() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  } catch (e) {
    return null;
  }
}

async function loadAdminData() {
  const sess = getCurrentUserSession();
  if (!sess || sess.role !== "admin") {
    console.warn("No admin session found — redirecting to login.");
    window.location.href = "login.html";
    return;
  }

  const username = sess.username || sess.email || null;
  let data = null;

  try {
    const adminsRef = collection(db, "adminAccounts");
    let q = query(adminsRef, where("email", "==", username), limit(1));
    let snap = await getDocs(q);

    if (snap.empty) {
      q = query(adminsRef, where("username", "==", username), limit(1));
      snap = await getDocs(q);
    }

    if (!snap.empty) data = snap.docs[0].data();

    if (!data) {
      console.warn("Admin document not found for session user.");
      return;
    }

    // 🧩 Fill the fields
    setInputByIndex(0, data.fullName || "");
    setInputByIndex(1, data.empId || "");
    setInputByIndex(2, data.email || "");
    setInputByIndex(3, data.phone || "");
    setInputByIndex(4, data.department || "Hostel Administration");
    setInputByIndex(5, data.qualification || "BSc in Computer Science");
    setInputByIndex(6, data.address || "");

    const headerName = document.querySelector('.profile-card h2');
    if (headerName) headerName.textContent = data.fullName || headerName.textContent;

    const roleText = document.querySelector('.profile-card .role');
    if (roleText) roleText.textContent = "Hostel Administrator";

    if (data.profileImage) showProfileImage(data.profileImage);
  } catch (err) {
    console.error("Error loading admin data:", err);
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sessionStorage.clear();
    window.location.href = "login.html";
  });
}

const changePhotoBtn = document.getElementById("changePhotoBtn");
if (changePhotoBtn) {
  const uploadInput = document.getElementById("uploadPhoto");
  changePhotoBtn.addEventListener("click", () => uploadInput.click());

  uploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        profilePreview.src = event.target.result;
        profilePreview.style.display = "block";
        if (defaultIcon) defaultIcon.style.display = "none";
        localStorage.setItem("profileImage", event.target.result);
      };
      reader.readAsDataURL(file);
    }
  });
}

window.addEventListener("DOMContentLoaded", loadAdminData);
