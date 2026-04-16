// wardenreg.js
import { db } from "./firebasenew.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
// [NEW] Import Authentication functions
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {
  console.log(" DOM loaded, initializing registration form...");

  /* ===============================
     DOM Elements
     =============================== */
  const panels = {
    1: document.getElementById("step-1"),
    2: document.getElementById("step-2"),
    3: document.getElementById("step-3")
  };
  
  const stepNums = Array.from(document.querySelectorAll(".step-num"));
  const toStep2 = document.getElementById("toStep2");
  const backTo1 = document.getElementById("backTo1");
  const toStep3 = document.getElementById("toStep3");
  const backTo2 = document.getElementById("backTo2");
  const finishBtn = document.getElementById("finishBtn");
  const gotoLogin = document.getElementById("gotoLogin");

  // Inputs
  const profileInput = document.getElementById("profileImage");
  const previewImg = document.getElementById("previewImg");
  const previewWrap = document.getElementById("previewWrap");
  const confirmProfileImg = document.getElementById("confirmProfileImg");
  const confirmProfileWrap = document.getElementById("confirmProfileWrap");

  const fullName = document.getElementById("fullName");
  const empId = document.getElementById("empId");
  const dob = document.getElementById("dob");
  const officialAddress = document.getElementById("officialAddress");
  const personalAddress = document.getElementById("personalAddress");
  const qualifications = document.getElementById("qualifications");
  const emergencyContact = document.getElementById("emergencyContact");

  const hostelName = document.getElementById("hostelName");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");

  // Confirmation Display
  const cFullName = document.getElementById("cFullName");
  const cEmpId = document.getElementById("cEmpId");
  const cDob = document.getElementById("cDob");
  const cOfficialAddress = document.getElementById("cOfficialAddress");
  const cPersonalAddress = document.getElementById("cPersonalAddress");
  const cQualifications = document.getElementById("cQualifications");
  const cEmergencyContact = document.getElementById("cEmergencyContact");
  const cHostelName = document.getElementById("cHostelName");
  const cUsername = document.getElementById("cUsername");
  const statusEl = document.getElementById("status");

  /* ===============================
     Helper Functions
     =============================== */
  function showStep(n) {
    Object.keys(panels).forEach(k => {
      panels[k].classList.toggle("active", Number(k) === n);
    });
    stepNums.forEach(el => {
      el.classList.toggle("active", Number(el.dataset.step) === n);
    });
    window.scrollTo(0, 0);
  }

  function setStatus(txt, isError = false) {
    statusEl.textContent = txt || "";
    statusEl.style.color = isError ? "#e53e3e" : "#38a169";
  }

  /* ===============================
     Profile Image Logic
     =============================== */
  profileInput.addEventListener("change", () => {
    const file = profileInput.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size too large! Please choose an image under 2MB.");
      profileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let width = img.width;
        let height = img.height;
        const maxSize = 300;
        
        if (width > height) {
          if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
        } else {
          if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const base64String = canvas.toDataURL('image/jpeg', 0.8);
        
        previewImg.src = base64String;
        previewWrap.style.display = "block";
        
        const s1 = JSON.parse(sessionStorage.getItem("step1Data") || "{}");
        s1._profileBase64 = base64String;
        sessionStorage.setItem("step1Data", JSON.stringify(s1));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  /* ===============================
     Navigation & Storage
     =============================== */
  function loadSession() {
    const s1 = JSON.parse(sessionStorage.getItem("step1Data") || "null");
    const s2 = JSON.parse(sessionStorage.getItem("step2Data") || "null");

    if (s1) {
      fullName.value = s1.fullName || "";
      empId.value = s1.empId || "";
      dob.value = s1.dob || "";
      officialAddress.value = s1.officialAddress || "";
      personalAddress.value = s1.personalAddress || "";
      qualifications.value = s1.qualifications || "";
      emergencyContact.value = s1.emergencyContact || "";
      if (s1._profileBase64) {
        previewImg.src = s1._profileBase64;
        previewWrap.style.display = "block";
      }
    }
    if (s2) {
      username.value = s2.username || "";
      password.value = s2.password || "";
    }
  }
  loadSession();

  toStep2.addEventListener("click", () => {
    const s1 = {
      fullName: fullName.value.trim(),
      empId: empId.value.trim(),
      dob: dob.value,
      officialAddress: officialAddress.value.trim(),
      personalAddress: personalAddress.value.trim(),
      qualifications: qualifications.value.trim(),
      emergencyContact: emergencyContact.value.trim(),
      _profileBase64: (JSON.parse(sessionStorage.getItem("step1Data") || "{}"))._profileBase64
    };

    if (!s1.fullName || !s1.empId || !s1.officialAddress || !s1.personalAddress || !s1.qualifications || !s1.emergencyContact) {
      alert("Please fill all required fields marked with *");
      return;
    }
    sessionStorage.setItem("step1Data", JSON.stringify(s1));
    showStep(2);
  });

  backTo1.addEventListener("click", () => showStep(1));

  toStep3.addEventListener("click", () => {
    const s2 = {
      hostelName: hostelName.value.trim(),
      username: username.value.trim(),
      password: password.value
    };
    
    if (!s2.username || !s2.password) { alert(" Please provide a username and password"); return; }
    if (s2.password !== confirmPassword.value) { alert(" Passwords do not match!"); return; }
    if (s2.password.length < 6) { alert(" Password must be at least 6 characters long"); return; }

    sessionStorage.setItem("step2Data", JSON.stringify(s2));
    populateConfirm();
    showStep(3);
  });

  backTo2.addEventListener("click", () => showStep(2));

  function populateConfirm() {
    const s1 = JSON.parse(sessionStorage.getItem("step1Data") || "null");
    const s2 = JSON.parse(sessionStorage.getItem("step2Data") || "null");
    if (!s1 || !s2) return;

    cFullName.textContent = s1.fullName;
    cEmpId.textContent = s1.empId;
    cDob.textContent = s1.dob || "Not provided";
    cOfficialAddress.textContent = s1.officialAddress;
    cPersonalAddress.textContent = s1.personalAddress;
    cQualifications.textContent = s1.qualifications;
    cEmergencyContact.textContent = s1.emergencyContact;
    cHostelName.textContent = s2.hostelName;
    cUsername.textContent = s2.username;

    if (s1._profileBase64) {
      confirmProfileImg.src = s1._profileBase64;
      confirmProfileWrap.style.display = "block";
    } else {
      confirmProfileWrap.style.display = "none";
    }
  }

  /* ===============================
     FINAL SUBMIT (Corrected)
     =============================== */
  finishBtn.addEventListener("click", async () => {
    const s1 = JSON.parse(sessionStorage.getItem("step1Data") || "null");
    const s2 = JSON.parse(sessionStorage.getItem("step2Data") || "null");

    if (!s1 || !s2) {
      alert("Session expired. Please fill the form again.");
      showStep(1);
      return;
    }

    setStatus(" Creating account and saving data...");
    finishBtn.disabled = true;

    try {
      const auth = getAuth(); // Initialize Auth

      // [CRITICAL FIX] 1. Create User in Firebase Auth
      // Since your form has no email, we generate a fake one for Auth purposes.
      // Format: username@warden.system
      const generatedEmail = `${s2.username}@warden.system`.toLowerCase();

      console.log(`Creating auth user for: ${generatedEmail}`);
      const userCredential = await createUserWithEmailAndPassword(auth, generatedEmail, s2.password);
      const user = userCredential.user;

      // 2. Prepare Firestore Data
      // We do NOT save the password here anymore (security best practice)
      const payload = {
        uid: user.uid, // Link to Auth User
        email: generatedEmail, // Needed for login reference
        fullName: s1.fullName,
        empId: s1.empId,
        dob: s1.dob || null,
        officialAddress: s1.officialAddress,
        personalAddress: s1.personalAddress,
        qualifications: s1.qualifications,
        emergencyContact: s1.emergencyContact,
        hostelName: s2.hostelName,
        username: s2.username,
        role: "warden", // Useful for checking roles later
        profileImage: s1._profileBase64 || null,
        createdAt: serverTimestamp()
      };

      // 3. Save to Firestore
      const docRef = await addDoc(collection(db, "wardenAccounts"), payload);
      
      console.log("Registration Complete. ID:", docRef.id);
      
      // Success Message
      setStatus(" Success! Redirecting...");
      alert(`🎉 Registration successful!\n\nIMPORTANT for Login:\nUsername/Email: ${generatedEmail}\n(You can use this email to login)`);

      sessionStorage.clear();

      // [FIX] 4. Automatic Redirect (No Confirm Dialog)
      window.location.href = "login.html";

    } catch (err) {
      console.error(" Error:", err);
      // Handle "Email already in use" specifically
      if (err.code === 'auth/email-already-in-use') {
        alert(" This username is already taken. Please choose another.");
        showStep(2);
      } else {
        alert(" Error: " + err.message);
      }
      setStatus(" Registration failed.", true);
    } finally {
      finishBtn.disabled = false;
    }
  });

  gotoLogin.addEventListener("click", () => {
    window.location.href = "login.html";
  });
});