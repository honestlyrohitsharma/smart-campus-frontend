// ===============================
// Global Variables
// ===============================
const API_URL = 'https://smart-campus-api-ttdc.onrender.com'; // The address of your backend; // Correct backend URL
let currentUserType = "student";
let authToken = null; // This will now store the JWT access token

// ===============================
// Initialize App
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  checkLoginStatus(); // Check if a token already exists from a previous session
});

// ===============================
// Core Initialization
// ===============================
function initializeApp() {
  document.querySelectorAll(".user-type-btn").forEach((btn) => {
    btn.addEventListener("click", () => selectUserType(btn.getAttribute("data-type")));
  });

  const studentIdInput = document.getElementById("studentId");
  if (studentIdInput) {
    studentIdInput.form.addEventListener("submit", (e) => {
        e.preventDefault();
        handleLogin();
    });
  }

  updateLoginButtonText();
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
}

// ===============================
// Check Login Status on Page Load
// ===============================
function checkLoginStatus() {
  const token = sessionStorage.getItem('authToken');
  if (token) {
    authToken = token;
    fetchDashboardData(); // If a token exists, try to fetch dashboard data
  }
}

// ===============================
// User Type Selection
// ===============================
function selectUserType(type) {
  currentUserType = type;
  document.querySelectorAll(".user-type-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-type") === type) btn.classList.add("active");
  });
  updateLoginButtonText();
}

function updateLoginButtonText() {
  const loginBtn = document.querySelector(".login-btn");
  if (loginBtn) {
    loginBtn.textContent = `Login as ${currentUserType === "student" ? "Student" : "Teacher"}`;
  }
}

// ===============================
// Login Logic
// ===============================
async function handleLogin() {
  const userId = document.getElementById("studentId").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!userId || !password) {
    showNotification("Please enter both ID and Password", "warning");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id_str: userId, password: password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showNotification(data.detail || "Invalid login credentials", "error");
      return;
    }

    authToken = data.access_token;
    sessionStorage.setItem('authToken', authToken); 

    showNotification("Login successful! Fetching your data...", "success");

    fetchDashboardData();

  } catch (error) {
    console.error("Login failed:", error);
    showNotification("Server error. Please try again later.", "error");
  }
}

// ===============================
// Fetch ALL Dashboard Data (UPDATED)
// ===============================
async function fetchDashboardData() {
    if (!authToken) {
        showLogin();
        return;
    }

    try {
        // We will fetch user profile and attendance data at the same time
        const [userRes, attendanceRes] = await Promise.all([
            fetch(`${API_URL}/api/students/me`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }),
            fetch(`${API_URL}/api/attendance/me`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
        ]);

        if (userRes.ok && attendanceRes.ok) {
            const userData = await userRes.json();
            const attendanceData = await attendanceRes.json();
            
            // Pass all data to the populate function
            populateDashboard(userData, attendanceData);
            showDashboard();
        } else {
            // If either fetch fails, the token is likely invalid
            const errorData = await userRes.json(); // Get error from the first failed response
            showNotification(errorData.detail || "Session expired. Please log in again.", "error");
            handleLogout();
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showNotification("Could not load dashboard data. Server may be offline.", "error");
    }
}


// ===============================
// Populate Dashboard with Dynamic Data (UPDATED)
// ===============================
function populateDashboard(userData, attendanceData) {
    // Populate user info
    document.getElementById('welcomeUser').textContent = `Welcome, ${userData.name}`;
    document.getElementById('userRole').textContent = `${userData.student_id_str} - Student`;

    // --- NEW: Populate Attendance Card ---
    const attendanceCard = document.querySelector('.dashboard-card.purple .card-status');
    if (attendanceCard) {
        const totalClasses = 50; // Assume a total number of classes for percentage calculation
        const presentCount = attendanceData.length;
        const percentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;
        
        attendanceCard.textContent = `Current attendance: ${percentage}% (${presentCount} / ${totalClasses} classes)`;
    }
    // ------------------------------------
}

// ===============================
// Logout
// ===============================
function handleLogout() {
  document.getElementById("studentId").value = "";
  document.getElementById("password").value = "";
  selectUserType("student");

  authToken = null;
  sessionStorage.removeItem('authToken');

  showLogin();
  showNotification("Logged out successfully!", "info");
}

// ===============================
// Page Switching
// ===============================
function showDashboard() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("dashboardPage").style.display = "block";
  initializeDashboardHandlers();
}

function showLogin() {
  document.getElementById("loginPage").style.display = "flex";
  document.getElementById("dashboardPage").style.display = "none";
}

// ===============================
// Date & Time
// ===============================
function updateCurrentTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
  const currentDateEl = document.getElementById("currentDate");
  const currentTimeEl = document.getElementById("currentTime");
  if (currentDateEl) currentDateEl.textContent = dateStr;
  if (currentTimeEl) currentTimeEl.textContent = timeStr;
}

// ===============================
// Notifications
// ===============================
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  const existingNotifications = document.querySelectorAll('.notification').length;
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  const baseStyles = {
    position: 'fixed', top: `${20 + (existingNotifications * 70)}px`, right: '20px',
    padding: '15px 25px', borderRadius: '8px', color: 'white', fontWeight: '500',
    zIndex: '9999', transform: 'translateX(120%)', 
    transition: 'transform 0.4s ease-in-out, opacity 0.4s ease-in-out',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', opacity: '0'
  };
  const typeStyles = {
      success: { backgroundColor: '#10b981' }, error: { backgroundColor: '#ef4444' },
      warning: {backgroundColor: '#f97316'}, info: { backgroundColor: '#3b82f6' }
  };
  Object.assign(notification.style, baseStyles, typeStyles[type]);
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
    notification.style.opacity = '1';
  }, 100);

  setTimeout(() => {
    notification.style.transform = "translateX(120%)";
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 400);
  }, 4000);
}

// ===============================
// Dashboard Card Interactions
// ===============================
function initializeDashboardHandlers() {
  document.querySelectorAll(".dashboard-card, .event-item, .hero-btn").forEach((card) => {
    if (card.dataset.listenerAttached) return;
    card.dataset.listenerAttached = true;
    
    card.addEventListener("click", () => {
      const cardTitle = card.querySelector("h3, h4")?.textContent || card.textContent;
      showNotification(`Opening ${cardTitle.trim()}...`, "info");
    });
  });
}

