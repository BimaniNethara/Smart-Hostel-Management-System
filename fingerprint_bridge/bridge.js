const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

const { initializeApp } = require("firebase/app")
const { getFirestore, doc, setDoc, onSnapshot, updateDoc } = require("firebase/firestore")

// ===============================
// FIREBASE CONFIG
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyBaCswlWTMSxi543o1v87g36RafGxd3eSM",
  authDomain: "smart-hostel-management-d55fd.firebaseapp.com",
  projectId: "smart-hostel-management-d55fd",
  storageBucket: "smart-hostel-management-d55fd.firebasestorage.app",
  messagingSenderId: "240337905227",
  appId: "1:240337905227:web:c4bae229f77bdacd380fce"
}

// ===============================
// INIT FIREBASE
// ===============================

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)


// ===============================
// SERIAL PORT
// ===============================

const port = new SerialPort({
  path: 'COM6',
  baudRate: 115200
})

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

console.log("Fingerprint bridge started...")
console.log("Waiting for fingerprint scan...")


// ===============================
// VARIABLES
// ===============================

let currentStudentId = null
let currentSlot = null


// ===============================
// LISTEN SERIAL FROM ESP
// ===============================

parser.on('data', async (data) => {

  console.log("Serial:", data)


  // ===============================
  // NORMAL FINGERPRINT SCAN
  // ===============================

  if(data.startsWith("ID:")){

    const id = data.replace("ID:","").trim()

    console.log("Fingerprint detected:", id)

    try {

      await setDoc(doc(db, "system_state", "latest_scan"), {
        biometric_id: String(id),
        timestamp: new Date()
      })

      console.log("Firestore updated successfully")

    } catch (err) {

      console.log("Firestore error:", err)

    }

  }


  // ===============================
  // ENROLL SUCCESS
  // ===============================

  if(data.startsWith("ENROLL_OK:")){

    const slot = data.replace("ENROLL_OK:","").trim()

    console.log("Enrollment success slot:", slot)

    try{

      if(currentStudentId){

        await updateDoc(doc(db,"students",currentStudentId),{

          Biometric_id: slot

        })

        console.log("Student updated with fingerprint")

      }

    }catch(err){

      console.log("Student update error:",err)

    }

  }

})


// ===============================
// LISTEN FIRESTORE ENROLL COMMAND
// ===============================

const enrollRef = doc(db, "enrollCommand", "command")

onSnapshot(enrollRef, (snapshot) => {

  if (!snapshot.exists()) return

  const data = snapshot.data()

  if(data.action === "ENROLL"){

    const studentId = data.studentId

    currentStudentId = studentId

    console.log("Enroll command received for:", studentId)

    // assign fingerprint slot
    currentSlot = Math.floor(Math.random() * 100) + 1

    console.log("Assigned fingerprint slot:", currentSlot)

    // send command to ESP
    port.write(`ENROLL:${currentSlot}\n`)

  }

})