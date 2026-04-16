// ============================
// Admin Dashboard - Firebase Connected
// ============================

import { auth, db } from "./firebasenew.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// ============================
// ELEMENTS
// ============================
const totalStudents = document.getElementById("totalStudents");
const roomsAvailable = document.getElementById("roomsAvailable");
const attendance = document.getElementById("attendance");
const logoutBtn = document.getElementById("logoutBtn");

// ============================
// CHECK LOGIN STATUS
// ============================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // If not logged in, redirect to login page
    window.location.href = "login.html";
    return;
  }

  console.log("✅ Admin Logged In:", user.email);

  // Load dashboard data
  await loadDashboardData();
});

// ============================
// LOAD FIRESTORE DATA
// ============================
async function loadDashboardData() {
  try {
    // Count total students (collection: students)
    const studentsSnap = await getDocs(collection(db, "students"));
    totalStudents.textContent = studentsSnap.size || 0;

    // Count rooms (collection: rooms)
    const roomsSnap = await getDocs(collection(db, "rooms"));
    roomsAvailable.textContent = roomsSnap.size || 0;

    // Attendance — just a simulated percentage for now
    attendance.textContent = "92%";

    // Draw chart
    renderAttendanceChart();

  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

// ============================
// ATTENDANCE CHART (Chart.js)
// ============================
function renderAttendanceChart() {
  const ctx = document.getElementById("attendanceChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Attendance %",
          data: [90, 93, 88, 91, 94, 89, 92],
          borderColor: "#2b6cb0",
          backgroundColor: "rgba(43,108,176,0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: { color: "#2b6cb0" }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: { color: "#333" },
          grid: { color: "#ddd" }
        },
        x: {
          ticks: { color: "#333" },
          grid: { color: "#eee" }
        }
      }
    }
  });
}

// ============================
// LOGOUT FUNCTION
// ============================
if (logoutBtn) {
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      sessionStorage.clear();
      window.location.href = "login.html";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  });
}
