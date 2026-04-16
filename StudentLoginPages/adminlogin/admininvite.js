// admininvite.js

// Initialize EmailJS
(function() {
  emailjs.init("YOUR_PUBLIC_KEY"); // e.g. emailjs.init("d7h8xYzAbC12345");
})();

// Handle form submission
document.getElementById("inviteForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const role = document.getElementById("role").value;

  if (!name || !email || !role) {
    alert("Please fill in all fields.");
    return;
  }

  const params = {
    to_name: name,
    to_email: email,
    role: role,
    register_link: "https://yourwebsite.com/register.html"
  };

  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", params)
    .then(() => {
      alert(`Invitation sent successfully to ${name}`);
      document.getElementById("inviteForm").reset();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to send invitation. Please check console for details.");
    });
});
