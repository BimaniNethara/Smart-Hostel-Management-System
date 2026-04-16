import { db, storage } from "./firebasenew.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const auth = getAuth();

// panels & navigation
const panels = {
  1: document.getElementById("step-1"),
  2: document.getElementById("step-2"),
  3: document.getElementById("step-3")
};
const stepNums = Array.from(document.querySelectorAll(".step-num"));
function showStep(n) {
  Object.keys(panels).forEach(k => panels[k].classList.toggle("active", Number(k) === n));
  stepNums.forEach(el => el.classList.toggle("active", Number(el.dataset.step) === n));
}

const toStep2 = document.getElementById("toStep2");
const backTo1 = document.getElementById("backTo1");
const toStep3 = document.getElementById("toStep3");
const backTo2 = document.getElementById("backTo2");
const finishBtn = document.getElementById("finishBtn");
const gotoLogin = document.getElementById("gotoLogin");
const profileInput = document.getElementById("profileImage");
const previewImg = document.getElementById("previewImg");
const previewWrap = document.getElementById("previewWrap");
const statusEl = document.getElementById("status");

// step inputs
const fullName = document.getElementById("fullName");
const empId = document.getElementById("empId");
const dob = document.getElementById("dob");
const gender = document.getElementById("gender");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const address = document.getElementById("address");
const username = document.getElementById("username");
const password = document.getElementById("password");

// confirmation outputs
const cFullName = document.getElementById("cFullName");
const cEmpId = document.getElementById("cEmpId");
const cDob = document.getElementById("cDob");
const cGender = document.getElementById("cGender");
const cEmail = document.getElementById("cEmail");
const cPhone = document.getElementById("cPhone");
const cAddress = document.getElementById("cAddress");
const cUsername = document.getElementById("cUsername");
const cImage = document.getElementById("cImage");

// helpers
function setStatus(msg, color = "black") {
  statusEl.textContent = msg;
  statusEl.style.color = color;
}

// profile preview
profileInput.addEventListener("change", () => {
  const file = profileInput.files[0];
  if (!file) {
    previewImg.src = "";
    previewWrap.classList.remove("active");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    previewImg.src = reader.result;
    previewWrap.classList.add("active");
  };
  reader.readAsDataURL(file);
});

// step navigation
toStep2.addEventListener("click", () => {
  if (!fullName.value || !empId.value || !email.value || !phone.value || !address.value || !gender.value) {
    alert("Please fill all required personal fields.");
    return;
  }
  showStep(2);
});
backTo1.addEventListener("click", () => showStep(1));
toStep3.addEventListener("click", () => {
  if (!username.value || !password.value) {
    alert("Please enter username and password.");
    return;
  }
  populateConfirm();
  showStep(3);
});
backTo2.addEventListener("click", () => showStep(2));

// confirm view
function populateConfirm() {
  cFullName.textContent = fullName.value;
  cEmpId.textContent = empId.value;
  cDob.textContent = dob.value;
  cGender.textContent = gender.value;
  cEmail.textContent = email.value;
  cPhone.textContent = phone.value;
  cAddress.textContent = address.value;
  cUsername.textContent = username.value;
  if (previewImg.src) {
    cImage.src = previewImg.src;
    cImage.style.display = "block";
  } else {
    cImage.style.display = "none";
  }
}

// final submit
finishBtn.addEventListener("click", async () => {
  const file = profileInput.files[0];
  if (!fullName.value || !email.value || !username.value || !password.value) {
    alert("Please fill in all required fields.");
    return;
  }

  setStatus("Submitting...");
  finishBtn.disabled = true;

  try {
    // 1️⃣ Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email.value.trim(), password.value.trim());
    const user = userCredential.user;

    // 2️⃣ Upload profile image (if any)
    let profileUrl = "";
    if (file && storage) {
      const storageRef = ref(storage, `admin_profiles/${user.uid}_${file.name}`);
      await uploadBytes(storageRef, file);
      profileUrl = await getDownloadURL(storageRef);
    }

    // 3️⃣ Save details to Firestore
    await addDoc(collection(db, "adminAccounts"), {
      uid: user.uid,
      fullName: fullName.value,
      empId: empId.value,
      dob: dob.value,
      gender: gender.value,
      email: email.value,
      phone: phone.value,
      address: address.value,
      username: username.value,
      profileImage: profileUrl,
      createdAt: serverTimestamp()
    });

    alert("Admin registration successful!");
    setStatus("✅ Registration successful! Redirecting to login...", "green");
    setTimeout(() => (window.location.href = "login.html"), 1500);

  } catch (err) {
    console.error(err);
    setStatus("❌ " + err.message, "red");
  } finally {
    finishBtn.disabled = false;
  }
});

// go to login
gotoLogin.addEventListener("click", () => {
  window.location.href = "login.html";
});
