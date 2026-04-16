// ===== REPORTS PAGE SCRIPT =====

// Highlight active sidebar link
document.querySelectorAll(".menu li a").forEach(link => {
  if (link.href === window.location.href) {
    link.parentElement.classList.add("active");
  }
});

// Generate Report Buttons
const reportButtons = document.querySelectorAll(".btn-generate");

reportButtons.forEach(button => {
  button.addEventListener("click", () => {
    const reportName = button.parentElement.querySelector("h3").innerText;
    alert(`Generating ${reportName}...`);
  });
});
