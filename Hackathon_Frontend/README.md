# Hackathon Team Registration System

A complete web-based hackathon registration and team management system with Google Sheets as the backend database.

## Features

### Student Features
- **Registration**: Students can register with personal details, GitHub profile, and experience level
- **Login System**: Secure login with register number and password
- **Team Creation**: Students can create teams (max 6 members per team)
- **Team Management**: Team leaders can add members directly
- **Join Requests**: Students can request to join existing teams
- **Dashboard**: View team information and manage team activities

### Admin Features
- **Admin Dashboard**: Comprehensive management interface
- **Student Management**: View all registered students and remove if needed
- **Team Management**: View all teams with member details and delete teams
- **Request Management**: Approve or reject join requests
- **Real-time Data**: All data syncs with Google Sheets in real-time

## Project Structure

\`\`\`
hackathon-registration/
├── signup.html              # Student registration page
├── login.html               # Student login page
├── index.html               # Student dashboard
├── admin.html               # Admin dashboard
├── style.css                # Shared styles for all pages
├── script.js                # Frontend JavaScript for students
├── admin.js                 # Frontend JavaScript for admin
├── google-apps-script.js    # Backend code for Google Apps Script
└── README.md                # This documentation
\`\`\`

## Setup Instructions

### Step 1: Google Sheets Setup

1. **Create a new Google Spreadsheet**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new blank spreadsheet
   - Name it "Hackathon Registration Database"

2. **Create the required sheets**
   - Create three sheets with these exact names:
     - `Users`
     - `Teams` 
     - `Requests`

3. **Add headers to each sheet**

   **Users Sheet (Sheet 1):**
   \`\`\`
   A1: Timestamp    B1: Name    C1: RegisterNo    D1: Department    
   E1: Email        F1: GitHub  G1: Experience    H1: Password
   \`\`\`

   **Teams Sheet (Sheet 2):**
   \`\`\`
   A1: Timestamp    B1: TeamName    C1: LeaderRegisterNo    D1: Members
   \`\`\`

   **Requests Sheet (Sheet 3):**
   \`\`\`
   A1: Timestamp    B1: RequestedTeam    C1: StudentRegisterNo    D1: Status
   \`\`\`

### Step 2: Google Apps Script Setup

1. **Open Apps Script**
   - In your Google Sheet, go to `Extensions` → `Apps Script`
   - Delete any existing code in the editor

2. **Add the backend code**
   - Copy the entire content from `google-apps-script.js`
   - Paste it into the Apps Script editor
   - Save the project (Ctrl+S or Cmd+S)

3. **Deploy as Web App**
   - Click `Deploy` → `New deployment`
   - Choose type: `Web app`
   - Description: "Hackathon Registration API"
   - Execute as: `Me`
   - Who has access: `Anyone`
   - Click `Deploy`
   - **Copy the Web App URL** - you'll need this for the frontend

4. **Grant permissions**
   - Click `Authorize access`
   - Choose your Google account
   - Click `Advanced` → `Go to [project name] (unsafe)`
   - Click `Allow`

### Step 3: Frontend Setup

1. **Update API URLs**
   - Open `script.js`
   - Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your Web App URL
   - Open `admin.js`
   - Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your Web App URL

2. **Customize admin credentials (optional)**
   - In `google-apps-script.js`, find these lines:
   \`\`\`javascript
   const ADMIN_USERNAME = "admin"
   const ADMIN_PASSWORD = "admin123"
   \`\`\`
   - Change to your preferred admin credentials
   - Save and redeploy the Apps Script

### Step 4: Hosting

Choose one of these hosting options:

#### Option A: GitHub Pages (Recommended)
1. Create a new GitHub repository
2. Upload all files to the repository
3. Go to repository Settings → Pages
4. Select source: Deploy from a branch
5. Choose branch: main
6. Your site will be available at: `https://yourusername.github.io/repository-name`

#### Option B: Netlify
1. Go to [Netlify](https://netlify.com)
2. Drag and drop your project folder
3. Your site will be deployed automatically

#### Option C: Vercel
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository or upload files
3. Deploy with default settings

## Usage Guide

### For Students

1. **Registration**
   - Visit `signup.html`
   - Fill in all required details
   - Click "Register Now"

2. **Login**
   - Visit `login.html`
   - Enter your register number and password
   - Click "Login"

3. **Team Management**
   - **Create Team**: Enter team name and click "Create Team"
   - **Add Members**: Enter member's register number (only team leaders can do this)
   - **Join Team**: Enter team name you want to join and send request

### For Admins

1. **Admin Login**
   - Visit `admin.html`
   - Enter admin credentials (default: admin/admin123)
   - Click "Login"

2. **Dashboard Navigation**
   - **Students Tab**: View all registered students
   - **Teams Tab**: View all teams with member details
   - **Requests Tab**: Manage join requests

3. **Admin Actions**
   - **Approve/Reject Requests**: Click respective buttons in Requests tab
   - **Delete Team**: Click "Delete Team" button in Teams tab
   - **Remove Student**: Click "Remove" button in Students tab

## Database Schema

### Users Table
- `Timestamp`: Registration date and time
- `Name`: Student's full name
- `RegisterNo`: Unique student register number
- `Department`: Student's department
- `Email`: Student's email address
- `GitHub`: GitHub profile URL
- `Experience`: Experience level (Beginner/Intermediate/Advanced)
- `Password`: Encrypted password

### Teams Table
- `Timestamp`: Team creation date and time
- `TeamName`: Unique team name
- `LeaderRegisterNo`: Register number of team leader
- `Members`: Comma-separated list of member register numbers

### Requests Table
- `Timestamp`: Request submission date and time
- `RequestedTeam`: Name of team student wants to join
- `StudentRegisterNo`: Register number of requesting student
- `Status`: Request status (Pending/Approved/Rejected)

## Team Rules

- Maximum 6 members per team
- Each student can only be in one team
- Team leaders can add members directly
- Students can request to join teams
- Only team leaders and admins can approve requests
- Admin can delete teams and remove students

## Security Features

- Password-based authentication for students
- Separate admin authentication
- Input validation and sanitization
- Duplicate registration prevention
- Team size limits enforcement

## Troubleshooting

### Common Issues

1. **"Network error" messages**
   - Check if the Google Apps Script URL is correctly set
   - Ensure the Apps Script is deployed as a web app
   - Verify the spreadsheet permissions

2. **Data not saving**
   - Check if the sheet names are exactly: Users, Teams, Requests
   - Ensure headers are in the correct columns
   - Verify Apps Script permissions

3. **Admin login not working**
   - Check admin credentials in google-apps-script.js
   - Ensure the script is saved and redeployed

4. **Students can't register**
   - Check for duplicate register numbers or emails
   - Verify all required fields are filled
   - Check browser console for errors

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify all setup steps were completed correctly
3. Test the Google Apps Script directly in the Apps Script editor
4. Ensure all file names and sheet names match exactly

## Customization

### Adding New Fields
1. Add columns to the appropriate Google Sheet
2. Update the headers in `google-apps-script.js`
3. Modify the HTML forms to include new fields
4. Update the JavaScript to handle new data

### Styling Changes
- Modify `style.css` to change colors, fonts, and layout
- The design uses CSS Grid and Flexbox for responsive layouts
- Color scheme can be easily changed by updating CSS variables

### Feature Extensions
- Add email notifications using Google Apps Script's MailApp
- Implement file upload for team documents
- Add team categories or tracks
- Create reporting and analytics features

## License

This project is open source and available under the MIT License.

## Support

For technical support or questions about setup, please check the troubleshooting section above or review the code comments for detailed explanations.
#   H a c k a t h o n _ p r o j e c t  
 