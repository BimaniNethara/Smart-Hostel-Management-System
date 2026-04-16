// ===== ADMIN STUDENT MANAGEMENT SCRIPT =====

// Highlight active sidebar link
document.querySelectorAll(".menu li a").forEach(link => {
  if (link.href === window.location.href) {
    link.parentElement.classList.add("active");
  }
});

// ===============================
// 🔥 FIREBASE IMPORTS & SETUP
// ===============================
import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ===============================
// 🎯 DOM ELEMENTS
// ===============================
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("studentSearchInput");
const studentCard = document.getElementById("studentCard");

const sName = document.getElementById("sName");
const sFaculty = document.getElementById("sFaculty");
const sRoom = document.getElementById("sRoom");
const sStatus = document.getElementById("sStatus");
const sAttendance = document.getElementById("sAttendance");
const sContact = document.getElementById("sContact");
const updateBtn = document.getElementById("updateBtn");

let currentStudentId = null;

// ===============================
// 🔍 SEARCH STUDENT BY NUMBER OR ID
// ===============================
searchBtn.addEventListener("click", async () => {
  const value = searchInput.value.trim();
  if (!value) {
    alert("Please enter a student number or ID.");
    return;
  }

  try {
    // You can change the field (contact → studentId) as per your database
    const q = query(collection(db, "students"), where("contact", "==", value));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("No student found with that number or ID.");
      studentCard.style.display = "none";
      return;
    }

    // Show student data
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      currentStudentId = docSnap.id;

      sName.textContent = data.name || "—";
      sFaculty.textContent = data.faculty || "—";
      sRoom.value = data.room || "";
      sStatus.value = data.status || "Active";
      sAttendance.value = data.attendance || "";
      sContact.value = data.contact || "";

      studentCard.style.display = "block";
    });

  } catch (error) {
    console.error("Error fetching student:", error);
    alert("An error occurred while searching. Check console for details.");
  }
});

// ===============================
// 💾 UPDATE STUDENT INFO
// ===============================
updateBtn.addEventListener("click", async () => {
  if (!currentStudentId) {
    alert("Please search a student first.");
    return;
  }

  try {
    const studentRef = doc(db, "students", currentStudentId);
    await updateDoc(studentRef, {
      room: sRoom.value,
      status: sStatus.value,
      contact: sContact.value
    });

    alert("✅ Student information updated successfully!");
  } catch (error) {
    console.error("Error updating student:", error);
    alert("❌ Failed to update student info.");
  }
});

// ===============================
// 📊 OPTIONAL: FILTER TABLE (if you keep table view)
// ===============================
const table = document.getElementById("studentTable");
const facultyFilter = document.getElementById("facultyFilter");
const yearFilter = document.getElementById("yearFilter");
const statusFilter = document.getElementById("statusFilter");

function filterStudents() {
  if (!table) return;

  const searchVal = searchInput.value.toLowerCase();
  const facultyVal = facultyFilter?.value || "All Faculty";
  const statusVal = statusFilter?.value || "Status";

  Array.from(table.getElementsByTagName("tr")).forEach((row, i) => {
    if (i === 0) return; // skip header

    const cells = row.getElementsByTagName("td");
    const faculty = cells[1]?.innerText || "";
    const status = cells[3]?.innerText || "";
    const text = row.innerText.toLowerCase();

    const matchFaculty = facultyVal === "All Faculty" || faculty === facultyVal;
    const matchStatus = statusVal === "Status" || status === statusVal;
    const matchSearch = text.includes(searchVal);

    row.style.display = matchFaculty && matchStatus && matchSearch ? "" : "none";
  });
}

if (table) {
  searchInput?.addEventListener("input", filterStudents);
  facultyFilter?.addEventListener("change", filterStudents);
  statusFilter?.addEventListener("change", filterStudents);
}
