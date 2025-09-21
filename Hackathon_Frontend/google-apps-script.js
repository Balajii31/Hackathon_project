// Google Apps Script Backend Code
// This code should be pasted into Google Apps Script editor

// Declare SpreadsheetApp and ContentService
const SpreadsheetApp = SpreadsheetApp
const ContentService = ContentService

// Admin credentials (change these for security)
const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "admin123"

// Get the active spreadsheet
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet()
}

// Get specific sheet by name
function getSheet(sheetName) {
  const ss = getSpreadsheet()
  let sheet = ss.getSheetByName(sheetName)

  if (!sheet) {
    sheet = ss.insertSheet(sheetName)

    // Add headers based on sheet type
    if (sheetName === "Users") {
      sheet
        .getRange(1, 1, 1, 8)
        .setValues([["Timestamp", "Name", "RegisterNo", "Department", "Email", "GitHub", "Experience", "Password"]])
    } else if (sheetName === "Teams") {
      sheet.getRange(1, 1, 1, 4).setValues([["Timestamp", "TeamName", "LeaderRegisterNo", "Members"]])
    } else if (sheetName === "Requests") {
      sheet.getRange(1, 1, 1, 4).setValues([["Timestamp", "RequestedTeam", "StudentRegisterNo", "Status"]])
    }
  }

  return sheet
}

// Main function to handle all POST requests
function doPost(e) {
  try {
    const action = e.parameter.action

    switch (action) {
      case "registerStudent":
        return registerStudent(e.parameter)
      case "loginStudent":
        return loginStudent(e.parameter)
      case "adminLogin":
        return adminLogin(e.parameter)
      case "createTeam":
        return createTeam(e.parameter)
      case "getUserTeam":
        return getUserTeam(e.parameter)
      case "addMember":
        return addMember(e.parameter)
      case "joinRequest":
        return joinRequest(e.parameter)
      case "getAllData":
        return getAllData()
      case "approveRequest":
        return approveRequest(e.parameter)
      case "rejectRequest":
        return rejectRequest(e.parameter)
      case "deleteTeam":
        return deleteTeam(e.parameter)
      case "removeStudent":
        return removeStudent(e.parameter)
      default:
        return ContentService.createTextOutput(
          JSON.stringify({ status: "error", message: "Invalid action" }),
        ).setMimeType(ContentService.MimeType.JSON)
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(
      ContentService.MimeType.JSON,
    )
  }
}

// Register a new student
function registerStudent(params) {
  const usersSheet = getSheet("Users")
  const data = usersSheet.getDataRange().getValues()

  // Check if register number already exists
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === params.registerNo) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Register number already exists" }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  // Check if email already exists
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === params.email) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Email already registered" }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  // Add new student
  usersSheet.appendRow([
    new Date(),
    params.name,
    params.registerNo,
    params.department,
    params.email,
    params.github,
    params.experience,
    params.password,
  ])

  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", message: "Registration successful" }),
  ).setMimeType(ContentService.MimeType.JSON)
}

// Student login
function loginStudent(params) {
  const usersSheet = getSheet("Users")
  const data = usersSheet.getDataRange().getValues()

  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === params.registerNo && data[i][7] === params.password) {
      const user = {
        name: data[i][1],
        registerNo: data[i][2],
        department: data[i][3],
        email: data[i][4],
        github: data[i][5],
        experience: data[i][6],
      }

      return ContentService.createTextOutput(
        JSON.stringify({ status: "success", message: "Login successful", user: user }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  return ContentService.createTextOutput(
    JSON.stringify({ status: "error", message: "Invalid credentials" }),
  ).setMimeType(ContentService.MimeType.JSON)
}

// Admin login
function adminLogin(params) {
  if (params.username === ADMIN_USERNAME && params.password === ADMIN_PASSWORD) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Admin login successful" }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  return ContentService.createTextOutput(
    JSON.stringify({ status: "error", message: "Invalid admin credentials" }),
  ).setMimeType(ContentService.MimeType.JSON)
}

// Create a new team
function createTeam(params) {
  const teamsSheet = getSheet("Teams")
  const data = teamsSheet.getDataRange().getValues()

  // Check if team name already exists
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === params.teamName) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Team name already exists" }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  // Check if user is already in a team
  for (let i = 1; i < data.length; i++) {
    const members = data[i][3].split(",")
    if (members.includes(params.leaderRegisterNo)) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "You are already in a team" }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  // Create team with leader as first member
  teamsSheet.appendRow([new Date(), params.teamName, params.leaderRegisterNo, params.leaderRegisterNo])

  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", message: "Team created successfully" }),
  ).setMimeType(ContentService.MimeType.JSON)
}

// Get user's team information
function getUserTeam(params) {
  const teamsSheet = getSheet("Teams")
  const usersSheet = getSheet("Users")
  const teamsData = teamsSheet.getDataRange().getValues()
  const usersData = usersSheet.getDataRange().getValues()

  // Find user's team
  for (let i = 1; i < teamsData.length; i++) {
    const members = teamsData[i][3].split(",")
    if (members.includes(params.registerNo)) {
      // Get member details
      const memberDetails = []
      for (const memberRegNo of members) {
        for (let j = 1; j < usersData.length; j++) {
          if (usersData[j][2] === memberRegNo) {
            memberDetails.push({
              name: usersData[j][1],
              registerNo: usersData[j][2],
            })
            break
          }
        }
      }

      // Get leader name
      let leaderName = ""
      for (let j = 1; j < usersData.length; j++) {
        if (usersData[j][2] === teamsData[i][2]) {
          leaderName = usersData[j][1]
          break
        }
      }

      const team = {
        teamName: teamsData[i][1],
        leaderRegisterNo: teamsData[i][2],
        leaderName: leaderName,
        members: memberDetails,
      }

      return ContentService.createTextOutput(JSON.stringify({ status: "success", team: team })).setMimeType(
        ContentService.MimeType.JSON,
      )
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "success", team: null })).setMimeType(
    ContentService.MimeType.JSON,
  )
}

// Add member to team
function addMember(params) {
  const teamsSheet = getSheet("Teams")
  const usersSheet = getSheet("Users")
  const teamsData = teamsSheet.getDataRange().getValues()
  const usersData = usersSheet.getDataRange().getValues()

  // Check if member exists
  let memberExists = false
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][2] === params.memberRegisterNo) {
      memberExists = true
      break
    }
  }

  if (!memberExists) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Student not found" }),
    ).setMimeType(ContentService.MimeType.JSON)
  }

  // Find team and update members
  for (let i = 1; i < teamsData.length; i++) {
    if (teamsData[i][1] === params.teamName) {
      const currentMembers = teamsData[i][3].split(",")

      // Check if member is already in team
      if (currentMembers.includes(params.memberRegisterNo)) {
        return ContentService.createTextOutput(
          JSON.stringify({ status: "error", message: "Student is already in this team" }),
        ).setMimeType(ContentService.MimeType.JSON)
      }

      // Check if member is in another team
      for (let j = 1; j < teamsData.length; j++) {
        if (j !== i) {
          const otherMembers = teamsData[j][3].split(",")
          if (otherMembers.includes(params.memberRegisterNo)) {
            return ContentService.createTextOutput(
              JSON.stringify({ status: "error", message: "Student is already in another team" }),
            ).setMimeType(ContentService.MimeType.JSON)
          }
        }
      }

      // Check team size limit
      if (currentMembers.length >= 6) {
        return ContentService.createTextOutput(
          JSON.stringify({ status: "error", message: "Team is full (maximum 6 members)" }),
        ).setMimeType(ContentService.MimeType.JSON)
      }

      // Add member
      currentMembers.push(params.memberRegisterNo)
      teamsSheet.getRange(i + 1, 4).setValue(currentMembers.join(","))

      return ContentService.createTextOutput(
        JSON.stringify({ status: "success", message: "Member added successfully" }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Team not found" })).setMimeType(
    ContentService.MimeType.JSON,
  )
}

// Submit join request
function joinRequest(params) {
  const requestsSheet = getSheet("Requests")
  const teamsSheet = getSheet("Teams")
  const requestsData = requestsSheet.getDataRange().getValues()
  const teamsData = teamsSheet.getDataRange().getValues()

  // Check if team exists
  let teamExists = false
  for (let i = 1; i < teamsData.length; i++) {
    if (teamsData[i][1] === params.requestedTeam) {
      teamExists = true
      break
    }
  }

  if (!teamExists) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Team not found" })).setMimeType(
      ContentService.MimeType.JSON,
    )
  }

  // Check if user is already in a team
  for (let i = 1; i < teamsData.length; i++) {
    const members = teamsData[i][3].split(",")
    if (members.includes(params.studentRegisterNo)) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "You are already in a team" }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  // Check if request already exists
  for (let i = 1; i < requestsData.length; i++) {
    if (requestsData[i][1] === params.requestedTeam && requestsData[i][2] === params.studentRegisterNo) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Request already sent to this team" }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  // Add request
  requestsSheet.appendRow([new Date(), params.requestedTeam, params.studentRegisterNo, "Pending"])

  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", message: "Join request sent successfully" }),
  ).setMimeType(ContentService.MimeType.JSON)
}

// Get all data for admin dashboard
function getAllData() {
  const usersSheet = getSheet("Users")
  const teamsSheet = getSheet("Teams")
  const requestsSheet = getSheet("Requests")

  const usersData = usersSheet.getDataRange().getValues()
  const teamsData = teamsSheet.getDataRange().getValues()
  const requestsData = requestsSheet.getDataRange().getValues()

  // Process students data
  const students = []
  for (let i = 1; i < usersData.length; i++) {
    students.push({
      timestamp: usersData[i][0],
      name: usersData[i][1],
      registerNo: usersData[i][2],
      department: usersData[i][3],
      email: usersData[i][4],
      github: usersData[i][5],
      experience: usersData[i][6],
    })
  }

  // Process teams data
  const teams = []
  for (let i = 1; i < teamsData.length; i++) {
    const memberRegNos = teamsData[i][3].split(",")
    const members = []

    // Get member details
    for (const regNo of memberRegNos) {
      for (let j = 1; j < usersData.length; j++) {
        if (usersData[j][2] === regNo) {
          members.push({
            name: usersData[j][1],
            registerNo: usersData[j][2],
          })
          break
        }
      }
    }

    // Get leader name
    let leaderName = ""
    for (let j = 1; j < usersData.length; j++) {
      if (usersData[j][2] === teamsData[i][2]) {
        leaderName = usersData[j][1]
        break
      }
    }

    teams.push({
      timestamp: teamsData[i][0],
      teamName: teamsData[i][1],
      leaderRegisterNo: teamsData[i][2],
      leaderName: leaderName,
      members: members,
    })
  }

  // Process requests data
  const requests = []
  for (let i = 1; i < requestsData.length; i++) {
    // Get student name
    let studentName = ""
    for (let j = 1; j < usersData.length; j++) {
      if (usersData[j][2] === requestsData[i][2]) {
        studentName = usersData[j][1]
        break
      }
    }

    requests.push({
      timestamp: requestsData[i][0],
      requestedTeam: requestsData[i][1],
      studentRegisterNo: requestsData[i][2],
      studentName: studentName,
      status: requestsData[i][3],
    })
  }

  return ContentService.createTextOutput(
    JSON.stringify({
      status: "success",
      data: {
        students: students,
        teams: teams,
        requests: requests,
      },
    }),
  ).setMimeType(ContentService.MimeType.JSON)
}

// Approve join request
function approveRequest(params) {
  const requestsSheet = getSheet("Requests")
  const teamsSheet = getSheet("Teams")
  const requestsData = requestsSheet.getDataRange().getValues()
  const teamsData = teamsSheet.getDataRange().getValues()

  // Find and update request
  for (let i = 1; i < requestsData.length; i++) {
    if (requestsData[i][1] === params.teamName && requestsData[i][2] === params.studentRegisterNo) {
      // Check if team has space
      for (let j = 1; j < teamsData.length; j++) {
        if (teamsData[j][1] === params.teamName) {
          const currentMembers = teamsData[j][3].split(",")

          if (currentMembers.length >= 6) {
            return ContentService.createTextOutput(
              JSON.stringify({ status: "error", message: "Team is full" }),
            ).setMimeType(ContentService.MimeType.JSON)
          }

          // Add member to team
          currentMembers.push(params.studentRegisterNo)
          teamsSheet.getRange(j + 1, 4).setValue(currentMembers.join(","))
          break
        }
      }

      // Update request status
      requestsSheet.getRange(i + 1, 4).setValue("Approved")

      return ContentService.createTextOutput(
        JSON.stringify({ status: "success", message: "Request approved and member added" }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Request not found" })).setMimeType(
    ContentService.MimeType.JSON,
  )
}

// Reject join request
function rejectRequest(params) {
  const requestsSheet = getSheet("Requests")
  const requestsData = requestsSheet.getDataRange().getValues()

  // Find and update request
  for (let i = 1; i < requestsData.length; i++) {
    if (requestsData[i][1] === params.teamName && requestsData[i][2] === params.studentRegisterNo) {
      requestsSheet.getRange(i + 1, 4).setValue("Rejected")

      return ContentService.createTextOutput(
        JSON.stringify({ status: "success", message: "Request rejected" }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Request not found" })).setMimeType(
    ContentService.MimeType.JSON,
  )
}

// Delete team
function deleteTeam(params) {
  const teamsSheet = getSheet("Teams")
  const requestsSheet = getSheet("Requests")
  const teamsData = teamsSheet.getDataRange().getValues()
  const requestsData = requestsSheet.getDataRange().getValues()

  // Find and delete team
  for (let i = 1; i < teamsData.length; i++) {
    if (teamsData[i][1] === params.teamName) {
      teamsSheet.deleteRow(i + 1)

      // Delete related requests
      for (let j = requestsData.length - 1; j >= 1; j--) {
        if (requestsData[j][1] === params.teamName) {
          requestsSheet.deleteRow(j + 1)
        }
      }

      return ContentService.createTextOutput(
        JSON.stringify({ status: "success", message: "Team deleted successfully" }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Team not found" })).setMimeType(
    ContentService.MimeType.JSON,
  )
}

// Remove student
function removeStudent(params) {
  const usersSheet = getSheet("Users")
  const teamsSheet = getSheet("Teams")
  const requestsSheet = getSheet("Requests")
  const usersData = usersSheet.getDataRange().getValues()
  const teamsData = teamsSheet.getDataRange().getValues()
  const requestsData = requestsSheet.getDataRange().getValues()

  // Find and delete student
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][2] === params.registerNo) {
      usersSheet.deleteRow(i + 1)

      // Remove from teams
      for (let j = 1; j < teamsData.length; j++) {
        const members = teamsData[j][3].split(",")
        const memberIndex = members.indexOf(params.registerNo)

        if (memberIndex > -1) {
          members.splice(memberIndex, 1)

          if (members.length === 0) {
            // Delete team if no members left
            teamsSheet.deleteRow(j + 1)
          } else {
            // Update members list
            teamsSheet.getRange(j + 1, 4).setValue(members.join(","))

            // If removed student was leader, make first member the new leader
            if (teamsData[j][2] === params.registerNo && members.length > 0) {
              teamsSheet.getRange(j + 1, 3).setValue(members[0])
            }
          }
          break
        }
      }

      // Delete related requests
      for (let j = requestsData.length - 1; j >= 1; j--) {
        if (requestsData[j][2] === params.registerNo) {
          requestsSheet.deleteRow(j + 1)
        }
      }

      return ContentService.createTextOutput(
        JSON.stringify({ status: "success", message: "Student removed successfully" }),
      ).setMimeType(ContentService.MimeType.JSON)
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Student not found" })).setMimeType(
    ContentService.MimeType.JSON,
  )
}
