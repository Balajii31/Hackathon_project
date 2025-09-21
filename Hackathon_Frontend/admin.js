// Replace this with your Google Apps Script Web App URL
const scriptURL = "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"

// Utility functions
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification")
  notification.textContent = message
  notification.className = `notification ${type} show`

  setTimeout(() => {
    notification.classList.remove("show")
  }, 4000)
}

function setLoading(button, isLoading) {
  const btnText = button.querySelector(".btn-text")
  const btnLoading = button.querySelector(".btn-loading")

  if (isLoading) {
    btnText.style.display = "none"
    btnLoading.style.display = "inline"
    button.disabled = true
  } else {
    btnText.style.display = "inline"
    btnLoading.style.display = "none"
    button.disabled = false
  }
}

// Admin Login
document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const submitBtn = document.getElementById("adminSubmitBtn")
  const formData = new FormData(e.target)
  const data = Object.fromEntries(formData)

  setLoading(submitBtn, true)

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "adminLogin",
        ...data,
      }),
    })

    const result = await response.json()

    if (result.status === "success") {
      // Store admin session
      localStorage.setItem("adminSession", "true")
      showNotification("Login successful!", "success")

      // Hide login form and show dashboard
      document.getElementById("adminLoginContainer").style.display = "none"
      document.getElementById("adminDashboard").style.display = "block"

      // Load dashboard data
      loadAllData()
    } else {
      showNotification(result.message || "Login failed!", "error")
    }
  } catch (error) {
    showNotification("Network error. Please try again.", "error")
  } finally {
    setLoading(submitBtn, false)
  }
})

// Check if admin is already logged in
window.addEventListener("load", () => {
  const adminSession = localStorage.getItem("adminSession")
  if (adminSession) {
    document.getElementById("adminLoginContainer").style.display = "none"
    document.getElementById("adminDashboard").style.display = "block"
    loadAllData()
  }
})

// Admin Logout
document.getElementById("adminLogoutBtn").addEventListener("click", () => {
  localStorage.removeItem("adminSession")
  document.getElementById("adminLoginContainer").style.display = "block"
  document.getElementById("adminDashboard").style.display = "none"
})

// Tab functionality
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    // Remove active class from all tabs and contents
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"))

    // Add active class to clicked tab and corresponding content
    btn.classList.add("active")
    document.getElementById(`${btn.dataset.tab}-tab`).classList.add("active")
  })
})

// Load all data
async function loadAllData() {
  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "getAllData",
      }),
    })

    const result = await response.json()

    if (result.status === "success") {
      populateStudentsTable(result.data.students)
      populateTeamsTable(result.data.teams)
      populateRequestsTable(result.data.requests)
    } else {
      showNotification("Failed to load data", "error")
    }
  } catch (error) {
    showNotification("Error loading data", "error")
  }
}

// Populate Students Table
function populateStudentsTable(students) {
  const tbody = document.getElementById("studentsTableBody")
  const count = document.getElementById("studentsCount")

  count.textContent = `(${students.length} students)`

  if (students.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" style="text-align: center; padding: 40px;">No students registered yet</td></tr>'
    return
  }

  tbody.innerHTML = students
    .map(
      (student) => `
    <tr>
      <td>${student.name}</td>
      <td>${student.registerNo}</td>
      <td>${student.department}</td>
      <td>${student.email}</td>
      <td><a href="${student.github}" target="_blank" style="color: #667eea;">View Profile</a></td>
      <td>${student.experience}</td>
      <td>
        <button class="action-btn delete-btn" onclick="removeStudent('${student.registerNo}')">
          Remove
        </button>
      </td>
    </tr>
  `,
    )
    .join("")
}

// Populate Teams Table
function populateTeamsTable(teams) {
  const tbody = document.getElementById("teamsTableBody")
  const count = document.getElementById("teamsCount")

  count.textContent = `(${teams.length} teams)`

  if (teams.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No teams created yet</td></tr>'
    return
  }

  tbody.innerHTML = teams
    .map(
      (team) => `
    <tr>
      <td><strong>${team.teamName}</strong></td>
      <td>${team.leaderName} (${team.leaderRegisterNo})</td>
      <td>
        <div style="max-width: 200px; overflow: hidden;">
          ${team.members.map((member) => `${member.name} (${member.registerNo})`).join(", ")}
        </div>
      </td>
      <td>${team.members.length}/6</td>
      <td>${new Date(team.timestamp).toLocaleDateString()}</td>
      <td>
        <button class="action-btn delete-btn" onclick="deleteTeam('${team.teamName}')">
          Delete Team
        </button>
      </td>
    </tr>
  `,
    )
    .join("")
}

// Populate Requests Table
function populateRequestsTable(requests) {
  const tbody = document.getElementById("requestsTableBody")
  const count = document.getElementById("requestsCount")

  count.textContent = `(${requests.length} requests)`

  if (requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No join requests yet</td></tr>'
    return
  }

  tbody.innerHTML = requests
    .map(
      (request) => `
    <tr>
      <td>${request.studentName}</td>
      <td>${request.studentRegisterNo}</td>
      <td>${request.requestedTeam}</td>
      <td>
        <span class="status-${request.status.toLowerCase()}">${request.status}</span>
      </td>
      <td>${new Date(request.timestamp).toLocaleDateString()}</td>
      <td>
        ${
          request.status === "Pending"
            ? `
          <button class="action-btn approve-btn" onclick="approveRequest('${request.studentRegisterNo}', '${request.requestedTeam}')">
            Approve
          </button>
          <button class="action-btn reject-btn" onclick="rejectRequest('${request.studentRegisterNo}', '${request.requestedTeam}')">
            Reject
          </button>
        `
            : "No actions available"
        }
      </td>
    </tr>
  `,
    )
    .join("")
}

// Admin Actions
async function removeStudent(registerNo) {
  if (!confirm(`Are you sure you want to remove student ${registerNo}?`)) {
    return
  }

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "removeStudent",
        registerNo: registerNo,
      }),
    })

    const result = await response.json()

    if (result.status === "success") {
      showNotification("Student removed successfully", "success")
      loadAllData()
    } else {
      showNotification(result.message || "Failed to remove student", "error")
    }
  } catch (error) {
    showNotification("Network error", "error")
  }
}

async function deleteTeam(teamName) {
  if (!confirm(`Are you sure you want to delete team "${teamName}"?`)) {
    return
  }

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "deleteTeam",
        teamName: teamName,
      }),
    })

    const result = await response.json()

    if (result.status === "success") {
      showNotification("Team deleted successfully", "success")
      loadAllData()
    } else {
      showNotification(result.message || "Failed to delete team", "error")
    }
  } catch (error) {
    showNotification("Network error", "error")
  }
}

async function approveRequest(studentRegisterNo, teamName) {
  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "approveRequest",
        studentRegisterNo: studentRegisterNo,
        teamName: teamName,
      }),
    })

    const result = await response.json()

    if (result.status === "success") {
      showNotification("Request approved successfully", "success")
      loadAllData()
    } else {
      showNotification(result.message || "Failed to approve request", "error")
    }
  } catch (error) {
    showNotification("Network error", "error")
  }
}

async function rejectRequest(studentRegisterNo, teamName) {
  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "rejectRequest",
        studentRegisterNo: studentRegisterNo,
        teamName: teamName,
      }),
    })

    const result = await response.json()

    if (result.status === "success") {
      showNotification("Request rejected", "success")
      loadAllData()
    } else {
      showNotification(result.message || "Failed to reject request", "error")
    }
  } catch (error) {
    showNotification("Network error", "error")
  }
}
