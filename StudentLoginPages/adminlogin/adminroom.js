// ===== ROOM MANAGEMENT DASHBOARD SCRIPT =====

// ✅ Highlight the active menu item automatically
document.querySelectorAll(".menu li a").forEach(link => {
  if (link.href === window.location.href) {
    link.parentElement.classList.add("active");
  }
});

// ===== Room Data (example static data) =====
const rooms = [
  { name: "Room 101", type: "Single", occupancy: "1/1", status: "Occupied", block: "Block A" },
  { name: "Room 102", type: "Double", occupancy: "2/2", status: "Occupied", block: "Block A" },
  { name: "Room 103", type: "Double", occupancy: "1/2", status: "Partially Occupied", block: "Block B" },
  { name: "Room 104", type: "Double", occupancy: "1/2", status: "Occupied", block: "Block B" },
  { name: "Room 105", type: "Single", occupancy: "0/1", status: "Available", block: "Block A" }
];

// ===== DOM References =====
const tbody = document.querySelector(".table-room tbody");
const blockSelect = document.querySelector(".filter-bar select:nth-child(1)");
const statusSelect = document.querySelector(".filter-bar select:nth-child(2)");
const typeSelect = document.querySelector(".filter-bar select:nth-child(3)");
const searchInput = document.querySelector(".filter-bar input[type='search']");

// ===== Helper: Render Table =====
function renderTable(filteredRooms) {
  tbody.innerHTML = ""; // clear
  filteredRooms.forEach(room => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${room.name}</td>
      <td>${room.type}</td>
      <td>${room.occupancy}</td>
      <td><span class="status ${room.status === "Partially Occupied" ? "partial" : (room.status === "Available" ? "available" : "occupied")}">${room.status}</span></td>
      <td>
        <div class="actions">
          <i class="fas fa-eye" title="View"></i>
          <i class="fas fa-edit" title="Edit"></i>
          <i class="fas fa-trash" title="Delete"></i>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== Filtering Logic =====
function applyFilters() {
  const blockValue = blockSelect.value;
  const statusValue = statusSelect.value;
  const typeValue = typeSelect.value;
  const searchText = searchInput.value.toLowerCase();

  const filtered = rooms.filter(room => {
    const matchBlock = blockValue === "All Block" || room.block === blockValue;
    const matchStatus = statusValue === "All Status" || room.status === statusValue;
    const matchType = typeValue === "All Type" || room.type === typeValue;
    const matchSearch = room.name.toLowerCase().includes(searchText);
    return matchBlock && matchStatus && matchType && matchSearch;
  });

  renderTable(filtered);
}

// ===== Event Listeners =====
[blockSelect, statusSelect, typeSelect].forEach(select => {
  select.addEventListener("change", applyFilters);
});

searchInput.addEventListener("input", applyFilters);

// ===== Initial Render =====
renderTable(rooms);

// ===== Optional: Action Buttons =====
tbody.addEventListener("click", e => {
  if (e.target.classList.contains("fa-eye")) {
    alert("View details for this room");
  } else if (e.target.classList.contains("fa-edit")) {
    alert("Edit this room information");
  } else if (e.target.classList.contains("fa-trash")) {
    const confirmDel = confirm("Are you sure you want to delete this room?");
    if (confirmDel) alert("Room deleted (demo only)");
  }
});
