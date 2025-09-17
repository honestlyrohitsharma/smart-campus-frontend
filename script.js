// ===============================
// Global Variables
// ===============================
// This URL MUST point to your live Render backend
const API_URL = 'https://smart-campus-api-11dr.onrender.com';
let authToken = null;

// ===============================
// App Initialization
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  checkLoginStatus();
});

function initializeApp() {
  // --- Event Listeners ---
  document.querySelector(".login-form")?.addEventListener("submit", e => { e.preventDefault(); handleLogin(); });
  document.querySelectorAll(".sub-nav .nav-item").forEach(link => link.addEventListener("click", handleNavigation));
  document.querySelector(".attendance-card-link")?.addEventListener("click", () => navigateTo('attendanceView'));
  document.querySelector(".logout-btn")?.addEventListener("click", handleLogout);

  // --- Initial UI Setup ---
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
}

// ===============================
// Navigation Logic
// ===============================
function handleNavigation(event) {
    event.preventDefault();
    const viewId = event.target.getAttribute('href').substring(1);
    navigateTo(viewId);
}

function navigateTo(viewId) {
    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    }
    document.querySelectorAll('.sub-nav .nav-item').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${viewId}`) {
            link.classList.add('active');
        }
    });
}

// ===============================
// Authentication & Session
// ===============================
function checkLoginStatus() {
  authToken = sessionStorage.getItem('authToken');
  if (authToken) {
    fetchDashboardData();
  }
}

async function handleLogin() {
  const studentId = document.getElementById("studentId").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!studentId || !password) return showNotification("Please enter both ID and Password.", "error");

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id_str: studentId, password: password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Invalid credentials");

    authToken = data.access_token;
    sessionStorage.setItem('authToken', authToken);
    showNotification("Login successful!", "success");
    fetchDashboardData();
  } catch (error) {
    showNotification(error.message, "error");
  }
}

function handleLogout() {
  sessionStorage.removeItem('authToken');
  authToken = null;
  showLogin();
  showNotification("Logged out successfully.", "info");
}

// ===============================
// Data Fetching & Rendering
// ===============================
async function fetchDashboardData() {
  if (!authToken) return showLogin();

  try {
    // Fetch user profile and their attendance history simultaneously
    const [userRes, attendanceRes] = await Promise.all([
      fetch(`${API_URL}/api/students/me`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
      fetch(`${API_URL}/api/attendance/me`, { headers: { 'Authorization': `Bearer ${authToken}` } })
    ]);

    if (!userRes.ok || !attendanceRes.ok) throw new Error("Session expired. Please log in again.");

    const userData = await userRes.json();
    const attendanceData = await attendanceRes.json();
    
    populateUI(userData, attendanceData);
    showDashboard(); // This is the function that changes the page
  } catch (error) {
    showNotification(error.message, "error");
    handleLogout();
  }
}

function populateUI(userData, attendanceData) {
  // This robust version checks if an element exists before trying to change it.
  
  // Populate header
  const welcomeUserEl = document.getElementById('welcomeUser');
  if (welcomeUserEl) welcomeUserEl.textContent = userData.name;

  const userDetailsEl = document.getElementById('userDetails');
  if (userDetailsEl) userDetailsEl.textContent = userData.student_id_str;

  const userAvatarEl = document.getElementById('userAvatar');
  if (userAvatarEl) {
    const nameParts = userData.name.split(' ');
    const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : nameParts[0].substring(0, 2);
    userAvatarEl.textContent = initials.toUpperCase();
  }
  
  // Populate hero section
  const welcomeHeroEl = document.getElementById('welcomeUser-hero');
  if (welcomeHeroEl) welcomeHeroEl.textContent = `Welcome, ${userData.name}`;

  const roleHeroEl = document.getElementById('userRole-hero');
  if (roleHeroEl) roleHeroEl.textContent = `${userData.student_id_str} Student`;
}

// ===============================
// UI Helpers
// ===============================
function showDashboard() {
  const loginPage = document.getElementById("loginPage");
  const dashboardPage = document.getElementById("dashboardPage");
  
  // These checks prevent the script from crashing if an element isn't found
  if (loginPage) loginPage.style.display = "none";
  if (dashboardPage) dashboardPage.style.display = "block";
  
  navigateTo('dashboardView'); // Default to the main dashboard view on login
}

function showLogin() {
  const loginPage = document.getElementById("loginPage");
  const dashboardPage = document.getElementById("dashboardPage");
  if (loginPage) loginPage.style.display = "flex";
  if (dashboardPage) dashboardPage.style.display = "none";
}

function updateCurrentTime() {
    const now = new Date();
    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');
    if (dateEl) dateEl.textContent = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    if (timeEl) timeEl.textContent = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function showNotification(message, type = "error") {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement("div");
  notification.className = `notification notification-${type} show`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => { 
    notification.classList.remove('show'); 
    setTimeout(() => notification.remove(), 500); 
  }, 4000);
}

