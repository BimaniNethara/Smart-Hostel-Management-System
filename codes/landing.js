import "./firebase.js";
console.log("Firebase ready on fingerprint page");

//get started button

document.getElementById("getStartedBtn").addEventListener("click",function(){
    window.location.href="login.html";
});

//fingerprint button

document.getElementById("fingerprintBtn").addEventListener("click",function(){
    window.location.href="fingerprintscan.html";


});