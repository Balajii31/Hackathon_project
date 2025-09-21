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

// Student Registration
if (document.getElementById("signupForm")) {
  document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const submitBtn = document.getElementById("submitBtn")
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      showNotification("Passwords do not match!", "error")
      return
    }

    // Remove confirmPassword from data
    delete data.confirmPassword

    setLoading(submitBtn, true)

    try {
      const response = await fetch(scriptURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "registerStudent",
          ...data,
        }),
      })

      const result = await response.json()

      if (result.status === "success") {
        showNotification("Registration successful! Redirecting to login...", "success")
        setTimeout(() => {
          window.location.href = "login.html"
        }, 2000)
      } else {
        showNotification(result.message || "Registration failed!", "error")
      }
    } catch (error) {
      showNotification("Network error. Please try again.", "error")
    } finally {
      setLoading(submitBtn, false)
    }
  })
}

// Student Login
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const submitBtn = document.getElementById("submitBtn")
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
          action: "loginStudent",
          ...data,
        }),
      })

      const result = await response.json()

      if (result.status === "success") {
        // Store user session
        localStorage.setItem("studentSession", JSON.stringify(result.user))
        showNotification("Login successful! Redirecting...", "success")
        setTimeout(() => {
          window.location.href = "index.html"
        }, 1500)
      } else {
        showNotification(result.message || "Login failed!", "error")
      }
    } catch (error) {
      showNotification("Network error. Please try again.", "error")
    } finally {
      setLoading(submitBtn, false)
    }
  })
}

// Student Dashboard
if (document.getElementById("dashboard")) {
  let currentUser = null
  let userTeam = null

  // Check if user is logged in
  const session = localStorage.getItem("studentSession")
  if (!session) {
    window.location.href = "login.html"
  } else {
    currentUser = JSON.parse(session)
    document.getElementById("userName").textContent = currentUser.name
    document.getElementById("userRegister").textContent = currentUser.registerNo
    loadDashboardData()
  }

  // Logout functionality
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("studentSession")
    window.location.href = "login.html"
  })

  async function loadDashboardData() {
    try {
      const response = await fetch(scriptURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "getUserTeam",
          registerNo: currentUser.registerNo,
        }),
      })

      const result = await response.json()

      if (result.status === "success") {
        userTeam = result.team
        updateDashboardUI()
      }
    } catch (error) {
      showNotification("Error loading dashboard data", "error")
    }
  }

  function updateDashboardUI() {
    const teamSection = document.getElementById("teamSection")
    const createTeamSection = document.getElementById("createTeamSection")
    const joinTeamSection = document.getElementById("joinTeamSection")

    if (userTeam) {
      // User has a team
      teamSection.style.display = "block"
      createTeamSection.style.display = "none"
      joinTeamSection.style.display = "none"

      document.getElementById("teamName").textContent = userTeam.teamName
      document.getElementById("teamLeader").textContent = userTeam.leaderName

      const membersList = document.getElementById("membersList")
      membersList.innerHTML = ""
      userTeam.members.forEach((member) => {
        const li = document.createElement("li")
        li.textContent = `${member.name} (${member.registerNo})`
        membersList.appendChild(li)
      })

      // Show add member form only if user is team leader
      const addMemberSection = document.getElementById("addMemberSection")
      if (userTeam.leaderRegisterNo === currentUser.registerNo) {
        addMemberSection.style.display = "block"
      } else {
        addMemberSection.style.display = "none"
      }
    } else {
      // User doesn't have a team
      teamSection.style.display = "none"
      createTeamSection.style.display = "block"
      joinTeamSection.style.display = "block"
    }
  }

  // Create Team
  document.getElementById("createTeamForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const teamName = formData.get("teamName")

    try {
      const response = await fetch(scriptURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "createTeam",
          teamName: teamName,
          leaderRegisterNo: currentUser.registerNo,
        }),
      })

      const result = await response.json()

      if (result.status === "success") {
        showNotification("Team created successfully!", "success")
        loadDashboardData()
      } else {
        showNotification(result.message || "Failed to create team", "error")
      }
    } catch (error) {
      showNotification("Network error. Please try again.", "error")
    }
  })

  // Add Member
  document.getElementById("addMemberForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const memberRegisterNo = formData.get("memberRegisterNo")

    try {
      const response = await fetch(scriptURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "addMember",
          teamName: userTeam.teamName,
          memberRegisterNo: memberRegisterNo,
        }),
      })

      const result = await response.json()

      if (result.status === "success") {
        showNotification("Member added successfully!", "success")
        loadDashboardData()
        e.target.reset()
      } else {
        showNotification(result.message || "Failed to add member", "error")
      }
    } catch (error) {
      showNotification("Network error. Please try again.", "error")
    }
  })

  // Join Request
  document.getElementById("joinRequestForm").addEventListener("submit", async (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const requestedTeam = formData.get("requestedTeam")

    try {
      const response = await fetch(scriptURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "joinRequest",
          requestedTeam: requestedTeam,
          studentRegisterNo: currentUser.registerNo,
        }),
      })

      const result = await response.json()

      if (result.status === "success") {
        showNotification("Join request sent successfully!", "success")
        e.target.reset()
      } else {
        showNotification(result.message || "Failed to send join request", "error")
      }
    } catch (error) {
      showNotification("Network error. Please try again.", "error")
    }
  })
}
