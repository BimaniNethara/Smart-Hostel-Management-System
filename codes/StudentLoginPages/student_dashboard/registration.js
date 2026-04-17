// studentRegistration.js
import { auth, db } from "../firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const studentForm = document.getElementById("studentForm");
const profilePicInput = document.getElementById("profilePic");
const profilePreview = document.getElementById("profilePreview");
const previewWrap = document.getElementById("previewWrap");

const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");
const steps = document.querySelectorAll(".step");
const formSteps = document.querySelectorAll(".form-step");

const regDateInput = document.getElementById("reg_date");
const expDateInput = document.getElementById("exp_date");

let currentStep = 0;

// IMAGE PREVIEW & COMPRESSION
profilePicInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert("Image must be under 2MB");
        profilePicInput.value = "";
        return;
    }

    profilePreview.src = URL.createObjectURL(file);
    previewWrap.style.display = "block";
});

const compressImage = (file) => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = e => {
            const img = new Image();
            img.src = e.target.result;

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                let width = img.width;
                let height = img.height;
                const MAX = 300;

                if (width > height) {
                    if (width > MAX) { height = height * (MAX / width); width = MAX; }
                } else {
                    if (height > MAX) { width = width * (MAX / height); height = MAX; }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
        };
    });
};

// STEP NAVIGATION
nextBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentStep >= formSteps.length - 1) return;

        formSteps[currentStep].classList.remove("active");
        steps[currentStep].classList.remove("active");

        currentStep++;
        formSteps[currentStep].classList.add("active");
        steps[currentStep].classList.add("active");

        if (currentStep === formSteps.length - 1) {
            const today = new Date();
            regDateInput.value = today.toISOString().split("T")[0];

            const exp = new Date(today);
            exp.setFullYear(exp.getFullYear() + 1);
            expDateInput.value = exp.toISOString().split("T")[0];
        }
    });
});

prevBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentStep <= 0) return;

        formSteps[currentStep].classList.remove("active");
        steps[currentStep].classList.remove("active");

        currentStep--;
        formSteps[currentStep].classList.add("active");
        steps[currentStep].classList.add("active");
    });
});

/////////////////////////
// FORM SUBMIT
/////////////////////////
studentForm.addEventListener("submit", async e => {
    e.preventDefault();

    try {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        const fname = document.getElementById("fname");
        const lname = document.getElementById("lname");
        const SID = document.getElementById("SID");   // ADD THIS

        const dob = document.getElementById("dob");
        const contact = document.getElementById("contact");
        const emergency = document.getElementById("emergency");
        const address = document.getElementById("address");
        const gender = document.getElementById("gender");
        const faculty = document.getElementById("faculty");
        const department = document.getElementById("department");
        const academic_year = document.getElementById("academic_year");
        const hostel_name = document.getElementById("hostel_name");
        //const floor = document.getElementById("floor");

        const imageFile = profilePicInput.files[0];
        let imgBase64 = "";
        if (imageFile) imgBase64 = await compressImage(imageFile);

        // CREATE AUTH USER
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const user = cred.user;

        // SAVE DATA TO FIRESTORE
        const studentData = {
            uid: user.uid,
            firstName: fname.value.trim(),
            lastName: lname.value.trim(),
            studentId: SID.value.trim(),   // ADD THIS
            room:null,//room

            dob: dob.value,
            email,
            contact: contact.value.trim(),
            emergency: emergency.value.trim(),
            address: address.value.trim(),
            gender: gender.value,
            faculty: faculty.value,
            department: department.value,
            academicYear: academic_year.value,
           hostelName: hostel_name.value,
            //floor: floor.value,
            registrationDate: new Date(regDateInput.value).toLocaleDateString("en-GB"),
            registrationTime: "10:00 AM",
            expiryDate: expDateInput.value,
            profileImage: imgBase64 || null,
            role: "student",
            createdAt: serverTimestamp()
        };

        //change
        const sidValue = SID.value.trim().replace(/\//g, "_");

await setDoc(doc(db, "students", sidValue), studentData);
        //await setDoc(doc(db, "students", SID.value.trim()), studentData);

        

        // SEND EMAIL (only relevant fields, no image)
        await window.emailjs.send("service_axlc275", "template_y66qv9c", {
            StudentName: studentData.firstName + " " + studentData.lastName,
            StudentID: studentData.uid,
            StudentEmail: studentData.email,
            HostelName: studentData.hostelName,
            //Floor: studentData.floor,
            RegistrationDate: "10/04/2026",
            RegistrationTime: studentData.registrationTime,
            ExpiryDate: studentData.expiryDate
        });

        alert("Registration successful! Confirmation email sent.");
        window.location.href = "login.html";

    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});